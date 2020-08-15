import React from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { ApolloCache, useMutation, useQuery } from "@apollo/client";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { Autocomplete } from "@material-ui/lab";
import { Formik, Form } from "formik";
import { Grid, Button, TextField, Paper, Typography } from "@material-ui/core";
import moment from "moment";
import * as Yup from "yup";

import { EmployeeExperience, EmployeeExperienceResponse, EmployeeExperienceInput, SkillLibraryResponse } from "../interfaces";
import { useGlobalStyles } from "../utils/global";
import { EXPERIENCE_CREATE_UPDATE_MUTATION } from "../graphql/mutations";
import { momentToISODate, yupMoment, MAT_PICKER_DATE_FORMAT } from "../utils/misc";
import TextFieldWithMeta from "./TextFieldWithMeta";
import { SKILL_LIBRARY_QUERY } from "../graphql/queries";
import { employeeExperienceFragment } from "../graphql/fragments";

const ExperienceForm = (props: { employeeId: string, setEmployeeState: Function, experience?: EmployeeExperience }) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const { enqueueSnackbar } = useSnackbar();

    const { data: skillSuggestions, loading: suggestionsLoading } = useQuery<SkillLibraryResponse>(SKILL_LIBRARY_QUERY);

    const handleMutationUpdate = (
        cache: ApolloCache<EmployeeExperienceResponse>,
        { data }: { data?: EmployeeExperienceResponse | null | undefined }
    ) => {
        // If creating new experience, update Apollo cache manually
        if (!props.experience) {
            cache.modify({
                id: cache.identify({ id: props.employeeId, __typename: "Employee" }),
                fields: {
                    experience(existingExperience = []) {
                        const newExperienceRef = cache.writeFragment({
                            data: data?.employeeExperienceCreateUpdate,
                            fragment: employeeExperienceFragment
                        });
                        return [...existingExperience, newExperienceRef];
                    }
                }
            });
        }
    };

    const [mutation] = useMutation<EmployeeExperienceResponse, EmployeeExperienceInput>(EXPERIENCE_CREATE_UPDATE_MUTATION, {
        update: handleMutationUpdate
    });

    const handleSubmit = (values: EmployeeExperienceInput, { setSubmitting }: any) => {
        const mutationVariables: EmployeeExperienceInput = {
            employeeId: props.employeeId,
            name: values.name,
            position: values.position,
            customer: values.customer,
            description: values.description,
            startDate: momentToISODate(values.startDate),
            endDate: momentToISODate(values.endDate),
            skills: values.skills
        };

        if (props.experience) {
            mutationVariables.id = props.experience.id;
        }

        mutation({ variables: mutationVariables }).then(response => {
            console.log(response);
            
            const snackbarMessage = props.experience ? t("alert.experience-update-success") : t("alert.experience-create-success");
            enqueueSnackbar(snackbarMessage, { variant: "success" });

            props.setEmployeeState("view");
        }).catch(error => {
            console.log(error);
            setSubmitting(false);
        });
    };

    let initialValues: EmployeeExperienceInput =  {
        name: "",
        position: "",
        customer: "",
        description: "",
        startDate: null,
        endDate: null,
        skills: []
    };

    if (props.experience) {
        initialValues = {
            name: props.experience.name,
            customer: props.experience.customer,
            position: props.experience.position,
            description: props.experience.description,
            startDate: props.experience.startDate ? moment(props.experience.startDate) : null,
            endDate: props.experience.endDate ? moment(props.experience.endDate) : null,
            skills: props.experience.skills
        }
    }

    const experienceValidationSchema = Yup.object().shape({
        name: Yup.string().required(t("error.required")),
        startDate: yupMoment(t("error.required"), t("error.invalid-date")),
        endDate: yupMoment(t("error.required"), t("error.invalid-date"))
    });

    return (
        <Formik
            initialValues={ initialValues }
            validationSchema={ experienceValidationSchema }
            onSubmit={ handleSubmit }
        >
            { ({
                values,
                errors,
                touched,
                setFieldValue,
                handleBlur,
                isSubmitting
            }) => (
                <Form noValidate>
                    <Paper className={ globalClasses.paperContainer }>
                        <Grid container direction="column" spacing={ 3 }>
                            <Grid item>
                                <Typography variant="h6" component="h2">
                                    { props.experience ? t("label.edit-experience") : t("label.create-experience") }
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={3}>
                                    <Grid item>
                                        <TextFieldWithMeta
                                            name="name"
                                            label={ t("label.name") }
                                            required
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextFieldWithMeta
                                            name="customer"
                                            label={ t("label.customer") }
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextFieldWithMeta
                                            name="position"
                                            label={ t("label.position") }
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
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
                                                required
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
                                                required
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
                            <Grid item sm={ 12 } md={ 8 }>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    filterSelectedOptions
                                    options={ skillSuggestions ? skillSuggestions.skillLibrary : [] }
                                    loading={ suggestionsLoading }
                                    value={ values.skills }
                                    onChange={ (event, value) => setFieldValue("skills", value) }
                                    renderInput={(params) => (
                                        <TextField
                                            { ...params }
                                            variant="outlined"
                                            label={ t("label.skills") }
                                            placeholder={ t("label.add-skill") }
                                        />
                                    ) }
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

export default ExperienceForm;
