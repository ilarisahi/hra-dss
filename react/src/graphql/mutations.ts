import { gql } from "@apollo/client";
import { projectFragment, projectPositionFragment, employeeFragment, employeeExperienceFragment, allocationFragment } from "./fragments";

export const LOGIN_MUTATION = gql`
    mutation LoginMutation(
        $email: String!,
        $password: String!
    ) {
        login (
            email: $email,
            password: $password
        ) {
            name
            email
            role
        }
    }
`;

export const PROJECT_CREATE_UPDATE_MUTATION = gql`
    mutation ProjectCreateUpdateMutation(
        $id: ID,
        $name: String!,
        $description: String,
        $draft: Boolean!,
        $startDate: DateScalar,
        $endDate: DateScalar
    ) {
        projectCreateUpdate (
            id: $id,
            name: $name,
            description: $description,
            draft: $draft,
            startDate: $startDate,
            endDate: $endDate
        ) {
            ...ProjectFragment
        }
    }
    ${ projectFragment }
`;

export const PROJECT_DELETE_MUTATION = gql`
    mutation ProjectDeleteMutation(
        $id: ID!
    ) {
        projectDelete (
            id: $id
        ) {
            id
        }
    }
`;

export const POSITION_CREATE_UPDATE_MUTATION = gql`
    mutation ProjectPositionCreateUpdateMutation(
        $id: ID,
        $projectId: ID!,
        $name: String!,
        $description: String,
        $startDate: DateScalar,
        $endDate: DateScalar,
        $skills: [PositionSkillInput!]!
    ) {
        projectPositionCreateUpdate (
            id: $id,
            projectId: $projectId,
            name: $name,
            description: $description,
            startDate: $startDate,
            endDate: $endDate,
            skills: $skills
        ) {
            ...ProjectPositionFragment
        }
    }
    ${ projectPositionFragment }
`;

export const POSITION_DELETE_MUTATION = gql`
    mutation ProjectPositionDeleteMutation(
        $id: ID!
    ) {
        projectPositionDelete (
            id: $id
        ) {
            id
        }
    }
`;

export const ALLOCATION_CREATE_UPDATE_MUTATION = gql`
    mutation AllocationCreateUpdateMutation(
        $id: ID,
        $projectId: ID!,
        $employeeId: ID!,
        $position: String!
        $capacity: Float!
        $startDate: DateScalar!,
        $endDate: DateScalar!,
        $draft: Boolean!
    ) {
        allocationCreateUpdate (
            id: $id,
            projectId: $projectId,
            employeeId: $employeeId,
            position: $position,
            capacity: $capacity,
            startDate: $startDate,
            endDate: $endDate,
            draft: $draft
        ) {
            ...AllocationFragment
        }
    }
    ${ allocationFragment }
`;

export const ALLOCATION_DELETE_MUTATION = gql`
    mutation AllocationDeleteMutation(
        $id: ID!
    ) {
        allocationDelete (
            id: $id
        ) {
            id
        }
    }
`;

export const EMPLOYEE_CREATE_UPDATE_MUTATION = gql`
    mutation EmployeeCreateUpdateMutation(
        $id: ID,
        $name: String!,
        $email: String!,
        $preferences: String,
        $skills: [EmployeeSkillInput!]!
    ) {
        employeeCreateUpdate (
            id: $id,
            name: $name,
            email: $email,
            preferences: $preferences,
            skills: $skills
        ) {
            ...EmployeeFragment
        }
    }
    ${ employeeFragment }
`;

export const EMPLOYEE_DELETE_MUTATION = gql`
    mutation ProjectDeleteMutation(
        $id: ID!
    ) {
        employeeDelete (
            id: $id
        ) {
            id
        }
    }
`;

export const EXPERIENCE_CREATE_UPDATE_MUTATION = gql`
    mutation EmployeeExperienceCreateUpdateMutation(
        $id: ID,
        $employeeId: ID!,
        $name: String!,
        $customer: String,
        $position: String,
        $description: String,
        $skills: [String!]!,
        $startDate: DateScalar,
        $endDate: DateScalar,
    ) {
        employeeExperienceCreateUpdate (
            id: $id,
            employeeId: $employeeId,
            name: $name,
            customer: $customer,
            position: $position,
            description: $description,
            skills: $skills,
            startDate: $startDate,
            endDate: $endDate
        ) {
            ...EmployeeExperienceFragment
        }
    }
    ${ employeeExperienceFragment }
`;

export const EXPERIENCE_DELETE_MUTATION = gql`
    mutation EmployeeExperienceDeleteMutation(
        $id: ID!
    ) {
        employeeExperienceDelete (
            id: $id
        ) {
            id
        }
    }
`;
