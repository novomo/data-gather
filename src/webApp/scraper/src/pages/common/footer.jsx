/*
  Footer
*/
// node modules
import React from "react";
import styled from "styled-components";

// user defined modules
import { mainColour } from "./styles";
function Footer(props) {
  return <Container {...props}></Container>;
}

const Container = styled.div`
  min-height: 50px;
  width: 100vw;
  position: absolute;
  display: flex;
  background-color: ${mainColour};
  flex-direction: row;
  box-shadow: 0px -2px 1.2px 0.2px ${mainColour};
`;

export default Footer;
