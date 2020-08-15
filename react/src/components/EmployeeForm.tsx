import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form, FieldArray } from "formik";
import { ApolloCache, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { Grid, Typography, Button, TableContainer, Box, Icon, TableHead, Table, TableCell, TableRow, TableBody, IconButton, Paper } from "@material-ui/core";
import * as Yup from "yup";

import { EmployeeInput, Employee, EmployeeResponse } from "../interfaces";
import { useSnackbar } from "notistack";
import { useGlobalStyles } from "../utils/global";
import { EMPLOYEE_CREATE_UPDATE_MUTATION } from "../graphql/mutations";
import TextFieldWithMeta from "./TextFieldWithMeta";
import { minEmployeeFragment } from "../graphql/fragments";

const EmployeeForm = (props: { employee?: Employee, setEmployeeState?: Function }) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();

    const handleMutationUpdate = (
        cache: ApolloCache<EmployeeResponse>,
        { data }: { data?: EmployeeResponse | null | undefined }
    ) => {
        // If creating new employee, update Apollo cache manually
        if (!props.employee) {
            cache.modify({
                fields: {
                    employees(existingEmployees = []) {
                        const newEmployeeRef = cache.writeFragment({
                            data: data?.employeeCreateUpdate,
                            fragment: minEmployeeFragment
                        });
                        return [...existingEmployees, newEmployeeRef];
                    }
                }
            });
        }
    };

    const [mutation] = useMutation<EmployeeResponse, EmployeeInput>(EMPLOYEE_CREATE_UPDATE_MUTATION, {
        update: handleMutationUpdate
    });

    const handleSubmit = (values: EmployeeInput, { setSubmitting }: any) => {
        const mutationVariables: EmployeeInput = {
            name: values.name,
            email: values.email,
            preferences: values.preferences,
            // Skill objects have unwanted properties (__typename), so make new objects
            skills: values.skills.map(skill => {
                return {
                    id: skill.id,
                    name: skill.name,
                    level: skill.level,
                };
            })
        };

        if (props.employee) {
            mutationVariables.id = props.employee.id;
        }

        mutation({ variables: mutationVariables }).then(response => {
            console.log(response);
            
            const snackbarMessage = props.employee ? t("alert.employee-update-success") : t("alert.employee-create-success");
            enqueueSnackbar(snackbarMessage, { variant: "success" });

            // If editing existing employee, change view back to view-state
            // In case of new employee, redirect to employee page
            if (props.setEmployeeState) {
                props.setEmployeeState("view");
            } else {
                history.push(`/employees/${ response.data?.employeeCreateUpdate.id }`);
            }
        }).catch(error => {
            console.log(error);
            setSubmitting(false);
        });
    };

    let initialValues: EmployeeInput =  {
        name: "",
        email: "",
        preferences: "",
        skills: []
    };

    if (props.employee) {
        initialValues = {
            name: props.employee.name,
            email: props.employee.email,
            preferences: props.employee.preferences,
            skills: props.employee.skills
        }
    }

    const employeeValidationSchema = Yup.object().shape({
        name: Yup.string().required(t("error.required")),
        email: Yup.string().required(t("error.required")).email(t("error.invalid-email")),
        skills: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().required(t("error.required")),
                level: Yup.number().required(t("error.required"))
            })
        )
    });

    return (
        <Formik
            initialValues={ initialValues }
            validationSchema={ employeeValidationSchema }
            onSubmit={ handleSubmit }
        >
            { ({
                values,
                isSubmitting
            }) => (
                <Form noValidate>
                    <Paper className={ globalClasses.paperContainer }>
                        <Grid container direction="column" spacing={ 3 }>
                            <Grid item>
                                <Typography variant="h6" component="h2">
                                    { props.employee ? t("label.edit-employee") : t("label.create-employee") }
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Grid container spacing={ 3 }>
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
                                            name="email"
                                            label={ t("label.email") }
                                            required
                                            type="email"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sm={ 12 } md={ 8 }>
                                <TextFieldWithMeta
                                    name="preferences"
                                    label={ t("label.preferences") }
                                    multiline
                                    fullWidth
                                    rows={6}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                    <Paper className={ globalClasses.paperContainer }>
                        <Grid container>
                            <Grid item sm={ 12 } md={ 8 }>
                                <FieldArray
                                    name="skills"
                                    render={ arrayHelpers => (
                                        <Fragment>
                                            <Grid container spacing={ 3 } className={ globalClasses.bottomMarginSmall }>
                                                <Grid item>
                                                    <Typography variant="h6" component="h3">
                                                        { t("label.skills") }
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        startIcon={ <Icon>add</Icon> }
                                                        onClick={ () => arrayHelpers.push({
                                                            name: "",
                                                            level: ""
                                                        }) }
                                                    >
                                                        { t("label.add-skill") }
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            { values.skills.length === 0 &&
                                                <Typography variant="body1" gutterBottom>
                                                    { t("alert.no-skills") }
                                                </Typography>
                                            }
                                            { values.skills.length > 0 &&
                                                <TableContainer component={ Box } className={ globalClasses.bottomMarginSmall }>
                                                    <Table size="small" aria-label="skill table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>{ t("label.name") }</TableCell>
                                                                <TableCell>{ t("label.level") }</TableCell>
                                                                <TableCell></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            { values.skills.map((skill, index) => (
                                                                <TableRow key={ index }>
                                                                    <TableCell>
                                                                        <TextFieldWithMeta
                                                                            name={ `skills.${ index }.name` }
                                                                            margin="dense"
                                                                            variant="standard"
                                                                            required
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <TextFieldWithMeta
                                                                            name={ `skills.${ index }.level` }
                                                                            margin="dense"
                                                                            variant="standard"
                                                                            type="number"
                                                                            className={ globalClasses.levelInput }
                                                                            required
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell padding="checkbox">
                                                                        <IconButton
                                                                            aria-label="delete"
                                                                            onClick={ () => arrayHelpers.remove(index) }
                                                                        >
                                                                            <Icon>delete</Icon>
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )) }
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            }
                                        </Fragment>
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

export default EmployeeForm;
