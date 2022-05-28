const { checkUser } = require("../../../common");

module.exports = async (_, { task }, { currentUser }) => {
  const check = await checkUser(currentUser);

  if (!check) {
    throw new Error("Not authenicated!");
  }
  try {
    pubsub.publish("SEND_TASK", {
      sendTask: {
        task,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
