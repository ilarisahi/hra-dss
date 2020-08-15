import React from "react";
import { Formik, Form } from "formik";
import { useTranslation } from "react-i18next";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import { Autocomplete } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import { Grid, TextField, Button, FormControlLabel, Checkbox, Paper, Typography } from "@material-ui/core";
import { ApolloCache, useMutation, useQuery } from "@apollo/client";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import * as Yup from "yup";

import { useGlobalStyles } from "../utils/global";
import { Allocation, AllocationResponse, AllocationInput, AllEmployeesResponse } from "../interfaces";
import { allocationFragment } from "../graphql/fragments";
import { ALLOCATION_CREATE_UPDATE_MUTATION } from "../graphql/mutations";
import { momentToISODate, yupMoment, MAT_PICKER_DATE_FORMAT, yupRequiredString } from "../utils/misc";
import { ALL_EMPLOYEES_QUERY } from "../graphql/queries";
import TextFieldWithMeta from "./TextFieldWithMeta";
import Loading from "./Loading";

const AllocationForm = (props: { projectId: string, setProjectState: Function, allocation?: Allocation } ) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const { enqueueSnackbar } = useSnackbar();

    const { data: employeesData, loading: employeesLoading } = useQuery<AllEmployeesResponse>(ALL_EMPLOYEES_QUERY);

    const handleMutationUpdate = (
        cache: ApolloCache<AllocationResponse>,
        { data }: { data?: AllocationResponse | null | undefined }
    ) => {
        // If creating new allocation, update Apollo cache manually
        if (!props.allocation) {
            const newAllocationRef = cache.writeFragment({
                data: data?.allocationCreateUpdate,
                fragment: allocationFragment
            });
            cache.modify({
                id: cache.identify({ id: props.projectId, __typename: "Project" }),
                fields: {
                    allocations(existingAllocations = []) {
                        return [...existingAllocations, newAllocationRef];
                    }
                }
            });
            cache.modify({
                id: cache.identify({ id: data?.allocationCreateUpdate.employee.id, __typename: "Employee" }),
                fields: {
                    allocations(existingAllocations = []) {
                        return [...existingAllocations, newAllocationRef];
                    }
                }
            });
        }
    };

    const [mutation] = useMutation<AllocationResponse, AllocationInput>(ALLOCATION_CREATE_UPDATE_MUTATION, {
        update: handleMutationUpdate
    });

    const handleSubmit = (values: AllocationInput, { setSubmitting }: any) => {
        const mutationVariables: AllocationInput = {
            projectId: props.projectId,
            employeeId: values.employeeId,
            position: values.position,
            capacity: values.capacity,
            draft: values.draft,
            startDate: momentToISODate(values.startDate),
            endDate: momentToISODate(values.endDate)
        };

        if (props.allocation) {
            mutationVariables.id = props.allocation.id;
        }

        mutation({ variables: mutationVariables }).then(response => {
            console.log(response);
            
            const snackbarMessage = props.allocation ? t("alert.allocation-update-success") : t("alert.allocation-create-success");
            enqueueSnackbar(snackbarMessage, { variant: "success" });

            props.setProjectState("view");
        }).catch(error => {
            console.log(error);
            setSubmitting(false);
        });
    };

    let initialValues: AllocationInput =  {
        position: "",
        capacity: "",
        startDate: null,
        endDate: null,
        employeeId: null,
        draft: true
    };

    if (props.allocation) {
        initialValues = {
            employeeId: props.allocation.employee.id,
            position: props.allocation.position,
            capacity: props.allocation.capacity,
            startDate: props.allocation.startDate ? moment(props.allocation.startDate) : null,
            endDate: props.allocation.endDate ? moment(props.allocation.endDate) : null,
            draft: props.allocation.draft
        }
    }

    const allocationValidationSchema = Yup.object().shape({
        employeeId: yupRequiredString(t("error.required")),
        position: Yup.string().required(t("error.required")),
        capacity: Yup.number().required(t("error.required")),
        startDate: yupMoment(t("error.required"), t("error.invalid-date")),
        endDate: yupMoment(t("error.required"), t("error.invalid-date")),
    });

    if (employeesLoading) {
        return (
            <Loading />
        );
    }

    return (
        <Formik
            initialValues={ initialValues }
            validationSchema={ allocationValidationSchema }
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
                                    { props.allocation ? t("label.edit-allocation") : t("label.create-allocation") }
                                </Typography>
                            </Grid>
                            <Grid item sm={ 12 } md={ 8 }>
                                <Autocomplete
                                    className={ globalClasses.autocomplete }
                                    noOptionsText={ t("alert.no-employee-results") }
                                    options={ employeesData ? employeesData?.employees.map( employee => employee.id ) : [] }
                                    getOptionLabel={ employeeId => {
                                        if (!employeesData) return "";
                                        const employeeResult = employeesData.employees.find(employee => employee.id === employeeId);
                                        return employeeResult ? employeeResult.name : "";
                                    } }
                                    value={ values.employeeId }
                                    onChange={ (event, value) => setFieldValue("employeeId", value) }
                                    renderInput={ (params) => (
                                        <TextField
                                            {...params}
                                            label={ t("label.employee") }
                                            variant="outlined"
                                            onBlur={ handleBlur }
                                            error={ !!(errors.employeeId && touched.employeeId) }
                                            helperText={ !!(errors.startDate && touched.employeeId) &&
                                                errors.employeeId }
                                        />
                                    ) }
                                />
                            </Grid>
                            <Grid item>
                                <Grid container spacing={ 3 }>
                                    <Grid item>
                                        <TextFieldWithMeta
                                            required
                                            name="position"
                                            label={ t("label.position") }
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextFieldWithMeta
                                            required
                                            name="capacity"
                                            label={ t("label.capacity") }
                                            variant="outlined"
                                            type="number"
                                        />
                                    </Grid>
                                </Grid>
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

export default AllocationForm;
