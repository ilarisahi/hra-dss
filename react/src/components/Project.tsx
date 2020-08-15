import React, { useState, Fragment } from "react";
import { Box, Typography, Button, Icon, Grid, IconButton, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Fab, Paper, Badge } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";
import { useQuery, useMutation, ApolloCache, Reference } from "@apollo/client";
import { useSnackbar } from "notistack";

import { ProjectByIdResponse, IdInput, ProjectDeleteResponse, ProjectPosition, ProjectPositionDeleteResponse, Allocation, AllocationDeleteResponse } from "../interfaces";
import { PROJECT_BY_ID_QUERY } from "../graphql/queries";
import Loading from "./Loading";
import NotFound from "./NotFound";
import { useGlobalStyles } from "../utils/global";
import ProjectForm from "./ProjectForm";
import { getDateRangeText } from "../utils/misc";
import { PROJECT_DELETE_MUTATION, POSITION_DELETE_MUTATION, ALLOCATION_DELETE_MUTATION } from "../graphql/mutations";
import PositionForm from "./PositionForm";
import AllocationForm from "./AllocationForm";
import Search from "./Search";

const Project = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();
    const globalClasses = useGlobalStyles();
    const [projectState, setProjectState] = useState("view");
    const [selectedPosition, setSelectedPosition] = useState<ProjectPosition | undefined>(undefined);
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | undefined>(undefined);
    
    const { projectId } = useParams();
    const { data: projectData, loading: projectLoading, error: projectError } = useQuery<ProjectByIdResponse, IdInput>
        (PROJECT_BY_ID_QUERY, { variables: { id: projectId }});

    const handleProjectDeleteUpdate = (
        cache: ApolloCache<ProjectDeleteResponse>,
        { data }: { data?: ProjectDeleteResponse | null | undefined }
    ) => {
        if (!data) return;
        // Remove deleted object also from Apollo's cache
        cache.modify({
            fields: {
                projects(existingProjects: Reference[] = [], { readField }) {
                    return existingProjects.filter(projectRef => {
                        return data.projectDelete.id !== readField("id", projectRef);
                    });
                }
            }
        });
        cache.evict({ id: cache.identify({ id: data.projectDelete.id, __typename: "Project" }) });
    };

    const handleProjectDelete = () => {
        deleteProjectMutation({ variables: { id: projectId } }).then(() => {
            enqueueSnackbar(t("alert.project-delete-success"), { variant: "success" });
            history.push("/projects");
        }).catch(error => console.log(error));
    };

    const [deleteProjectMutation, { loading: deleteProjectLoading }] =
        useMutation<ProjectDeleteResponse, IdInput>(PROJECT_DELETE_MUTATION, { update: handleProjectDeleteUpdate });

    const handlePositionDeleteUpdate = (
        cache: ApolloCache<ProjectPositionDeleteResponse>,
        { data }: { data?: ProjectPositionDeleteResponse | null | undefined }
    ) => {
        if (!data || !projectData) return;
        // Remove deleted object also from Apollo's cache
        cache.modify({
            id: cache.identify({ id: projectId, __typename: "Project" }),
            fields: {
                positions(existingPositions: Reference[] = [], { readField }) {
                    return existingPositions.filter(positionRef => {
                        return data.projectPositionDelete.id !== readField("id", positionRef);
                    });
                }
            }
        });
        cache.evict({ id: cache.identify({ id: data.projectPositionDelete.id, __typename: "ProjectPosition" }) });
    }

    const [deletePositionMutation, { loading: deletePositionLoading }] =
        useMutation<ProjectPositionDeleteResponse, IdInput>(POSITION_DELETE_MUTATION, { update: handlePositionDeleteUpdate });

    const handlePositionDelete = (positionId: string) => {
        deletePositionMutation({ variables: { id: positionId } }).then(() => {
            enqueueSnackbar(t("alert.position-delete-success"), { variant: "success" });
        }).catch(error => console.log(error));
    };

    const handleAllocationDeleteUpdate = (
        cache: ApolloCache<AllocationDeleteResponse>,
        { data }: { data?: AllocationDeleteResponse | null | undefined}
    ) => {
        if (!data || !projectData) return;
        // Remove deleted object also from Apollo's cache
        cache.modify({
            id: cache.identify({ id: projectId, __typename: "Project" }),
            fields: {
                allocations(existingAllocations: Reference[] = [], { readField }) {
                    return existingAllocations.filter(allocationRef => {
                        return data.allocationDelete.id !== readField("id", allocationRef);
                    });
                }
            }
        });
        cache.modify({
            id: cache.identify({ id: selectedAllocation?.employee.id, __typename: "Employee" }),
            fields: {
                allocations(existingAllocations: Reference[] = [], { readField }) {
                    return existingAllocations.filter(allocationRef => {
                        return data.allocationDelete.id !== readField("id", allocationRef);
                    });
                }
            }
        });
        cache.evict({ id: cache.identify({ id: data.allocationDelete.id, __typename: "Allocation" }) });
    }

    const [deleteAllocationMutation, { loading: deleteAllocationLoading }] =
        useMutation<AllocationDeleteResponse, IdInput>(ALLOCATION_DELETE_MUTATION, { update: handleAllocationDeleteUpdate });

    const handleAllocationDelete = (allocationId: string) => {
        deleteAllocationMutation({ variables: { id: allocationId } }).then(() => {
            enqueueSnackbar(t("alert.allocation-delete-success"), { variant: "success" });
        }).catch(error => console.log(error));
    };

    const handleBackClick = () => {
        history.push("/projects");
    };

    const handleCancelClick = () => {
        setProjectState("view");
    };

    const handleSearchClick = () => {
        setProjectState("search");
    };

    if (projectLoading) {
        return <Loading />
    }

    if (projectError || !projectData?.project) {
        return <NotFound />
    }

    // Return different view depending on projectState
    if (projectState === "editProject") {
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
                <ProjectForm project={ projectData.project } setProjectState={ setProjectState } />
            </Box>
        );
    } else if (projectState === "editPosition") {
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
                { selectedPosition ?
                    <PositionForm projectId={ projectId } position={ selectedPosition } setProjectState={ setProjectState } /> :
                    <PositionForm projectId={ projectId } setProjectState={ setProjectState } />
                }
            </Box>
        );
    } else if (projectState === "editAllocation") {
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
                { selectedAllocation ?
                    <AllocationForm projectId={ projectId } allocation={ selectedAllocation } setProjectState={ setProjectState } /> :
                    <AllocationForm projectId={ projectId } setProjectState={ setProjectState } />
                }
            </Box>
        );
    } else if (projectState === "search") {
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
                <Search project={ projectData.project } />
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
                    <Typography variant="h6" component="h2">
                        { projectData.project.name }
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        { getDateRangeText(projectData.project.startDate, projectData.project.endDate) }
                    </Typography>
                    <Typography variant="body1" className={ globalClasses.bottomMargin } gutterBottom>
                        { projectData.project.description }
                    </Typography>
                    <Grid container spacing={ 3 }>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={ <Icon>edit</Icon> }
                                onClick={ () => setProjectState("editProject") }
                            >
                                { t("label.edit-project") }
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={ <Icon>delete</Icon> }
                                onClick={ handleProjectDelete }
                                disabled={ deleteProjectLoading }
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
                                { t("label.positions") }
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={ <Icon>add</Icon> }
                                onClick={ () => {
                                    setSelectedPosition(undefined);
                                    setProjectState("editPosition");
                                } }
                            >
                                { t("label.add-position") }
                            </Button>
                        </Grid>
                    </Grid>
                    { projectData.project.positions.length === 0 &&
                        <Typography variant="body1" gutterBottom className={ globalClasses.topMargin }>
                            { t("alert.no-positions") }
                        </Typography>
                    }
                    { projectData.project.positions.length > 0 && 
                        <List>
                            { projectData.project.positions.map((position, index) => (
                                <Fragment key={ index }>
                                    <ListItem className={ globalClasses.customListItem }>
                                        <ListItemText disableTypography
                                            primary={
                                                <Typography variant="body1" className={ globalClasses.textBold } gutterBottom>
                                                    { position.name }
                                                </Typography>
                                            }
                                            secondary={
                                                <Fragment>
                                                    { (position.startDate || position.endDate) &&
                                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                                            { getDateRangeText(position.startDate, position.endDate) }
                                                        </Typography>
                                                    }
                                                    { position.description && position.description !== "" &&
                                                        <Typography variant="body1" gutterBottom>
                                                            { position.description }
                                                        </Typography>
                                                    }
                                                    { position.skills.length > 0 &&
                                                        <Box className={ globalClasses.chipContainer }>
                                                            { position.skills.map((skill, index) => (
                                                                <Badge
                                                                    key={ index }
                                                                    badgeContent={ skill.level.toFixed(2) }
                                                                    color={ skill.compulsory ? "secondary" : "primary" }
                                                                >
                                                                    <Chip
                                                                        variant={ skill.compulsory ? "default" : "outlined" }
                                                                        color="primary"
                                                                        label={ skill.name }
                                                                    />
                                                                </Badge>
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
                                                    disabled={ deletePositionLoading }
                                                    onClick={ () => {
                                                        setSelectedPosition(position);
                                                        setProjectState("editPosition");
                                                    } }
                                                >
                                                    <Icon>edit</Icon>
                                                </IconButton>
                                                <IconButton
                                                    aria-label="delete"
                                                    disabled={ deletePositionLoading }
                                                    onClick={ () => handlePositionDelete(position.id) }
                                                >
                                                    <Icon>delete</Icon>
                                                </IconButton>
                                            </Fragment>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    { index !== projectData.project.positions.length - 1 &&
                                        <Divider component="li" />
                                    }
                                </Fragment>
                            )) }
                        </List>
                    }
                </Paper>
                <Paper className={ globalClasses.paperContainer }>
                    <Grid container spacing={ 3 }>
                        <Grid item>
                            <Typography variant="h6" component="h3">
                                { t("label.allocations") }
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={ <Icon>add</Icon> }
                                onClick={ () => {
                                    setSelectedAllocation(undefined);
                                    setProjectState("editAllocation");
                                } }
                            >
                                { t("label.add-allocation") }
                            </Button>
                        </Grid>
                    </Grid>
                    { projectData.project.allocations.length === 0 && 
                        <Typography variant="body1" gutterBottom className={ globalClasses.topMargin }>
                            { t("alert.no-allocations") }
                        </Typography>
                    }
                    { projectData.project.allocations.length > 0 &&
                        <List>
                            { projectData.project.allocations.map((allocation, index) => (
                                <Fragment key={ index }>
                                    <ListItem className={ globalClasses.customListItem }>
                                        <ListItemText disableTypography
                                            primary={
                                                <Typography variant="body1" className={ globalClasses.textBold } gutterBottom>
                                                    { allocation.employee.name }
                                                </Typography>
                                            }
                                            secondary={
                                                <Fragment>
                                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                                        { getDateRangeText(allocation.startDate, allocation.endDate) }
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom>
                                                        <b>{ t("label.position") }:</b> { allocation.position }
                                                    </Typography>
                                                    <Typography variant="body2" gutterBottom>
                                                        <b>{ t("label.capacity") }:</b> { allocation.capacity }
                                                    </Typography>
                                                    { allocation.draft && 
                                                        <Chip
                                                            label={ t("label.draft") }
                                                            className={ [globalClasses.bottomMarginSmall,
                                                                globalClasses.topMarginSmall].join(" ")
                                                            }
                                                        />
                                                    }
                                                </Fragment>
                                            }
                                        />
                                        <ListItemSecondaryAction className={ globalClasses.customListItemActions }>
                                            <Fragment>
                                                <IconButton
                                                    aria-label="edit"
                                                    disabled={ deleteAllocationLoading }
                                                    onClick={ () => {
                                                        setSelectedAllocation(allocation);
                                                        setProjectState("editAllocation");
                                                    } }
                                                >
                                                    <Icon>edit</Icon>
                                                </IconButton>
                                                <IconButton
                                                    aria-label="delete"
                                                    disabled={ deleteAllocationLoading }
                                                    onClick={ () => handleAllocationDelete(allocation.id) }
                                                >
                                                    <Icon>delete</Icon>
                                                </IconButton>
                                            </Fragment>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    { index !== projectData.project.allocations.length - 1 &&
                                        <Divider component="li" />
                                    }
                                </Fragment>
                            )) }
                        </List>
                    }
                </Paper>
                <Fab
                    variant="extended"
                    aria-label="search for employees"
                    className={ [globalClasses.centerFab, globalClasses.greenButton].join(" ") }
                    onClick={ handleSearchClick }
                >
                    <Icon>search</Icon>
                    { t("label.search-employees" ) }
                </Fab>
            </Box>
        );
    }
};

export default Project;
