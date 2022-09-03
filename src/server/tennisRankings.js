const country = require("countryjs");
const { formatDate, sleep, toTimestamp, httpsAgent } = require("./helpers");
const fetch = require("node-fetch");
const fs = require("fs");
const { API_URL, API_KEY } = require("./secrets");
const REGIONS = [
  "ASIA",
  "CIS",
  "Korea",
  "Europe",
  "Oceania",
  "North America",
  "South America",
  "Latin America",
];

module.exports.parseTennisRankings = async (rankingData) => {
  //fs.writeFileSync("sportsTestData.json", sportsData);
  const jsonData = JSON.parse(rankingData);
  //const jsonData = sportsData;
  let ranking, teamId;
  for (const i in jsonData) {
    console.log(jsonData[i]);
    ranking = jsonData[i].ranking;
    teamId = jsonData[i].team.id;
    query = `mutation {
        updateRankings(sport: "Tennis", platform: "sofascore", teamId: "${teamId}", ranking: ${ranking})
    }`;

    console.log(query);
    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "API " + API_KEY,
      },
      body: JSON.stringify({ query: query }),
      agent: httpsAgent,
    };
    let result;
    //console.log(process.env.API_URL);
    try {
      result = await fetch(API_URL, opts);
    } catch (err) {
      await sleep(10000);
      result = await fetch(API_URL, opts);
    }

    console.log(result);
  }
  return true;
};
