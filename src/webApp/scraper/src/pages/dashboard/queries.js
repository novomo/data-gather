import { gql } from "@apollo/client";

export const TASK_SUBSCRIPTION = gql`
  subscription {
    sendTask {
      task
      tabStatus
      currentPage
      pages
      stage
      tabId
      gotCurrent
    }
  }
`;

export const UPDATE_TASKS_SUBSCRIPTION = gql`
  subscription {
    updateTasks {
      task
      tabStatus
      currentPage
      pages
      stage
      tabId
      gotCurrent
    }
  }
`;
