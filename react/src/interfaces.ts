import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export interface LoginInput {
    email: string
    password: string
};

export interface LoginResponse {
    login: User
};

export interface SkillLibraryResponse {
    skillLibrary: Array<String>
}

export interface User {
    name: string
    email: string
    role: string
};

export interface AllProjectsResponse {
    projects: Array<MinProject>
};

export interface MinProject {
    id: string,
    name: string,
    createdAt: string
};

export interface IdInput {
    id: string
};

export interface ProjectByIdResponse {
    project: Project
};

export interface Project {
    id: string
    name: string
    description: string
    startDate: string
    endDate: string
    draft: boolean
    createdAt: string
    positions: Array<ProjectPosition>
    allocations: Array<Allocation>
};

export interface ProjectPosition {
    id: string
    name: string
    description: string
    startDate: string
    endDate: string
    skills: Array<PositionSkill>
};

export interface PositionSkill {
    id: string
    name: string
    level: number
    compulsory: boolean
};

export interface ProjectInput {
    id?: string
    name: string
    description: string
    startDate: MaterialUiPickersDate | string | null
    endDate: MaterialUiPickersDate | string | null
    draft: boolean
};

export interface ProjectResponse {
    projectCreateUpdate: Project
};

export interface ProjectDeleteResponse {
    projectDelete: {
        id: string
    }
};

export interface ProjectPositionInput {
    id?: string
    projectId?: string
    name: string
    description: string
    startDate: MaterialUiPickersDate | string | null
    endDate: MaterialUiPickersDate | string | null
    skills: Array<PositionSkillInput>
};

export interface PositionSkillInput {
    id?: string
    name: string
    level: number
    compulsory: boolean
}

export interface ProjectPositionResponse {
    projectPositionCreateUpdate: ProjectPosition
}

export interface ProjectPositionDeleteResponse {
    projectPositionDelete: {
        id: string
    }
}

export interface AllEmployeesResponse {
    employees: Array<MinEmployee>
};

export interface MinEmployee {
    id: string,
    name: string,
    email: string
};

export interface EmployeeByIdResponse {
    employee: Employee
};

export interface Employee {
    id: string
    name: string
    email: string
    preferences: string
    createdAt: string
    skills: Array<EmployeeSkill>
    experience: Array<EmployeeExperience>
    allocations: Array<Allocation>
};

export interface EmployeeSkill {
    id: string
    name: string
    level: number
};

export interface EmployeeExperience {
    id: string
    name: string
    customer: string
    position: string
    description: string
    skills: Array<string>
    startDate: string
    endDate: string
};

export interface Allocation {
    id: string
    position: string
    capacity: number
    startDate: string
    endDate: string
    project: MinProject
    employee: MinEmployee
    draft: boolean
};

export interface EmployeeInput {
    id?: string
    name: string
    email: string
    preferences: string
    skills: Array<EmployeeSkillInput>
};

export interface EmployeeSkillInput {
    id?: string
    name: string
    level: number
};

export interface EmployeeResponse {
    employeeCreateUpdate: Employee
};

export interface EmployeeDeleteResponse {
    employeeDelete: {
        id: string
    }
};

export interface EmployeeExperienceInput {
    id?: string
    employeeId?: string
    name: string
    customer: string
    position: string
    description: string
    skills: Array<string>
    startDate: MaterialUiPickersDate | string | null
    endDate: MaterialUiPickersDate | string | null
};

export interface EmployeeExperienceResponse {
    employeeExperienceCreateUpdate: EmployeeExperience
};

export interface EmployeeExperienceDeleteResponse {
    employeeExperienceDelete: {
        id: string
    }
};

export interface AllocationInput {
    id?: string
    projectId?: string
    employeeId?: string | null
    position: string
    capacity: number | string
    startDate: MaterialUiPickersDate | string | null
    endDate: MaterialUiPickersDate | string | null
    draft: boolean
};

export interface AllocationResponse {
    allocationCreateUpdate: Allocation
};

export interface AllocationDeleteResponse {
    allocationDelete: {
        id: string
    }
};

export interface ProjectSearchEmployeeResult {
    score: number,
    employee: {
        id: string,
        name: string,
        skills: Array<{ name: string, level: number }>
    }
};

export interface ProjectSearchResponse {
    projectSearch: Array<ProjectSearchEmployeeResult>
};

export interface ProjectSearchByPositionResponse {
    projectSearchByPosition: Array<{
        position: { id: string, name: string },
        employees: Array<ProjectSearchEmployeeResult>
    }>
};
