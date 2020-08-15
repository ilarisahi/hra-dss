import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import { getUser } from "../utils/authorization";
import { YogaContext } from "../interfaces";
import { projectToKeywords, positionToKeywords, updateEmployeeKeywords, experienceToKeywords } from "../utils/keywords";

export const login = async (parent, args, context: YogaContext, info) => {
    const user = await context.prisma.user.findOne({ where: { email: args.email } });
    if (!user) {
        throw new Error("User not found.");
    }

    const valid = await bcrypt.compare(args.password, user.hash);
    if (!valid) {
      throw new Error("Invalid password.");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    context.response.cookie(process.env.JWT_COOKIE_NAME, token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        signed: true,
    });

    return user;
};

export const projectCreateUpdate = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const updateData = {
        name: args.name,
        description: args.description,
        startDate: args.startDate,
        endDate: args.endDate,
        draft: args.draft,
        keywords: "",
    };

    updateData.keywords = projectToKeywords(updateData);

    if (args.id) {
        return context.prisma.project.update({
            where: {
                id: parseInt(args.id),
            },
            data: updateData,
        });
    } else {
        const createData = {
            ...updateData,
            createdBy: { connect: { id: user.id } },
        };
        return context.prisma.project.create({
            data: createData,
        });
    }
};

export const projectDelete = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);
    const projectId = parseInt(args.id);

    // Delete positions, skills and allocations related to this project
    await context.prisma.allocation.deleteMany({ where: { projectId: projectId } });
    await context.prisma.positionSkill.deleteMany({ where: { position: { projectId: projectId } } });
    await context.prisma.projectPosition.deleteMany({ where: { projectId: projectId } });
    return context.prisma.project.delete({ where: { id: projectId } });
};

export const projectPositionCreateUpdate = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const newSkills = [];
    const existingSkills = []
    const skillIds = [];

    args.skills.forEach(skill => {
        if (skill.id) {
            existingSkills.push(skill);
            skillIds.push(parseInt(skill.id));
        } else {
            newSkills.push(skill);
        }
    });

    const updateData = {
        name: args.name,
        description: args.description,
        startDate: args.startDate,
        endDate: args.endDate,
        skills: { create: newSkills },
        keywords: "",
    };

    updateData.keywords = positionToKeywords({
        name: updateData.name,
        description: updateData.description,
        skills: args.skills
    });

    if (args.id) {
        const positionId = parseInt(args.id);

        // Delete skills that have been removed
        await context.prisma.positionSkill.deleteMany({
            where: { positionId: positionId, NOT: { id: { in: skillIds} } }
        });

        // Update existing skills
        await Promise.all(existingSkills.map(skill => {
            const skillId = parseInt(skill.id);
            delete skill.id;
            return context.prisma.positionSkill.update({
                where: { id: skillId }, data: skill
            });
        }));

        return context.prisma.projectPosition.update({
            where: {
                id: positionId,
            },
            data: updateData,
        });
    } else {
        const createData = {
            ...updateData,
            project: { connect: { id: parseInt(args.projectId) } }
        };
        return context.prisma.projectPosition.create({
            data: createData,
        });
    }
};

export const projectPositionDelete = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);
    const positionId = parseInt(args.id);

    // Delete skills related to this position
    await context.prisma.positionSkill.deleteMany({ where: { positionId: positionId } });
    return context.prisma.projectPosition.delete({ where: { id: positionId } });
};

export const employeeCreateUpdate = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const newSkills = [];
    const existingSkills = []
    const skillIds = [];

    args.skills.forEach(skill => {
        if (skill.id) {
            existingSkills.push(skill);
            skillIds.push(parseInt(skill.id));
        } else {
            newSkills.push(skill);
        }
    });

    const updateData = {
        name: args.name,
        email: args.email,
        preferences: args.preferences,
        keywords: "",
        skills: { create: newSkills },
    };

    let employee;
    if (args.id) {
        const employeeId = parseInt(args.id);

        // Delete skills that have been removed
        await context.prisma.employeeSkill.deleteMany({
            where: { employeeId: employeeId, NOT: { id: { in: skillIds} } }
        });

        // Update existing skills
        await Promise.all(existingSkills.map(skill => {
            const skillId = parseInt(skill.id);
            delete skill.id;
            return context.prisma.employeeSkill.update({
                where: { id: skillId }, data: skill
            });
        }));

        employee = await context.prisma.employee.update({
            where: {
                id: employeeId,
            },
            data: updateData,
        });
    } else {
        employee = await context.prisma.employee.create({
            data: updateData,
        });
    }

    updateEmployeeKeywords(context.prisma, employee.id);
    return employee;
};

export const employeeDelete = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);
    const employeeId = parseInt(args.id);

    // Delete skills, experiences and allocations related to this employee
    await context.prisma.allocation.deleteMany({ where: { employeeId: employeeId } });
    await context.prisma.employeeSkill.deleteMany({ where: { employeeId: employeeId } });
    await context.prisma.employeeExperience.deleteMany({ where: { employeeId: employeeId } });
    return context.prisma.employee.delete({ where: { id: employeeId } });
};

export const employeeExperienceCreateUpdate = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const updateData = {
        name: args.name,
        customer: args.customer,
        position: args.position,
        description: args.description,
        skills: { set: args.skills },
        startDate: args.startDate,
        endDate: args.endDate,
        keywords: "",
    }

    updateData.keywords = experienceToKeywords({
        name: updateData.name,
        customer: updateData.customer,
        position: updateData.position,
        description: updateData.description,
        skills: args.skills
    });

    let experience;
    if (args.id) {
        experience = await context.prisma.employeeExperience.update({
            where: {
                id: parseInt(args.id),
            },
            data: updateData,
        });
    } else {
        const createData = {
            ...updateData,
            employee: { connect: { id: parseInt(args.employeeId) } },
        };
        experience = await context.prisma.employeeExperience.create({
            data: createData,
        });
    }

    updateEmployeeKeywords(context.prisma, experience.employeeId);
    return experience;
};

export const employeeExperienceDelete = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const experience = await context.prisma.employeeExperience.delete({ where: { id: parseInt(args.id) } });
    updateEmployeeKeywords(context.prisma, experience.employeeId);
    return experience
};

export const allocationCreateUpdate = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    const updateData = {
        employee: { connect: { id: parseInt(args.employeeId) } },
        position: args.position,
        capacity: args.capacity,
        startDate: args.startDate,
        endDate: args.endDate,
        draft: args.draft
    }

    if (args.id) {
        return context.prisma.allocation.update({
            where: {
                id: parseInt(args.id),
            },
            data: updateData,
        });
    } else {
        const createData = {
            ...updateData,
            project: { connect: { id: parseInt(args.projectId) } }
        }
        return context.prisma.allocation.create({
            data: createData
        });
    }
};

export const allocationDelete = async (parent, args, context: YogaContext, info) => {
    const user = await getUser(context);

    return context.prisma.allocation.delete({ where: { id: parseInt(args.id) } });
};
