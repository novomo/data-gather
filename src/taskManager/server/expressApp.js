/*
    Express App Configuration
*/
// node mmodules
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// initiate express app
const app = express();

// add middleware to app
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(function (req, res, next) {
  res.setTimeout(120000, function () {
    console.log("Request has timed out.");
    res.send(408);
  });

  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

module.exports = app;
