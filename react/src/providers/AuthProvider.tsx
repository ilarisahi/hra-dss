import React, { createContext, useContext, useReducer } from "react";
import { useApolloClient } from "@apollo/client";

import Loading from "../components/Loading";
import { globalObject } from "../utils/global";
import { useEffectOnce } from "../utils/hooks";
import { AUTHENTICATE_QUERY, LOGOUT_QUERY } from "../graphql/queries";
import { LoginResponse } from "../interfaces";

const AuthContext = createContext({
    isLoading: false,
    user: null,
    login: (data: LoginResponse) => data,
    logout: () => null
});

export const AuthProvider = ({ children }: { children: any }) => {
    const client = useApolloClient();

    const initialiseApp = async () => {
        await fetch(
            process.env.REACT_APP_API_URL!.concat("/xsrf"),
            { credentials: "include" }
        )
            .then(response => response.json())
            .then(result => globalObject.xsrfToken = result.xsrfToken)
            .catch(error => console.log(error));

        client.query({
            query: AUTHENTICATE_QUERY
        }).then(result => {
            console.log(result);
            setState({ user: result.data.authenticate });
        }).catch(error => {
            console.log(error);
        }).finally(() => setState({ isLoading: false }));
    };

    useEffectOnce(() => {
        initialiseApp();
    });

    const login = (data: LoginResponse) => {
        setState({ user: data.login });
    }

    const logout = () => {
        client.query({
            query: LOGOUT_QUERY
        }).then(result => {
            console.log(result);
            client.clearStore();
            setState({ user: null });
        }).catch(error => {
            console.log(error);
        });
    };

    const stateReducer = (state: any, newState: any) => {
        return { ...state, ...newState };
    };

    const [state, setState] = useReducer(stateReducer, {
        isLoading: true,
        user: null,
        login: login,
        logout: logout
    });

    return (
        <AuthContext.Provider value={state}>
            {state.isLoading ? <Loading /> : { ...children }}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
