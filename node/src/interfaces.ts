import { PrismaClient, Employee } from "@prisma/client";

export interface YogaContext {
    request: any,
    response: any,
    prisma: PrismaClient,
};

export interface Skill {
    name: string,
    level: number,
};

export interface EmployeeScoreResponse {
    score: number,
    employee: Employee,
};
