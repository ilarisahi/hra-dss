import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQuery, ApolloCache, Reference, useMutation } from "@apollo/client";
import { Box, Button, Icon, Typography, Chip, Grid, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Paper, Badge } from "@material-ui/core";

import { EmployeeExperience, EmployeeByIdResponse, IdInput, EmployeeDeleteResponse, EmployeeExperienceDeleteResponse } from "../interfaces";
import { useGlobalStyles } from "../utils/global";
import { EMPLOYEE_BY_ID_QUERY } from "../graphql/queries";
import { EMPLOYEE_DELETE_MUTATION, EXPERIENCE_DELETE_MUTATION } from "../graphql/mutations";
import NotFound from "./NotFound";
import Loading from "./Loading";
import EmployeeForm from "./EmployeeForm";
import ExperienceForm from "./ExperienceForm";
import { getDateRangeText } from "../utils/misc";
import Timeline from "./Timeline";

const Employee = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();
    const globalClasses = useGlobalStyles();
    const [employeeState, setEmployeeState] = useState("view");
    const [selectedExperience, setSelectedExperience] = useState<EmployeeExperience | undefined>(undefined);
    
    const { employeeId } = useParams();
    const { data: employeeData, loading: employeeLoading, error: employeeError } = useQuery<EmployeeByIdResponse, IdInput>
        (EMPLOYEE_BY_ID_QUERY, { variables: { id: employeeId }});

    const handleEmployeeDeleteUpdate = (
        cache: ApolloCache<EmployeeDeleteResponse>,
        { data }: { data?: EmployeeDeleteResponse | null | undefined }
    ) => {
        if (!data) return;
        // Remove deleted object also from Apollo's cache
        cache.modify({
            fields: {
                employees(existingEmployees: Reference[] = [], { readField }) {
                    return existingEmployees.filter(employeeRef => {
                        return data.employeeDelete.id !== readField("id", employeeRef);
                    });
                }
            }
        });
        cache.evict({ id: cache.identify({ id: data.employeeDelete.id, __typename: "Employee" }) });
    };

    const handleEmployeeDelete = () => {
        deleteEmployeeMutation({ variables: { id: employeeId } }).then(() => {
            enqueueSnackbar(t("alert.employee-delete-success"), { variant: "success" });
            history.push("/employees");
        }).catch(error => console.log(error));
    };

    const [deleteEmployeeMutation, { loading: deleteEmployeeLoading }] =
        useMutation<EmployeeDeleteResponse, IdInput>(EMPLOYEE_DELETE_MUTATION, { update: handleEmployeeDeleteUpdate });

    const handleExperienceDeleteUpdate = (
        cache: ApolloCache<EmployeeExperienceDeleteResponse>,
        { data }: { data?: EmployeeExperienceDeleteResponse | null | undefined }
    ) => {
        if (!data || !employeeData) return;
        // Remove deleted object also from Apollo's cache
        cache.modify({
            id: cache.identify({ id: employeeId, __typename: "Employee" }),
            fields: {
                experience(existingExperience: Reference[] = [], { readField }) {
                    return existingExperience.filter(experienceRef => {
                        return data.employeeExperienceDelete.id !== readField("id", experienceRef);
                    });
                }
            }
        });
        cache.evict({ id: cache.identify({ id: data.employeeExperienceDelete.id, __typename: "EmployeeExperience" }) });
    }

    const [deleteExperienceMutation, { loading: deleteExperienceLoading }] =
        useMutation<EmployeeExperienceDeleteResponse, IdInput>(EXPERIENCE_DELETE_MUTATION, { update: handleExperienceDeleteUpdate });

    const handleExperienceDelete = (experienceId: string) => {
        deleteExperienceMutation({ variables: { id: experienceId } }).then(() => {
            enqueueSnackbar(t("alert.experience-delete-success"), { variant: "success" });
        }).catch(error => console.log(error));
    };

    const handleBackClick = () => {
        history.push("/employees");
    };

    const handleCancelClick = () => {
        setEmployeeState("view");
    };

    if (employeeLoading) {
        return <Loading />
    }

    if (employeeError || !employeeData?.employee) {
        return <NotFound />
    }

    // Return different view depending on employeeState
    if (employeeState === "editEmployee") {
        return (
            <Box mt="1em" mb="1em">
                <Button
                    variant="contained"
                    startIcon={ <Icon>keyboard_arrow_left</Icon> }
                    onClick={ handleCancelClick }
                    className={ globalClasses.backButton }
                >
                    { t("label.back") }
                </Button>
                <EmployeeForm employee={ employeeData.employee } setEmployeeState={ setEmployeeState } />
            </Box>
        );
    } else if (employeeState === "editExperience") {
        return (
            <Box mt="1em" mb="1em">
                <Button
                    variant="contained"
                    startIcon={ <Icon>keyboard_arrow_left</Icon> }
                    onClick={ handleCancelClick }
                    className={ globalClasses.backButton }
                >
                    { t("label.back") }
                </Button>
                { selectedExperience ?
                    <ExperienceForm employeeId={ employeeId } experience={ selectedExperience } setEmployeeState={ setEmployeeState } /> :
                    <ExperienceForm employeeId={ employeeId } setEmployeeState={ setEmployeeState } />
                }
            </Box>
        );
    } else {
        // "view" state
        return (
            <Box mt="1em" mb="1em" display="flex" flexDirection="column">
                <Button
                    variant="contained"
                    startIcon={ <Icon>keyboard_arrow_left</Icon> }
                    onClick={ handleBackClick }
                    className={ globalClasses.backButton }
                >
                    { t("label.back") }
                </Button>
                <Paper className={ globalClasses.paperContainer }>
                    <Timeline allocations={ employeeData.employee.allocations } />
                </Paper>
                <Paper className={ globalClasses.paperContainer }>
                    <Typography variant="h6" component="h2">
                        { employeeData.employee.name }
                    </Typography>
                    <Typography variant="body2" color="textSecondary" className={ globalClasses.bottomMargin }>
                        { employeeData.employee.email }
                    </Typography>
                    <Typography variant="body1" className={ globalClasses.textBold } gutterBottom>
                        { t("label.preferences") }
                    </Typography>
                    <Typography variant="body1" className={ globalClasses.bottomMargin }>
                        { employeeData.employee.preferences !== "" ? employeeData.employee.preferences : t("alert.no-preferences") }
                    </Typography>
                    <Typography variant="body1" className={ globalClasses.textBold } gutterBottom>
                        { t("label.skills") }
                    </Typography>
                    { employeeData.employee.skills.length === 0 &&
                        <Typography variant="body1" className={ globalClasses.bottomMargin }>
                            {  t("alert.no-skills") }
                        </Typography>
                    }
                    { employeeData.employee.skills.length > 0 &&
                        <Box className={ [globalClasses.chipContainer, globalClasses.bottomMargin].join(" ") }>
                            { employeeData.employee.skills.map((skill, index) => (
                                <Badge
                                    key={ index }
                                    badgeContent={ skill.level.toFixed(2) }
                                    color="primary"
                                >
                                    <Chip
                                        variant="outlined"
                                        color="primary"
                                        label={ skill.name }
                                    />
                                </Badge>
                            )) }
                        </Box>
                    }
                    <Grid container spacing={ 3 }>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={ <Icon>edit</Icon> }
                                onClick={ () => setEmployeeState("editEmployee") }
                            >
                                { t("label.edit-employee") }
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={ <Icon>delete</Icon> }
                                onClick={ handleEmployeeDelete }
                                disabled={ deleteEmployeeLoading }
                            >
                                { t("label.delete") }
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper className={ globalClasses.paperContainer }>
                    <Grid container spacing={ 3 }>
                        <Grid item>
                            <Typography variant="h6" component="h3">
                                { t("label.experience") }
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={ <Icon>add</Icon> }
                                onClick={ () => {
                                    setSelectedExperience(undefined);
                                    setEmployeeState("editExperience");
                                } }
                            >
                                { t("label.add-experience") }
                            </Button>
                        </Grid>
                    </Grid>
                    { employeeData.employee.experience.length === 0 && 
                        <Typography variant="body1" gutterBottom className={ globalClasses.topMargin }>
                            { t("alert.no-experience") }
                        </Typography>
                    }
                    { employeeData.employee.experience.length > 0 &&
                        <List>
                            { employeeData.employee.experience.map((experience, index) => (
                                <Fragment key={ index }>
                                    <ListItem className={ globalClasses.customListItem }>
                                        <ListItemText disableTypography
                                            primary={
                                                <Typography variant="body1" className={ globalClasses.textBold } gutterBottom>
                                                    { experience.name }
                                                </Typography>
                                            }
                                            secondary={
                                                <Fragment>
                                                    { (experience.startDate || experience.endDate) &&
                                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                                            { getDateRangeText(experience.startDate, experience.endDate) }
                                                        </Typography>
                                                    }
                                                    { experience.customer && experience.customer !== "" &&
                                                        <Typography variant="body2" gutterBottom>
                                                            <b>{ t("label.customer") }:</b> { experience.customer }
                                                        </Typography>
                                                    }
                                                    { experience.position && experience.position !== "" &&
                                                        <Typography variant="body2" gutterBottom>
                                                            <b>{ t("label.position") }:</b> { experience.position }
                                                        </Typography>
                                                    }
                                                    { experience.description && experience.description !== "" &&
                                                        <Typography variant="body1" gutterBottom>
                                                            { experience.description }
                                                        </Typography>
                                                    }
                                                    { experience.skills.length > 0 &&
                                                        <Box className={ globalClasses.chipContainerNoLevel }>
                                                            { experience.skills.map((skill, index) => (
                                                                <Chip
                                                                    key={ index }
                                                                    label={ skill }
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            )) }
                                                        </Box>
                                                    }
                                                </Fragment>
                                            }
                                        />
                                        <ListItemSecondaryAction className={ globalClasses.customListItemActions }>
                                            <Fragment>
                                                <IconButton
                                                    aria-label="edit"
                                                    disabled={ deleteExperienceLoading }
                                                    onClick={ () => {
                                                        setSelectedExperience(experience);
                                                        setEmployeeState("editExperience");
                                                    } }
                                                >
                                                    <Icon>edit</Icon>
                                                </IconButton>
                                                <IconButton
                                                    aria-label="delete"
                                                    disabled={ deleteExperienceLoading }
                                                    onClick={ () => handleExperienceDelete(experience.id) }
                                                >
                                                    <Icon>delete</Icon>
                                                </IconButton>
                                            </Fragment>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    { index !== employeeData.employee.experience.length - 1 &&
                                        <Divider component="li" />
                                    }
                                </Fragment>
                            )) }
                        </List>
                    }
                </Paper>
            </Box>
        );
    }
};

export default Employee;
