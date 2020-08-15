import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { useGlobalStyles } from "../utils/global";
import { AllEmployeesResponse } from "../interfaces";
import { ALL_EMPLOYEES_QUERY } from "../graphql/queries";
import { Box, Typography, Divider, List, ListItem, ListItemText, Fab, Icon, Paper } from "@material-ui/core";
import Loading from "./Loading";

const Employees = () => {
    const globalClasses = useGlobalStyles();
    const { t } = useTranslation();
    const history = useHistory();
    const { data, loading } = useQuery<AllEmployeesResponse>(ALL_EMPLOYEES_QUERY);

    const isNoEmployees = (): boolean => {
        return !data || !data.employees || data.employees.length === 0;
    };

    const handleEmployeeClick = (employeeId: string) => {
        history.push(`/employees/${ employeeId }`);
    };

    const handleCreateEmployeeClick = () => {
        history.push("/employees/new");
    }
    
    return (
        <Box mt="1em" mb="1em" display="flex" flexDirection="column">
            <Paper className={ globalClasses.paperContainer }>
                <Typography variant="h6" component="h2" gutterBottom>
                    { t("label.employees") }
                </Typography>
                <Typography variant="body1" className={ globalClasses.bottomMargin }>
                    { t("description.employees") }
                </Typography>
                <Divider />

                { loading && <Loading />}
                { !loading && isNoEmployees() &&
                    <Typography variant="body1" gutterBottom className={ globalClasses.topMargin }>
                        { t("alert.no-employees") }
                    </Typography>
                }
                { !loading && !isNoEmployees() &&
                    <List className={ globalClasses.bottomMargin }>
                        { data?.employees.map(employee => {
                            return (
                                <ListItem button onClick={ () => handleEmployeeClick(employee.id) } key={ employee.id }>
                                    <ListItemText
                                        primary={ employee.name }
                                        secondary={ `${ t("label.email") }: ${ employee.email }` }
                                    />
                                </ListItem>
                            );
                        }) }
                    </List>
                }
            </Paper>
            <Fab
                variant="extended"
                aria-label="create new employee"
                className={ [globalClasses.centerFab, globalClasses.greenButton].join(" ") }
                onClick={ handleCreateEmployeeClick }
            >
                <Icon>add</Icon>
                { t("label.create-employee" ) }
            </Fab>
        </Box>
    );
};

export default Employees;
