/*
    Task resolver
*/

// functions
const startTask = require("./taskFunctions/startTask");
const { pubsub } = require("../../common");

module.exports = {
  Subscription: {
    sendTask: {
      subscribe: () => pubsub.asyncIterator(["SEND_TASK"]),
    },
  },
  Query: {
    startTask,
  },
};
