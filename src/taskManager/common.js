const { PubSub } = require("graphql-subscriptions");
const { User } = require("./data/mongo");

const pubsub = new PubSub();

module.exports.pubsub = pubsub;

module.exports.checkUser = async (userId) => {
  if (!userId) {
    return false;
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return false;
  }
  //console.log(user)
  return true;
};
