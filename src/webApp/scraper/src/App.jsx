/*
  App
*/
// node modules
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { SemipolarLoading } from "react-loadingg";
import styled from "styled-components";

// User defined components
import Login from "./pages/login/main";
import Dashboard from "./pages/dashboard/main";
import Footer from "./pages/common/footer";

// css
import "./App.css";

// user defined modules
import { getAccessToken, setAccessToken } from "./assets/globalVaribles";
import { REFRESH_TOKEN_URL } from "./secrets";
import { mainColour, trim } from "./pages/common/styles";

// APP css container
const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  backgground-color: ${mainColour};
`;

// if user not logged in
const LoginContainer = () => (
  <Container>
    <Route exact path="/" render={() => <Redirect to="/login" />} />

    <Route path="/login" component={Login} />
    <Footer />
  </Container>
);

// if user is logged
const DefaultContainer = () => {
  const accessToken = getAccessToken();
  if (!accessToken || accessToken === "no token") {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      <Container>
        <Route path="/dashboard" component={Dashboard} />
        <Footer />
      </Container>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  // checks login state and return refresh token.
  const getToken = async () => {
    //console.log(1)
    const resp = await fetch(REFRESH_TOKEN_URL, {
      method: "POST",
      credentials: "include",
    });
    //console.log(resp)
    const { accessToken } = await resp.json();

    setAccessToken(accessToken);
    //console.log(accessToken)
    setLoading(false);
  };
  // initiates getToken on load
  useEffect(() => {
    getToken();
  }, []);
  // if loading show loader
  if (loading)
    return (
      <Container>
        <SemipolarLoading color={trim} />
      </Container>
    );
  // app router
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Redirect from="/" to="/dashboard" exact />
          <Route path="/login" component={LoginContainer} />:
          <Route component={DefaultContainer} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
