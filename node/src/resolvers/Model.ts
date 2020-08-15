import { YogaContext } from "../interfaces";

export const Project = {
    positions: (parent, args, context: YogaContext) => {
        return context.prisma.project.findOne({ where: { id: parent.id } }).positions();
    },
    allocations: (parent, args, context: YogaContext) => {
        return context.prisma.project.findOne({ where: { id: parent.id } }).allocations();
    },
};

export const ProjectPosition = {
    skills: (parent, args, context: YogaContext) => {
        return context.prisma.projectPosition.findOne({ where: { id: parent.id } }).skills();
    },
};

export const Employee = {
    skills: (parent, args, context: YogaContext) => {
        return context.prisma.employee.findOne({ where: { id: parent.id } }).skills();
    },
    experience: (parent, args, context: YogaContext) => {
        return context.prisma.employee.findOne({ where: { id: parent.id } }).experience();
    },
    allocations: (parent, args, context: YogaContext) => {
        return context.prisma.employee.findOne({ where: { id: parent.id } }).allocations();
    },
};

export const Allocation = {
    employee: (parent, args, context: YogaContext) => {
        return context.prisma.allocation.findOne({ where: {id: parent.id } }).employee();
    },
    project: (parent, args, context: YogaContext) => {
        return context.prisma.allocation.findOne({ where: { id: parent.id } }).project();
    },
}
