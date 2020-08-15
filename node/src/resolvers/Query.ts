import * as fs from "fs";
import * as util from "util";
import * as qm from "qminer";
import { Employee } from "@prisma/client";

import { argsToKeywords } from "../utils/keywords";
import { getUser } from "../utils/authorization";
import { YogaContext, EmployeeScoreResponse } from "../interfaces";

export const logout = (parent, args, context: YogaContext, info) => {
    context.response.clearCookie(process.env.JWT_COOKIE_NAME);
    return true;
};

export const authenticate = (parent, args, context: YogaContext) => {
    return getUser(context);
};

export const project = (parent, args, context: YogaContext) => {
    return context.prisma.project.findOne({ where: { id: parseInt(args.id) } });
};

export const projects = (parent, args, context: YogaContext) => {
    return context.prisma.project.findMany();
};

export const employee = (parent, args, context: YogaContext) => {
    return context.prisma.employee.findOne({ where: { id: parseInt(args.id) } });
};

export const employees = (parent, args, context: YogaContext) => {
    return context.prisma.employee.findMany();
};

export const skillLibrary = async () => {
    const readFileFunc = util.promisify(fs.readFile);
    const skills = await readFileFunc("./src/assets/skills.json");
    return JSON.parse(skills.toString());
};

export const projectSearch = async (parent, args, context: YogaContext) => {
    const limit = args.limit;
    const project = await context.prisma.project.findOne({ where: { id: parseInt(args.projectId) } });
    const employees = await context.prisma.employee.findMany();

    const base = new qm.Base({
        dbPath: process.env.QMINER_PATH,
        mode: "createClean",
        schema: [{ name: "employees",
            fields: [{ name: "keywords", type: "string" }]
        }]
    });

    const featureSpace = new qm.FeatureSpace(
        base,
        {
            type: "text",
            source: "employees",
            field: "keywords",
            tokenizer: {
                type: "unicode",
                stopwords: "none",
                stemmer: "porter",
                uppercase: false
            }
        }
    );

    const employeeStore = base.store("employees");
    employees.forEach(employee => {
        employeeStore.push({ keywords: employee.keywords });
    });

    featureSpace.updateRecords(employeeStore.allRecords);

    const query = employeeStore.newRecord({ keywords: project.keywords });
    const vector = featureSpace.extractSparseVector(query);
    const matrix = featureSpace.extractSparseMatrix(employeeStore.allRecords);
    const score = matrix.multiplyT(vector);

    base.close();

    const responseArray: Array<EmployeeScoreResponse> = score.toArray().map((score, index) => {
        return { score: score, employee: employees[index] };
    });

    return responseArray.sort((a, b) => b.score - a.score).slice(0, limit);
};

export const projectSearchByPosition = async (parent, args, context: YogaContext) => {
    // Create base for all employees
    const base = new qm.Base({
        dbPath: process.env.QMINER_PATH,
        mode: "createClean",
        schema: [{ name: "employees",
            fields: [{ name: "keywords", type: "string" }]
        }]
    });

    const featureSpace = new qm.FeatureSpace(
        base,
        {
            type: "text",
            source: "employees",
            field: "keywords",
            tokenizer: {
                type: "unicode",
                stopwords: "none",
                stemmer: "porter",
                uppercase: false
            }
        }
    );

    const employeeStore = base.store("employees");

    const updateFeatureSpace = (employees: Array<Employee>) => {
        employeeStore.clear();
        employees.forEach(employee => {
            employeeStore.push({ keywords: employee.keywords });
        });
        featureSpace.updateRecords(employeeStore.allRecords);
    };

    const limit = args.limit;
    const project = await context.prisma.project.findOne({
        where: { id: parseInt(args.projectId) },
        select: {
            positions: {
                include: {
                    skills: true
                }
            }
        }
    });
    const employees = await context.prisma.employee.findMany();

    const responseArray = [];

    // Search employees for each position individually
    for (const position of project.positions) {
        const query = employeeStore.newRecord({ keywords: position.keywords });
        const compulsorySkills = position.skills.filter(skill => skill.compulsory);

        // If position has compulsory skills, get only employees that possess those skills
        let filteredEmployees;
        if (compulsorySkills.length > 0) {
            filteredEmployees = await context.prisma.employee.findMany({
                where: {
                    AND: compulsorySkills.map(skill => {
                        return { keywords: { contains: ` ${ argsToKeywords(skill.name) } ` } }
                    })
                }
            });

            // If no employees match compulsory skills, go to next position
            if (filteredEmployees.length === 0) {
                responseArray.push({ position: position, employees: [] });
                continue;
            }

            updateFeatureSpace(filteredEmployees);
        } else {
            updateFeatureSpace(employees);
        }

        const vector = featureSpace.extractSparseVector(query);
        const matrix = featureSpace.extractSparseMatrix(employeeStore.allRecords);
        const score = matrix.multiplyT(vector);

        const resultArray: Array<EmployeeScoreResponse> = score.toArray().map((score, index) => {
            return { score: score, employee: filteredEmployees ? filteredEmployees[index] : employees[index] };
        });

        const sortedArray = resultArray.sort((a, b) => b.score - a.score).slice(0, limit);
        responseArray.push({ position: position, employees: sortedArray });

    }

    base.close();

    return responseArray;
};
