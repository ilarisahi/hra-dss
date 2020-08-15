import React, { Suspense, StrictMode } from "react";
import ReactDOM from "react-dom";
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ThemeProvider } from "@material-ui/core";
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles';
import { SnackbarProvider } from "notistack";
import moment from "moment";
import * as serviceWorker from "./serviceWorker";

import { globalObject } from "./utils/global";
import { AuthProvider } from "./providers/AuthProvider";

import App from "./components/App";
import Loading from "./components/Loading";

import "./i18n";
import "./index.css";

// Set moment locale
moment.locale("en");

// Workaround for making Material-UI compatible with React strict mode
// https://github.com/mui-org/material-ui/issues/13394
// https://material-ui.com/customization/theming/#unstable-createmuistrictmodetheme-options-args-theme
const materialTheme = unstable_createMuiStrictModeTheme();

// Initialise Apollo client
const httpLink = createHttpLink({
    uri: process.env.REACT_APP_GRAPHQL_URL,
    credentials: "include"
});

// Set XSRF-token to the header of all future requests
const xsrfLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            "x-xsrf-token": globalObject.xsrfToken
        }
    };
});

const client = new ApolloClient({
    link: xsrfLink.concat(httpLink),
    cache: new InMemoryCache()
});

// i18n uses the experimental Suspense component
ReactDOM.render(
    <StrictMode>
        <Suspense fallback={<Loading />}>
            <ApolloProvider client={client}>
                <AuthProvider>
                    <ThemeProvider theme={ materialTheme }>
                        <SnackbarProvider maxSnack={3}>
                            <App />
                        </SnackbarProvider>
                    </ThemeProvider>
                </AuthProvider>
            </ApolloProvider>
        </Suspense>
    </StrictMode>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
