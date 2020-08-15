import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Box, Typography, Fab, Icon, Divider, List, ListItem, ListItemText, Paper } from "@material-ui/core";
import { getDateText } from "../utils/misc";
import { useQuery } from "@apollo/client";
import { ALL_PROJECTS_QUERY } from "../graphql/queries";
import Loading from "./Loading";
import { AllProjectsResponse } from "../interfaces";
import { useGlobalStyles } from "../utils/global";

const Projects = () => {
    const globalClasses = useGlobalStyles();
    const { t } = useTranslation();
    const history = useHistory();
    const { data, loading } = useQuery<AllProjectsResponse>(ALL_PROJECTS_QUERY);

    const isNoProjects = (): boolean => {
        return !data || !data.projects || data.projects.length === 0;
    };

    const handleProjectClick = (projectId: string) => {
        history.push(`/projects/${ projectId }`);
    };

    const handleCreateProjectClick = () => {
        history.push("/projects/new");
    }

    return (
        <Box mt="1em" mb="1em" display="flex" flexDirection="column">
            <Paper className={ globalClasses.paperContainer }>
                <Typography variant="h6" component="h2" gutterBottom>
                    { t("label.projects") }
                </Typography>
                <Typography variant="body1" className={ globalClasses.bottomMargin }>
                    { t("description.projects") }
                </Typography>
                <Divider />

                { loading && <Loading />}
                { !loading && isNoProjects() &&
                    <Typography variant="body1" gutterBottom className={ globalClasses.topMargin }>
                        { t("alert.no-projects") }
                    </Typography>
                }
                { !loading && !isNoProjects() &&
                    <List className={ globalClasses.bottomMargin }>
                        { data?.projects.map(project => {
                            return (
                                <ListItem button onClick={ () => handleProjectClick(project.id) } key={ project.id }>
                                    <ListItemText
                                        primary={ project.name }
                                        secondary={ t("label.created-at", { date: getDateText(project.createdAt) }) }
                                    />
                                </ListItem>
                            );
                        }) }
                    </List>
                }
            </Paper>
            <Fab
                variant="extended"
                aria-label="create new project"
                className={ [globalClasses.centerFab, globalClasses.greenButton].join(" ") }
                onClick={ handleCreateProjectClick }
            >
                <Icon>add</Icon>
                { t("label.create-project" ) }
            </Fab>
        </Box>
    );
};

export default Projects;
