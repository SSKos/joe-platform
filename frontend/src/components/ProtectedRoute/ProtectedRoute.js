// ProtectedRoute.js

import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, path, sessionChecked, ...rest }) => {
  return (
    <Route path={path}>
      {() => {
        if (!sessionChecked) return null;
        return rest.loggedIn
          ? <Component path={path} {...rest} />
          : <Redirect to="/sign-in" />;
      }}
    </Route>
  );
};

export default ProtectedRoute;
