/*
  Login Page
*/
// node module
import React, { useState } from "react";
import styled from "styled-components";
import { useMutation } from "@apollo/client";

// login components
import LoginInput from "../common/input";
import LoginButton from "../common/loginButton";

// images
import Logo from "../../assets/images/logo.png";

// user defined modules
import { setAccessToken } from "../../assets/globalVaribles";
import { encrypt } from "../../encryption/src/index";
import { mainColour } from "../common/styles";

// queries
import { LOGIN } from "./queries";

function Login(props) {
  // component state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useMutation(LOGIN);
  // submit login details
  const submitLogin = async () => {
    const encrypted = encrypt(password);
    const response = await login({
      variables: {
        email,
        password: encrypted,
      },
      update: (store, { data }) => {
        if (!data) {
          return null;
        }
        store.writeQuery({
          query: LOGIN,
          data: data.login.user,
        });
      },
    });
    console.log(response);
    if (response && response.data) {
      setAccessToken(response.data.login.accessToken);
    }
    // redirect to dashboard
    props.history.push("/dashboard");
  };
  return (
    <Container>
      <Group>
        <Image src={Logo}></Image>
        <LoginInput
          style={{
            marginTop: 47,
            height: 43,
            width: 300,
            marginLeft: -50,
          }}
          placeholder="Username"
          inputType="text"
          id="username"
          setStateValue={setEmail}
          stateValue={email}
        ></LoginInput>
        <LoginInput
          style={{
            height: 43,
            width: 300,
            marginTop: 47,
            marginLeft: -50,
          }}
          placeholder="Password"
          inputType="password"
          id="password"
          setStateValue={setPassword}
          stateValue={password}
        ></LoginInput>
        <LoginButton
          type="submit"
          style={{
            height: 60,
            width: 150,
            margin: "auto",
            marginTop: "30px",
          }}
          id="loginBtn"
          onClick={submitLogin}
        ></LoginButton>
      </Group>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  background-color: ${mainColour};
  flex-direction: column;
  height: calc(100vh - 50px);
  width: 100vw;
`;

const Group = styled.div`
  width: 207px;
  height: 200px;
  flex-direction: column;
  display: flex;
  margin-top: 60px;
  align-self: center;
`;

const Image = styled.img`
  height: 100%;
  object-fit: contain;
`;

export default Login;
