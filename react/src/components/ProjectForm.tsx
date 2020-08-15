import React from "react";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { Formik, Form } from 'formik';
import { Grid, Button, FormControlLabel, Checkbox, Paper, Typography } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useSnackbar } from 'notistack';
import { useMutation, ApolloCache } from "@apollo/client";
import * as Yup from "yup";

import { useGlobalStyles } from "../utils/global";
import { ProjectInput, ProjectResponse, Project } from "../interfaces";
import { yupMomentNullable, momentToISODate, MAT_PICKER_DATE_FORMAT } from "../utils/misc";
import { PROJECT_CREATE_UPDATE_MUTATION } from "../graphql/mutations";
import TextFieldWithMeta from "./TextFieldWithMeta";
import { minProjectFragment } from "../graphql/fragments";

const ProjectForm = ( props: { project?: Project, setProjectState?: Function } ) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();

    const handleMutationUpdate = (
        cache: ApolloCache<ProjectResponse>,
        { data }: { data?: ProjectResponse | null | undefined }
    ) => {
        // If creating new project, update Apollo cache manually
        if (!props.project) {
            cache.modify({
                fields: {
                    projects(existingProjects = []) {
                        const newProjectRef = cache.writeFragment({
                            data: data?.projectCreateUpdate,
                            fragment: minProjectFragment
                        });
                        return [...existingProjects, newProjectRef];
                    }
                }
            });
        }
    };

    const [mutation] = useMutation<ProjectResponse, ProjectInput>(PROJECT_CREATE_UPDATE_MUTATION, {
        update: handleMutationUpdate
    });

    const handleSubmit = (values: ProjectInput, { setSubmitting }: any) => {
        console.log("Submitting form...");
        const mutationVariables: ProjectInput = {
            name: values.name,
            description: values.description,
            startDate: momentToISODate(values.startDate),
            endDate: momentToISODate(values.endDate),
            draft: values.draft
        };

        if (props.project) {
            mutationVariables.id = props.project.id;
        }

        mutation({ variables: mutationVariables }).then(response => {
            console.log(response);

            const snackbarMessage = props.project ? t("alert.project-update-success") : t("alert.project-create-success");
            enqueueSnackbar(snackbarMessage, { variant: "success" });

            // If editing existing project, change view back to view-state
            // In case of new project, redirect to project page
            if (props.setProjectState) {
                props.setProjectState("view");
            } else {
                history.push(`/projects/${ response.data?.projectCreateUpdate.id }`);
            }
        }).catch(error => {
            console.log(error)
            setSubmitting(false)
        });
    };

    let initialValues: ProjectInput =  {
        name: "",
        description: "",
        startDate: null,
        endDate: null,
        draft: true
    };

    if (props.project) {
        initialValues = {
            name: props.project.name,
            description: props.project.description,
            startDate: props.project.startDate ? moment(props.project.startDate) : null,
            endDate: props.project.endDate ? moment(props.project.endDate) : null,
            draft: props.project.draft
        }
    }

    const projectValidationSchema = Yup.object().shape({
        name: Yup.string().required(t("error.required")),
        startDate: yupMomentNullable(t("error.invalid-date")),
        endDate: yupMomentNullable(t("error.invalid-date"))
    });

    return (
        <Formik
            initialValues={ initialValues }
            validationSchema={ projectValidationSchema }
            onSubmit={ handleSubmit }
        >
            { ({
                values,
                errors,
                touched,
                setFieldValue,
                handleChange,
                handleBlur,
                isSubmitting
            }) => (
                <Form noValidate>
                    <Paper className={ globalClasses.paperContainer }>
                        <Grid container direction="column" spacing={ 3 }>
                            <Grid item>
                                <Typography variant="h6" component="h2">
                                    { props.project ? t("label.edit-project") : t("label.create-project") }
                                </Typography>
                            </Grid>
                            <Grid item>
                                <TextFieldWithMeta
                                    name="name"
                                    label={ t("label.name") }
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item sm={ 12 } md={ 8 }>
                                <TextFieldWithMeta
                                    name="description"
                                    label={ t("label.description") }
                                    multiline
                                    fullWidth
                                    rows={6}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                                <MuiPickersUtilsProvider libInstance={ moment } utils={ MomentUtils }>
                                    <Grid container spacing={ 3 }>
                                        <Grid item>
                                            <KeyboardDatePicker
                                                className={ globalClasses.materialDatePicker }
                                                autoOk
                                                variant="inline"
                                                inputVariant="outlined"
                                                name="startDate"
                                                format={ MAT_PICKER_DATE_FORMAT }
                                                label={ t("label.start-date") }
                                                onChange={ value => setFieldValue("startDate", value) }
                                                onBlur={ handleBlur }
                                                value={ values.startDate }
                                                error={ !!(errors.startDate && touched.startDate) }
                                                helperText={ !!(errors.startDate && touched.startDate) &&
                                                    errors.startDate }
                                                KeyboardButtonProps={{
                                                    "aria-label": "change start date",
                                                }}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <KeyboardDatePicker
                                                className={ globalClasses.materialDatePicker }
                                                autoOk
                                                variant="inline"
                                                inputVariant="outlined"
                                                name="endDate"
                                                format={ MAT_PICKER_DATE_FORMAT }
                                                label={ t("label.end-date") }
                                                onChange={ value => setFieldValue("endDate", value) }
                                                onBlur={ handleBlur }
                                                value={ values.endDate }
                                                error={ !!(errors.endDate && touched.endDate) }
                                                helperText={ !!(errors.endDate && touched.endDate) &&
                                                    errors.endDate }
                                                KeyboardButtonProps={{
                                                    "aria-label": "change end date",
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item>
                                <FormControlLabel
                                    label={ t("label.draft") }
                                    control={
                                        <Checkbox
                                            name="draft"
                                            checked={ values.draft }
                                            onChange={ handleChange }
                                            color="primary"
                                        />
                                    }
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
                        { t("label.save") }
                    </Button>
                </Form>
            ) }
        </Formik>
    );
};

export default ProjectForm;
