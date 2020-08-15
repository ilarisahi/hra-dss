import React from "react";
import { useField } from "formik";
import { TextField } from "@material-ui/core";

const TextFieldWithMeta = (props: any) => {
    const [field, meta] = useField(props);

    return (
        <TextField
            { ...field }
            { ...props }
            error={ !!(meta.error && meta.touched) }
            helperText={ !!(meta.error && meta.touched) &&
                meta.error }
        />
    );
};

export default TextFieldWithMeta;
