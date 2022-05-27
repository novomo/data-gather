const { ApolloServer } = require("apollo-server-express");
const https = require("https");
const fs = require("fs");
// User imported functions
const { isAuth } = require("../middleware/auth");
const app = require("./expressApp");
const { typeDefs, resolvers } = require("./graphQL");

// apollo setup
const apollo = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers,
  context: async ({ req, res }) => {
    let currentUser = null;
    let permissions = null;
    let token = null;
    try {
      //console.log(req.headers)
      const authToken = req.headers["authorization"];
      //console.log(authToken)
      if (authToken) {
        [token, currentUser, permissions] = await isAuth(authToken);
      }
    } catch (e) {
      // Doesn't through error cause there are so public resolvers that can be reached.
      //console.log(e)
      return {
        req,
        res,
        token,
        currentUser,
        permissions,
      };
    }
    // returns all needed user data if it is found
    //console.log(token, currentUser, permissions)
    return {
      req,
      res,
      token,
      currentUser,
      permissions,
    };
  },
});

// add middleware
apollo.applyMiddleware({ app, cors: false });

app.on("error", (err) => {
  console.log(err);
});

https.globalAgent.keepAlive = true;

// define server with websocket error control
server = https
  .createServer(
    {
      key: fs.readFileSync(process.env.CERT_KEY, "utf8"),
      cert: fs.readFileSync(process.env.CERT_PEM, "utf8"),
    },
    app
  )
  .addListener("session", (session) => {
    session.setTimeout(60_000, () => session.destroy(new Error("TIMEOUT")));
  })
  .addListener("stream", (stream, headers) => {
    stream.addListener("error", (err) => stream.destroy(err));
  })
  .addListener("clientError", function (err, socket) {
    socket.destroy(err);
    /* On client connection error */
  })
  .addListener("sessionError", (err, socket) => {
    socket.destroy(err);
  })
  .on("secureConnection", function (socket) {
    socket.on("error", (err) => {
      console.log(err);
    });
    /* On client connection error */
  })
  .setTimeout(120_000);

// if any uncaught server errors occur.
process.on("uncaughtException", (error, origin) => {
  if (error?.code === "ETIMEDOUT") return;
  console.error("UNCAUGHT EXCEPTION");
  console.error(error);
  console.error(origin);
});

// add middleware for subscriptions
apollo.installSubscriptionHandlers(server);

module.exports.server = server;
