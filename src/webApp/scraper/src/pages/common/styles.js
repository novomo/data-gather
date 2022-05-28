import styled from "styled-components";

export const mainColour = "#0A0908";
export const subColour = "#3F3C3C";
export const highlight = "#88A2AA";
export const trim = "#E1CE7A";
export const trimHighlight = "#F7F6C5";

export const Container = styled.div`
  display: flex;
  width: 100%;
  min-height: calc(100vh - 123px);
  flex-direction: column;
  background-color: ${mainColour};
`;

export const InputStyle = styled.input`
  box-shadow: 0px 1px 5px 0.35px ${highlight};
  font-family: Roboto;
  color: ${highlight};
  padding-right: 5px;
  font-size: 16px;
  align-self: stretch;
  flex: 1 1 0%;
  line-height: 16px;
  padding: 10px;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  margin-left: 20px;
`;

export const CardItem1Style = styled.div`
  background-color: rgba(63, 60, 60, 1);
  flex-direction: column;
  display: flex;
`;

export const CardContainer = styled.div`
  display: flex;
  border-width: 1px;
  border-radius: 2px;
  border-color: #ccc;
  flex-wrap: nowrap;
  background-color: rgba(63, 60, 60, 1);
  overflow: hidden;
  flex-direction: column;
  border-style: solid;
  position: relative;
  box-shadow: -2px 2px 1.5px 0.1px #000;
  width: 95%;
  margin: 15px auto;
`;

export const HeaderStyle = styled.div`
  width: 100%;
  flex: 1 1 0%;
  flex-direction: row;
  align-items: center;
  height: 40px;
  width: 100%;
  display: flex;
`;

export const HeaderContent = styled.div`
  width: 100%;
  justify-content: center;
  flex-direction: column;
  display: flex;
`;

export const TextStyle = styled.span`
  font-family: Roboto;
  font-size: 16px;
  color: rgba(163, 237, 111, 1);
  line-height: 20px;
`;

export const Subhead = styled.span`
  font-family: Roboto;
  font-size: 14px;
  color: rgba(163, 237, 111, 1);
  line-height: 16px;
  opacity: 0.5;
`;

export const Rect = styled.div`
  width: 100%;
  background-color: rgba(230, 230, 230, 0.33);
  flex-direction: column;
  display: flex;
`;

export const ButtonDiv = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
}`;

export const InputContainer = styled.div`
  display: flex;
  border-bottom-width: 1px;
  border-color: #d9d5dc;
  background-color: transparent;
  flex-direction: row;
  align-items: center;
  shadow-radius: 0px;
  border-radius: 3px;
  justify-content: center;
  padding-bottom: 10px;
`;
