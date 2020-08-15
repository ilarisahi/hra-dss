import React, { lazy } from "react";

import { useAuth } from "../providers/AuthProvider";

const Authenticated = lazy(() => import("./Authenticated"));
const Unauthenticated = lazy(() => import("./Unauthenticated"));

const App = () => {
    const { user } = useAuth();

    return (
        <div className="app">
            { user ? <Authenticated /> : <Unauthenticated /> }
        </div>
    );
};

export default App;
