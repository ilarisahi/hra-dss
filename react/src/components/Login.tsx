import React, { useState, FormEvent, MouseEvent } from "react";
import { Container, Grid, Icon, TextField, FormControl, InputLabel,
    Input, InputAdornment, IconButton, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ApolloError, useMutation } from "@apollo/client";

import { useAuth } from "../providers/AuthProvider";
import { LoginResponse, LoginInput } from "../interfaces";
import { useInput } from "../utils/hooks";
import { LOGIN_MUTATION } from "../graphql/mutations";

const Login = () => {
    const { login } = useAuth();
    const { t } = useTranslation();
    const { value: email, bind: bindEmail } = useInput('');
    const { value: password, bind: bindPassword } = useInput('');
    const [isPasswordVisible, setPasswordVisibility] = useState(false);

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutation({ variables: { email, password } });
    };

    const handleClickPasswordVisibility = () => {
        setPasswordVisibility(!isPasswordVisible);
    };

    const handleMouseDownPasswordVisibility = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleLoginError = (error: ApolloError) => {
        console.log(error);
    };

    const handleLoginSuccess = (data: LoginResponse) => {
        console.log(data);
        login(data);
    };

    const [mutation, { loading: mutationLoading }] = useMutation<LoginResponse, LoginInput>(LOGIN_MUTATION, {
        onCompleted: handleLoginSuccess,
        onError: handleLoginError
    });

    return (
        <Container>
            <p>
                Login component.
            </p>
            <form onSubmit={ handleFormSubmit }>
                <Grid container spacing={ 1 } alignItems="flex-end">
                    <Grid item>
                        <Icon>person</Icon>
                    </Grid>
                    <Grid item xs>
                        <TextField fullWidth id="textfield-email" label={ t("label.email") } { ... bindEmail } />
                    </Grid>
                </Grid>
                <Grid container spacing={ 1 } alignItems="flex-end">
                    <Grid item>
                        <Icon>lock</Icon>
                    </Grid>
                    <Grid item xs>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="input-password">{ t("label.password") }</InputLabel>
                            <Input
                                id="input-password"
                                { ...bindPassword }
                                type={ isPasswordVisible ? 'text' : 'password' }
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={ handleClickPasswordVisibility }
                                            onMouseDown={ handleMouseDownPasswordVisibility }
                                        >
                                            { isPasswordVisible ? <Icon>visibility</Icon> : <Icon>visibility_off</Icon> }
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    endIcon={ <Icon>keyboard_arrow_right</Icon> }
                    disabled={ mutationLoading }
                >
                    { t("label.login") }
                </Button>
            </form>
        </Container>
    );
};

export default Login;
