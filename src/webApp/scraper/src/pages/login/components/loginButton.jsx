/*
  Login Button
*/
// node modules
import React from "react";
import styled from "styled-components";

// user defined modules
import { mainColour, trimHighlight, highlight } from "../../common/styles";
// button component
const LoginButton = (props) => {
  return <Container {...props}>Login</Container>;
};

// element
const Container = styled.button`
  display: flex;
  background-color: ${mainColour};
  justify-content: center;
  align-items: center;
  flex-direction: row;
  border-radius: 100px;
  min-width: 88px;
  padding: 15px;
  box-shadow: 0px 1px 5px 0.35px ${trimHighlight};
  font-family: Roboto;
  color: ${highlight};
  font-size: 14px;
  margin: 0px;
  height: 100%;
`;

export default LoginButton;
