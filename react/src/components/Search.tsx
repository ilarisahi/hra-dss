import React, { Fragment, useState } from "react";
import { Paper, Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import { useApolloClient } from "@apollo/client";
import * as Yup from "yup";

import { useGlobalStyles } from "../utils/global";
import { Project, ProjectSearchResponse, ProjectSearchByPositionResponse } from "../interfaces";
import TextFieldWithMeta from "./TextFieldWithMeta";
import { PROJECT_SEARCH, PROJECT_SEARCH_BY_POSITION } from "../graphql/queries";
import Loading from "./Loading";
import ProjectSearchEmployees from "./ProjectSearchEmployees";

const Search = (props: { project: Project }) => {
    const client = useApolloClient();
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const [method, setMethod] = useState("excludePositions");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] =
        useState<ProjectSearchResponse | ProjectSearchByPositionResponse | null>(null);

    const handleSubmit = (values: { method: string, limit: number }, { setSubmitting }: any) => {
        setIsLoading(true);
        setMethod(values.method);

        const variables = { projectId: props.project.id, limit: values.limit };

        client.query({
            query: values.method === "excludePositions" ? PROJECT_SEARCH : PROJECT_SEARCH_BY_POSITION,
            variables: variables,
            fetchPolicy: "no-cache"
        }).then(result => {
            console.log(result);
            setSearchResults(result.data)
        }).catch(error => {
            console.log(error);
            setSearchResults(null);
        }).finally(() => {
            setIsLoading(false);
            setSubmitting(false);
        });
    };

    let initialValues = {
        method: props.project.positions.length === 0 ? "excludePositions" : "includePositions",
        limit: 10
    };

    const searchValidationSchema = Yup.object().shape({
        limit: Yup.number()
            .required(t("error.required"))
            .integer(t("error.invalid-integer"))
            .positive(t("error.invalid-positive"))
    });

    return (
        <Fragment>
            <Formik
                initialValues={ initialValues }
                validationSchema={ searchValidationSchema }
                onSubmit={ handleSubmit }
            >
                { ({
                    values,
                    handleChange,
                    isSubmitting
                }) => (
                    <Form noValidate>
                        <Paper className={ globalClasses.paperContainer }>
                            <Grid container direction="column" spacing={ 3 }>
                                <Grid item>
                                    <Typography variant="h6" component="h2">
                                        { t("label.search-employees") }
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">{ t("label.search-method") }</FormLabel>
                                        <RadioGroup
                                            aria-label="search method"
                                            name="method"
                                            value={ values.method }
                                            onChange={ handleChange }
                                        >
                                            <FormControlLabel
                                                value="excludePositions"
                                                control={ <Radio /> }
                                                label={ t("label.exclude-positions") }
                                            />
                                            <FormControlLabel
                                                value="includePositions"
                                                control={ <Radio /> }
                                                label={ t("label.include-positions") }
                                                disabled={ props.project.positions.length === 0 }
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <TextFieldWithMeta
                                        name="limit"
                                        label={ t("label.limit") }
                                        type="number"
                                        required
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                        <Button
                            type="submit"
                            variant="contained"
                            className={ globalClasses.greenButton }
                            disabled={ isSubmitting }
                        >
                            { t("label.search") }
                        </Button>
                    </Form>
                ) }
            </Formik>
            { isLoading && 
                <Loading />
            }
            { !isLoading && searchResults &&
                <Paper className={ globalClasses.paperContainer }>
                    <Grid container direction="column" spacing={ 1 }>
                        <Grid item>
                            <Typography variant="h6" component="h2">
                                { t("label.search-results") }
                            </Typography>
                        </Grid>
                        <Grid item>
                            { method === "excludePositions" &&
                                <ProjectSearchEmployees
                                    results={ (searchResults as ProjectSearchResponse).projectSearch }
                                />
                            }
                            { method === "includePositions" &&
                                <Box className={ globalClasses.positionResultContainer }>
                                    {
                                        (searchResults as ProjectSearchByPositionResponse).projectSearchByPosition.map((result, index) => (
                                            <Box key={ index }>
                                                <Typography
                                                    variant="body1"
                                                    className={ globalClasses.textBold }
                                                >
                                                    { result.position.name }
                                                </Typography>
                                                <ProjectSearchEmployees results={ result.employees } />
                                            </Box>
                                        ))
                                    }
                                </Box>
                            }
                        </Grid>
                    </Grid>
                </Paper>
            }
        </Fragment>
    );
};

export default Search;
