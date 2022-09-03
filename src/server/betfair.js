const { toTimestamp, httpsAgent, completeTask, sleep } = require("./helpers");
const fetch = require("node-fetch");
const { API_URL, API_KEY } = require("./secrets");
const fs = require("fs");
const { ifError } = require("assert");
module.exports.parseBetfairEventIdData = async (data) => {
  //fs.writeFileSync("sportsTestData.json", data);
  //return;
  const dateJSON = JSON.parse(data);
  const competitions = dateJSON["attachments"]["competitions"];
  const events = dateJSON["attachments"]["events"];
  const markets = dateJSON["attachments"]["markets"];
  let competition, event, teams;
  getDate = new Date();
  getDate.setHours(0, 0, 0);
  startingTimestamp = toTimestamp(getDate);
  for (const m in markets) {
    const market = markets[m];
    console.log(market);
    event = events[market["eventId"].toString()];
    console.log(event);
    if (!market["competitionId"]) {
      continue;
    }
    competition = competitions[market["competitionId"].toString()];

    if (!competition) {
      continue;
    }

    teams = event["name"].split(" v ");
    eType = null;
    if (
      competition["name"].toLowerCase().includes("men's") ||
      competition["name"].toLowerCase().includes("atp ")
    ) {
      eType = "Men";
    } else if (
      competition["name"].toLowerCase().includes("women") ||
      competition["name"].toLowerCase().includes("wta ")
    ) {
      eType = "Women";
    }
    let query;
    if (!eType) {
      query = `query {
                        matchSportsEvent(
                        inputSportsEvent: {
                            sport: "Tennis",
                            competition: "${competition["name"]}",
                            startTimeText: "${startingTimestamp}",
                            homeTeam: "${teams[0]}",
                            awayTeam: "${teams[1]}",
                            homeTeamID: "${market["runners"][0]["selectionId"]}",
                            awayTeamID: "${market["runners"][1]["selectionId"]}",
                            competitionID: "${market["competitionId"]}",
                            platform : "betfair"
                        }) {
                        _id
                        }
                    }`;
    } else {
      query = `query {
                matchSportsEvent(
                inputSportsEvent: {
                    sport: "Tennis",
                    competition: "${competition["name"]}",
                    startTimeText: "${startingTimestamp}",
                    homeTeam: "${teams[0]}",
                    awayTeam: "${teams[1]}",
                    homeTeamID: "${market["runners"][0]["selectionId"]}",
                    awayTeamID: "${market["runners"][1]["selectionId"]}",
                    competitionID: "${market["competitionId"]}",
                    platform : "betfair",
                    eventType: "${eType}"
                }) {
                _id
                }
              }`;
    }
    console.log(query);
    let opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "API " + API_KEY,
      },
      body: JSON.stringify({ query: query }),
      agent: httpsAgent,
    };

    let match;
    try {
      match = await fetch(API_URL, opts);
    } catch (err) {
      console.log(error.name);
      if (error.name === "ECONNREFUSED") {
        console.log("request was refused");
      }
      await sleep(10000);
      match = await fetch(API_URL, opts);
    }

    console.log(match.headers);
    let matchData;

    matchData = await match.text();
    console.log(matchData);
    matchData = JSON.parse(matchData);

    console.log(matchData);

    if (
      matchData["data"]["matchSportsEvent"]["_id"] &&
      matchData["data"]["matchSportsEvent"]["_id"] !== ""
    ) {
      let selectionString = "[";
      for (s in market["runners"]) {
        const selection = market["runners"][s];
        selectionString = `${selectionString} { selectionId: "${selection["selectionId"]}", selectionName: "${selection["runnerName"]}" },`;
      }
      selectionString = selectionString + "]";
      query = `mutation {
                updateSportsEvent(
                    inputSportsEvent: {
                        betFair: {
                                eventId:  "${market["eventId"]}",
                                markets: [{
                                    marketId: "${market["marketId"]}",
                                    marketName: "${market["marketName"]}",
                                    selections: ${selectionString}
                                }]
                            }
                    },
                    _id: "${matchData["data"]["matchSportsEvent"]["_id"]}"
                )
            }`;
      console.log(query);
      opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "API " + API_KEY,
        },
        body: JSON.stringify({ query: query }),
        agent: httpsAgent,
      };

      const data = await fetch(API_URL, opts);
      console.log(data);
      console.log(data.json());
    }
  }
};

module.exports.parseBetfairStartingSoonData = async (data) => {
  const events = JSON.parse(data);
  for (const e in events) {
    if(!events[e]["betFair"]) {
      continue
    }
    eventId = events[e]["betFair"]["eventId"];
    console.log(events[e]);
    markets = events[e]["betFair"]["markets"];
    for (const b in betfairEvents) {
      //console.log(eventId)
      console.log(betfairEvent);
      if (betfairEvent[b]["eventId"].toString() === eventId) {
        let oddsString = "[";
        for (const m in markets) {
          let selections = market[m]["selections"];
          for (const bm in betfairEvent[b]["marketNodes"]) {
            console.log(markets[m]["marketId"]);
            console.log(betfairEvent[b]["marketNodes"][bm]["marketId"]);
            if (
              markets[m]["marketId"] ==
              betfairEvent[b]["marketNodes"][bm]["marketId"]
            ) {
              const oddsObjects = betfairEvent[b]["marketNodes"][bm]["runners"];
              oddsString = `${oddsString}{{ market: "${markets[m]["marketName"]}", bets: [`;

              for (const r in oddsObjects) {
                for (const runr in selections) {
                  let selectName;
                  if (
                    selections[runr]["selectionId"] ===
                    str(oddsObjects[r]["selectionId"])
                  ) {
                    selectName = runr["selectionName"];
                  }
                }
                oddsString = `${oddsString}{{ name: "${selectName}",  odds: ${runner["exchange"]["availableToBack"][0]["price"]} }},`;
              }
            }
          }
          oddsString = oddsString + "] } ]";
        }
        query = `mutation {
                        updateSportsEvent(
                            inputSportsEvent: {
                                odds: ${oddsString}
                            },
                            _id: "${events[e]["_id"]}"
                        )
                    }`;
        const opts = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "API " + API_KEY,
          },
          body: JSON.stringify({ query: query }),
          agent: httpsAgent,
        };

        const data = await fetch(API_URL, opts);
        console.log(data);
        console.log(finalRes);
      }
    }
  }
};
