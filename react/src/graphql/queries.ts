import { gql } from "@apollo/client";
import { projectFragment, employeeFragment, minProjectFragment, minEmployeeFragment } from "./fragments";

export const AUTHENTICATE_QUERY = gql`
    {
        authenticate {
            name
            email
            role
        }
    }
`;

export const LOGOUT_QUERY = gql`
    {
        logout
    }
`;

export const SKILL_LIBRARY_QUERY = gql`
    {
        skillLibrary
    }
`;

export const ALL_PROJECTS_QUERY = gql`
    {
        projects {
            ...MinProjectFragment
        }
    }
    ${ minProjectFragment }
`;

export const PROJECT_BY_ID_QUERY = gql`
    query projectById($id: ID!) {
        project(id: $id) {
            ...ProjectFragment
        }
    }
    ${ projectFragment }
`;

export const ALL_EMPLOYEES_QUERY = gql`
    {
        employees {
            ...MinEmployeeFragment
        }
    }
    ${ minEmployeeFragment }
`;

export const EMPLOYEE_BY_ID_QUERY = gql`
    query employeeById($id: ID!) {
        employee(id: $id) {
            ...EmployeeFragment
        }
    }
    ${ employeeFragment }
`;

export const PROJECT_SEARCH = gql`
    query projectSearch($projectId: ID!, $limit: Int!) {
        projectSearch(projectId: $projectId, limit: $limit) {
            score
            employee {
                id
                name
                skills {
                    name
                    level
                }
            }
        }
    }
`;

export const PROJECT_SEARCH_BY_POSITION = gql`
    query projectSearchByPosition($projectId: ID!, $limit: Int!) {
        projectSearchByPosition(projectId: $projectId, limit: $limit) {
            position {
                id
                name
            }
            employees {
                score
                employee {
                    id
                    name
                    skills {
                        name
                        level
                    }
                }
            }
        }
    }
`;
