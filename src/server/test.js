const { parseliveTennisUrlsData } = require("./liveTennisUrls.js");
const fs = require("fs");

//const obj = JSON.parse(fs.readFileSync("sportsTestData.json", "utf8"));
const page = fs.readFileSync("sportsTestData.json", "utf8");
parseliveTennisUrlsData(page);
