const express = require("express");
const { parseSportsData } = require("./sportsFixtures");
const { parseESportsData } = require("./eSportsFixtures");
const { parseliveTennisUrlsData } = require("./liveTennisUrls");
const { parseTipsterData } = require("./tipsterProfiling");
const { parseSoccerwayPrematch } = require("./soccerwayPrematch");
const {
  parseBetfairEventIdData,
  parseBetfairStartingSoonData,
} = require("./betfair");

const { parseTennisRankings } = require("./tennisRankings");
const webhook = require("webhook-discord");
const fs = require("fs");

const app = express();

const port = 3000;

app.use(express.json({ limit: "50mb" }));

app.post("/", async (req, res) => {
  try {
    const { task, data } = req.body;
    console.log(task);
    switch (task) {
      case "sportsFixtures":
        parseSportsData(data);
        break;
      case "eSportsFixtures":
        parseESportsData(data);
        break;
      case "liveTennisUrls":
        parseliveTennisUrlsData(data);
        break;
      case "tipsterProfiling":
        parseTipsterData(data);
        break;
      case "betfairEventIds":
        parseBetfairEventIdData(data);
        break;
      case "betfairStartingOdds":
        parseBetfairStartingSoonData(data);
        break;
      case "soccerwayPrematch":
        parseSoccerwayPrematch(data);
        break;
      case "tennisRankings":
        parseTennisRankings(data);
        break;
      default:
        break;
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    fs.writeFileSync("lastError.json", err);

    const Hook = new webhook.Webhook(process.env.DISCORD_ERROR);
    Hook.info("Scraper Parser Err", err);
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
