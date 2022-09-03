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

module.exports.parseSportsData = async (sportsData) => {
  //fs.writeFileSync("sportsTestData.json", sportsData);
  const jsonData = JSON.parse(sportsData);
  //const jsonData = sportsData;

  let region, competition, eventType;
  for (const i in jsonData) {
    const gameID = jsonData[i]["id"];
    const homeTeam = jsonData[i]["homeTeam"]["name"];
    const awayTeam = jsonData[i]["awayTeam"]["name"];
    let sport = jsonData[i]["tournament"]["category"]["sport"]["name"];
    console.log(homeTeam, awayTeam);
    if (sport.toLowerCase() === "tennis") {
      if (
        /r\d\dp\d/i.test(awayTeam) ||
        /r\d\dp\d/i.test(awayTeam) ||
        /Wsf\d/i.test(awayTeam) ||
        /Wsf\d/i.test(awayTeam)
      ) {
        console.log("not adding");
        continue;
      } else {
        console.log(jsonData[i]);
      }
    }
    console.log(jsonData[i]);
    const competitionURL = `https://www.sofascore.com/tournament/${sport.toLowerCase()}/${
      jsonData[i]["tournament"]["slug"]
    }/${jsonData[i]["tournament"]["category"]["slug"]}/${
      jsonData[i]["tournament"]["id"]
    }`;
    console.log(sport);
    if (sport.toLowerCase() === "rugby") {
      sport = jsonData[i]["tournament"]["category"]["name"];
      region = "";
    } else if (sport.toLowerCase() == "tennis") {
      let regionString = jsonData[i]["tournament"]["name"];
      region = "";
      let regionDets = country.info(regionString, "name");
      if (!regionDets) {
        regionDets = country.info(regionString, "ISO3");
      } else {
        region = regionDets.name;
      }
      if (!regionDets) {
        for (const r in REGIONS) {
          if (regionString.includes(REGIONS[r])) {
            region = REGIONS[r];
          }
        }
      }

      if (region === "") {
        const regionAbbr = jsonData[i]["tournament"]["name"].split("-");
        if (regionAbbr.lenth >= 2) {
          if (regionAbbr[regionAbbr.length - 2] == "CRO") {
            region = "Croatia";
          } else {
            regionDets = country.info(regionString, "ISO3");
            if (regionDets) {
              region = regionDets.name;
            }
          }
        } else {
          if (
            jsonData[i]["tournament"]["category"]["name"].toLowerCase() ==
            "other"
          ) {
            region = "World";
          }
        }
      }
    } else {
      region = jsonData[i]["tournament"]["category"]["name"];
    }
    competition = jsonData[i]["tournament"]["name"].replace('"', "'");

    region = region.replace(" Amateur", "");

    if (sport.toLowerCase() == "tennis") {
      if (
        jsonData[i]["tournament"]["category"]["name"]
          .toLowerCase()
          .includes("wta") ||
        jsonData[i]["tournament"]["category"]["name"]
          .toLowerCase()
          .includes("w-itf")
      ) {
        eventType = "Women";
      } else if (
        jsonData[i]["tournament"]["category"]["name"]
          .toLowerCase()
          .includes("atp") ||
        jsonData[i]["tournament"]["category"]["name"]
          .toLowerCase()
          .includes("m-itf")
      ) {
        eventType = "Men";
      } else if (
        jsonData[i]["tournament"]["category"]["name"].toLowerCase() == "other"
      ) {
        eventType = "Any";
      }
    } else {
      if (competition.toLowerCase().includes("women")) {
        eventType = "Women";
      } else if (
        competition.search(/\su\d\d/i) ||
        competition.toLowerCase().includes("youth")
      ) {
        eventType = "Youth";
      } else {
        eventType = "Men";
      }
    }
    const competitionID = jsonData[i]["tournament"]["id"];

    //console.log(teamsData[2].get_attribute('innerHTML'))
    const startTime = formatDate(
      parseInt(jsonData[i]["startTimestamp"]) * 1000,
      (time = true)
    );
    const fixture = `${homeTeam} - ${awayTeam}`;
    const homeTeamURL = `https://www.sofascore.com/team/${sport.toLowerCase()}/${
      jsonData[i]["homeTeam"]["slug"]
    }/${jsonData[i]["homeTeam"]["id"]}`;
    const awayTeamURL = `https://www.sofascore.com/team/${sport.toLowerCase()}/${
      jsonData[i]["awayTeam"]["slug"]
    }/${jsonData[i]["awayTeam"]["id"]}`;
    const url = `https://www.sofascore.com/${jsonData[i]["slug"]}/${jsonData[i]["customId"]}`;
    console.log(
      region,
      competition,
      startTime,
      sport,
      fixture,
      homeTeam,
      awayTeam
    );
    console.log(url);
    let status;
    if (new Date() < new Date(parseInt(jsonData[i]["startTimestamp"]) * 1000)) {
      status = "Pending";
    } else {
      status = "Finished";
    }
    query = `mutation {
            updateSportsEvent(inputSportsEvent: {
                eventType:  "${eventType}"
                homeTeam:  "${homeTeam}",
                awayTeam:  "${awayTeam}",
                url:  "${url}",
                sport:  "${sport}",
                region:  "${region}",
                eventDate: ${toTimestamp(
                  new Date(parseInt(jsonData[i]["startTimestamp"]) * 1000)
                )},
                startTimeText:  "${startTime}",
                competition:  "${competition}",
                platform: "sofascore",
                status:  "${status}",
                homeTeamURL:  "${homeTeamURL}",
                homeTeamID:  "${homeTeamURL.split("/").slice(-1)}",
                awayTeamURL:  "${awayTeamURL}",
                awayTeamID:  "${awayTeamURL.split("/").slice(-1)}",
                competitionURL:  "${competitionURL}",
                competitionID:  "${competitionID}",
            })
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
