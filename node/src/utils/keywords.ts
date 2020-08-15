import { PrismaClient } from "@prisma/client";

import * as punctuation from "../assets/function-words/punctuation.json";
import * as wordsFi from "../assets/function-words/function-words-fi.json";
import * as wordsEn from "../assets/function-words/function-words-en.json";
import { Skill } from "../interfaces";

export const GENERAL_REPEAT_MULTIPLIER = 4;
export const SKILL_REPEAT_MULTIPLIER = 4;

const punctuationPattern = new RegExp(punctuation.join("|"), "gi");
const allWords = wordsFi.concat(wordsEn);
const wordPattern = new RegExp(`\\s{1}(${ allWords.join("|") })(?=\\s{1})`, "gi");
const whitespacePattern = new RegExp("\\s+", "gi");

export const argsToKeywords = (...args: Array<string>): string => {
    return applyRegex(args.join(" ").toLowerCase());
};

const skillsToKeywords = (skills: Array<Skill>): string => {
    return skills.map(skill => `${ skill.name } `.repeat(skill.level * SKILL_REPEAT_MULTIPLIER)).join(" ");
};

export const positionToKeywords = (position: { name: string, description: string, skills: Array<Skill>  }) => {
    return argsToKeywords(
        `${ position.name } `.repeat(GENERAL_REPEAT_MULTIPLIER),
        position.description,
        skillsToKeywords(position.skills)
    );
};

export const projectToKeywords = (project: { name: string, description: string }) => {
    return argsToKeywords(
        project.name,
        project.description
    );
}

export const experienceToKeywords = (experience: {
    name: string, customer: string, position: string, description: string, skills: Array<string>
}) => {
    return argsToKeywords(
        experience.name,
        `${ experience.customer } `.repeat(GENERAL_REPEAT_MULTIPLIER),
        `${ experience.position } `.repeat(GENERAL_REPEAT_MULTIPLIER),
        `${ experience.skills.join(" ") } `.repeat(SKILL_REPEAT_MULTIPLIER),
        experience.description
    );
};

const employeeToKeywords = (employee: { preferences: string, skills: Array<Skill> }) => {
    return argsToKeywords(
        employee.preferences,
        skillsToKeywords(employee.skills)
    );
};

export const updateEmployeeKeywords = async (prisma: PrismaClient, employeeId: number) => {
    const employee = await prisma.employee.findOne({
        where: { id: employeeId },
        select: {
            preferences: true,
            skills: {
                select: {
                    name: true,
                    level: true
                }
            },
            experience: {
                select: {
                    keywords: true
                }
            }
        }
    });

    const experienceKeywords = employee.experience.map(experience => experience.keywords).join(" ");
    const employeeKeywords = employeeToKeywords(employee);

    await prisma.employee.update({
        where: { id: employeeId },
        data: { keywords: [experienceKeywords, employeeKeywords].join(" ") }
    });
};

const applyRegex = (inputString: string): string => {
    inputString = ` ${ inputString } `;
    return inputString
        .replace(punctuationPattern, "")
        .replace(wordPattern, " ")
        .replace(whitespacePattern, " ").trim();
};
