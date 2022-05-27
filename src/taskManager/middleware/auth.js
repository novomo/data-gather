/*
    Auth functions
*/
const { decrypt } = require("../encryption/main");
const { User } = require("../data/mongo");

// Checks token in header
module.exports.isAuth = async function is_auth(context_token) {
  //console.log(context_token)
  // Gets the sent token
  // if no token returns null incase of public paths
  if (!context_token || context_token === "") {
    return [null, null, null];
  }
  // for filtering out unauthorised access from web app
  if (
    context_token.includes("no token") ||
    context_token.includes("not verified") ||
    context_token.includes("no user")
  ) {
    return [null, null, null];
  }
  // obtains token value from auth token
  const token = context_token.split(" ")[1];
  // If no token user can only use none protected  routes
  if (!token || token === "") {
    return [null, null, null];
  }
  if (context_token.includes("API")) {
    //console.log(token)
    const user = await User.findOne({ accessToken: decrypt(token) });
    //console.log(user)
    if (!user) {
      return [null, null, null];
    }
    return [token, user._doc._id, user._doc.level];
  } else {
    return [null, null, null];
  }
};
