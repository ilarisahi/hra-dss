import { gql } from "@apollo/client";

export const positionSkillFragment = gql`
    fragment PositionSkillFragment on PositionSkill {
        id
        name
        level
        compulsory
    }
`;

export const projectPositionFragment = gql`
    fragment ProjectPositionFragment on ProjectPosition {
        id
        name
        description
        startDate
        endDate
        skills {
            ...PositionSkillFragment
        }
    }
    ${ positionSkillFragment }
`;

export const allocationFragment = gql`
    fragment AllocationFragment on Allocation {
        id
        position
        startDate
        endDate
        capacity
        draft
        project {
            id
            name
        }
        employee {
            id
            name
        }
    }
`;

export const projectFragment = gql`
    fragment ProjectFragment on Project {
        id
        name
        description
        startDate
        endDate
        draft
        createdAt
        positions {
            ...ProjectPositionFragment
        }
        allocations {
            ...AllocationFragment
        }
    }
    ${ projectPositionFragment }
    ${ allocationFragment }
`;

export const minProjectFragment = gql`
    fragment MinProjectFragment on Project {
        id
        name
        createdAt
    }
`;

export const employeeSkillFragment = gql`
    fragment EmployeeSkill on EmployeeSkill {
        id
        name
        level
    }
`;

export const employeeExperienceFragment = gql`
    fragment EmployeeExperienceFragment on EmployeeExperience {
        id
        name
        customer
        position
        description
        skills
        startDate
        endDate
    }
`;

export const employeeFragment = gql`
    fragment EmployeeFragment on Employee {
        id
        name
        email
        preferences
        createdAt
        skills {
            ...EmployeeSkill
        }
        experience {
            ...EmployeeExperienceFragment
        }
        allocations {
            ... AllocationFragment
        }
    }
    ${ employeeSkillFragment }
    ${ employeeExperienceFragment }
    ${ allocationFragment }
`;

export const minEmployeeFragment = gql`
    fragment MinEmployeeFragment on Employee {
        id
        name
        email
    }
`;
