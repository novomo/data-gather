/*
    Task resolver
*/

// functions
const sendTask = require("./taskFunctions/sendTask");
const { pubsub } = require("../../common");

module.exports = {
  Subscription: {
    sendTask: {
      subscribe: () => PubSub.asyncIterator(["SEND_TASK"]),
    },
  },
  Query: {
    sendTask,
  },
};
