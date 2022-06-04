/*
  Login Inputs
*/
// node modules
import React from "react";
import styled from "styled-components";

// components
import { InputStyle, trim, trimHighlight } from "../../common/styles";

// Input component
const LoginInput = (props) => {
  return (
    <Container {...props}>
      <InputStyle
        type={props.inputType}
        placeholder={props.placeholder}
        value={props.stateValue}
        id={props.id}
        onChange={(e) => {
          props.setStateValue(e.target.value);
        }}
      ></InputStyle>
    </Container>
  );
};

// element
const Container = styled.div`
  display: flex;
  border-bottom-width: 1px;
  border-color: ${trim};
  background-color: transparent;
  flex-direction: row;
  align-items: center;
  shadow-radius: 0px;
  box-shadow: 3px 3px 0px 1px ${trimHighlight};
  border-radius: 3px;
`;

export default LoginInput;
