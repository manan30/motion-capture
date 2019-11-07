import styled, { createGlobalStyle } from 'styled-components';
import { Canvas as c } from 'react-three-fiber';

export default createGlobalStyle`
  body {
    margin: 0;
    background: black;
    color: white;
    font-family: "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif";
  }
`;

export const CodeFAB = styled.div`
  position: fixed;
  height: 24px;
  width: 24px;
  bottom: 16px;
  right: 16px;
  padding: 12px;
  border-radius: 50%;
  margin-bottom: 0px;
  background-color: #fff;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  opacity: 0.9;
  z-index: 999;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
  :hover {
    cursor: pointer;
    opacity: 1;
  }
`;

export const Canvas = styled(c)`
  height: 100vh !important;
`;

export const Form = styled.form`
  position: absolute;
  top: 10%;
  right: 5%;
  height: 24px;
  width: 200px;

  z-index: 999;
`;

export const Select = styled.select`
  height: 100%;
  width: 100%;
  margin: 16px 0;

  border: none;
  text-decoration: none;
`;

export const Submit = styled.input`
  height: 24px;
  width: 100%;

  background: black;
  color: white;
  border: 2px solid white;
  border-radius: 5px;
  cursor: pointer;

  :hover {
    color: black;
    background: white;
  }
`;
