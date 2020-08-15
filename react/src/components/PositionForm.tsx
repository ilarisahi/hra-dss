import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { Formik, Form, FieldArray } from "formik";
import { Grid, Box, Button, Typography, Icon, IconButton, Checkbox, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@material-ui/core";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import * as Yup from "yup";

import { ProjectPosition, ProjectPositionInput, ProjectPositionResponse } from "../interfaces";
import { useGlobalStyles } from "../utils/global";
import { yupMomentNullable, momentToISODate, MAT_PICKER_DATE_FORMAT } from "../utils/misc";
import TextFieldWithMeta from "./TextFieldWithMeta";
import { ApolloCache, useMutation } from "@apollo/client";
import { POSITION_CREATE_UPDATE_MUTATION } from "../graphql/mutations";
import { projectPositionFragment } from "../graphql/fragments";

const PositionForm = (props: { projectId: string, setProjectState: Function, position?: ProjectPosition } ) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const { enqueueSnackbar } = useSnackbar();

    const handleMutationUpdate = (
        cache: ApolloCache<ProjectPositionResponse>,
        { data }: { data?: ProjectPositionResponse | null | undefined }
    ) => {
        // If creating new position, update Apollo cache manually
        if (!props.position) {
            cache.modify({
                id: cache.identify({ id: props.projectId, __typename: "Project" }),
                fields: {
                    positions(existingPositions = []) {
                        const newPositionRef = cache.writeFragment({
                            data: data?.projectPositionCreateUpdate,
                            fragment: projectPositionFragment,
                            fragmentName: "ProjectPositionFragment"
                        });
                        return [...existingPositions, newPositionRef];
                    }
                }
            });
        }
    };

    const [mutation] = useMutation<ProjectPositionResponse, ProjectPositionInput>(POSITION_CREATE_UPDATE_MUTATION, {
        update: handleMutationUpdate
    });

    const handleSubmit = (values: ProjectPositionInput, { setSubmitting }: any) => {
        const mutationVariables: ProjectPositionInput = {
            projectId: props.projectId,
            name: values.name,
            description: values.description,
            startDate: momentToISODate(values.startDate),
            endDate: momentToISODate(values.endDate),
            // Skill objects have unwanted properties (__typename), so make new objects
            skills: values.skills.map(skill => {
                return {
                    id: skill.id,
                    name: skill.name,
                    level: skill.level,
                    compulsory: skill.compulsory
                };
            })
        };

        if (props.position) {
            mutationVariables.id = props.position.id;
        }

        mutation({ variables: mutationVariables }).then(response => {
            console.log(response);
            
            const snackbarMessage = props.position ? t("alert.position-update-success") : t("alert.position-create-success");
            enqueueSnackbar(snackbarMessage, { variant: "success" });

            props.setProjectState("view");
        }).catch(error => {
            console.log(error);
            setSubmitting(false);
        });
    };

    let initialValues: ProjectPositionInput =  {
        name: "",
        description: "",
        startDate: null,
        endDate: null,
        skills: []
    };

    if (props.position) {
        initialValues = {
            name: props.position.name,
            description: props.position.description,
            startDate: props.position.startDate ? moment(props.position.startDate) : null,
            endDate: props.position.endDate ? moment(props.position.endDate) : null,
            skills: props.position.skills
        }
    }

    const positionValidationSchema = Yup.object().shape({
        name: Yup.string().required(t("error.required")),
        startDate: yupMomentNullable(t("error.invalid-date")),
        endDate: yupMomentNullable(t("error.invalid-date")),
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
            validationSchema={ positionValidationSchema }
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
                                    { props.position ? t("label.edit-position") : t("label.create-position") }
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
                        </Grid>
                    </Paper>
                    <Paper className={ globalClasses.paperContainer }>
                        <Grid container>
                            <Grid item sm={ 12 } md={ 8 }>
                                <FieldArray
                                    name="skills"
                                    render={ arrayHelpers => (
                                        <Fragment>
                                            <Grid container spacing={ 3 } className={ globalClasses.bottomMargin }>
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
                                                            level: "",
                                                            compulsory: false
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
                                                                <TableCell>{ t("label.compulsory") }</TableCell>
                                                                <TableCell>{ t("label.name") }</TableCell>
                                                                <TableCell>{ t("label.level") }</TableCell>
                                                                <TableCell></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            { values.skills.map((skill, index) => (
                                                                <TableRow key={ index }>
                                                                    <TableCell padding="checkbox" align="center">
                                                                        <Checkbox
                                                                            checked={ skill.compulsory }
                                                                            onChange={ handleChange }
                                                                            name={ `skills.${ index }.compulsory` }
                                                                            color="primary"
                                                                        />
                                                                    </TableCell>
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

export default PositionForm;
