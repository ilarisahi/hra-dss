import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Login from "./Login";

const Unauthenticated = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <Switch>
              <Route exact path="/login">
                  <Login />
              </Route>
              <Redirect from="*" to="/login" />
            </Switch>
        </Router>
    );
};

export default Unauthenticated;
