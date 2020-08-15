import React from "react";
import { Box, Button, Icon } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { useGlobalStyles } from "../utils/global";
import EmployeeForm from "./EmployeeForm";

const NewEmployee = () => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const history = useHistory();

    const handleCancelClick = () => {
        history.push("/employees");
    };

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
            <EmployeeForm />
        </Box>
    );
};

export default NewEmployee;
