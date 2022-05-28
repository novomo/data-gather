import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, passwrd: $password) {
      accessToken
      user {
        nme
        surname
      }
    }
  }
`;
