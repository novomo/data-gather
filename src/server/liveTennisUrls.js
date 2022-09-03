const { parse } = require("node-html-parser");
const {
  formatDate,
  toTimestamp,
  httpsAgent,
  completeTask,
} = require("./helpers");
const fs = require("fs");
const strptime = require("strptime").strptime;
const fetch = require("node-fetch");
const { API_URL, API_KEY, TENNIS_LIVE_BASE_URL } = require("./secrets");

module.exports.parseliveTennisUrlsData = async (liveTennisData) => {
  //fs.writeFileSync("sportsTestData.json", liveTennisData);
  //return;
  const soup = parse(liveTennisData);
  const feed = soup
    .querySelector('div[class="container__livetable"]')
    .querySelector('section[class="event"]');
  const divs = feed.querySelectorAll("div");
  let competitionURL, compType, eType, comp;
  for (const c in divs) {
    //console.log(divs[c]);
    if (divs[c].classList._set.has("event__header")) {
      //console.log(
      //divs[c].querySelector("ul").querySelectorAll("li")[1].querySelector("a")
      //);

      eTypeEle = divs[c]
        .querySelector("span[class='event__title--type']")
        .innerHTML.trim();
      //console.log(comps[c].innerHTML);

      if (eTypeEle.includes("WTA") || eTypeEle.includes("MEN")) {
        eType = "Women";
      } else if (eTypeEle.includes("ATP") || eTypeEle.includes("WOMEN")) {
        eType = "Men";
      } else {
        eType = null;
      }
      comp = divs[c]
        .querySelector("span[class='event__title--name']")
        .innerHTML.trim();
      competitionURL =
        `https://www.flashscore.co.uk/tennis/${eTypeEle.replaceAll(
          " ",
          "-"
        )}/${comp.split(" (")[0].replaceAll(" ", "-")}`.toLowerCase();
      continue;
    } else if (divs[c].classList._set.has("event__match")) {
      const timeDiv = divs[c].querySelector('div[class="event__time"]');
      if (!timeDiv) {
        continue;
      }
      const matchtime = timeDiv.textContent.trim();
      //console.log(matchtime);
      const matchtimeObject = strptime(
        `${formatDate(new Date().toISOString(), (time = false))} ${matchtime}`,
        "%Y-%m-%d %H:%M"
      );
      const homeTeam = divs[c]
        .querySelector('div[class*="event__participant--home"]')
        .text.trim()
        .split("(")[0]
        .trim();
      const awayTeam = divs[c]
        .querySelector('div[class*="event__participant--away"]')
        .text.trim()
        .split("(")[0]
        .trim();
      const homeURL = `https://www.flashscore.co.uk/tennis/${homeTeam
        .toLowerCase()
        .replaceAll(" ", "-")}`;
      const awayURL = `https://www.flashscore.co.uk/tennis/${awayTeam
        .toLowerCase()
        .replaceAll(" ", "-")}`;
      const matchQuery = `query {
                        matchSportsEvent(
                        inputSportsEvent: {
                            sport: "Tennis",,
                            competition: "${comp}",
                            eventDate: ${toTimestamp(matchtimeObject)},
                            homeTeam: "${homeTeam.split(" ")[0]}",
                            awayTeam: "${awayTeam.split(" ")[0]}",
                            homeTeamURL: "${homeURL}",
                            awayTeamURL: "${awayURL}",
                            competitionURL: "${competitionURL}",
                            homeTeamID: "${homeURL}",
                            awayTeamID: "${awayURL}",
                            competitionID: "${competitionURL}",
                            platform : "livescore"
                        }) {
                        _id
                        }
                    }`;

      console.log(matchQuery);
      let opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "API " + API_KEY,
        },
        body: JSON.stringify({ query: matchQuery }),
        agent: httpsAgent,
      };

      const matchResult = await fetch(API_URL, opts);
      const matchData = await matchResult.json();
      console.log(matchData);
      if (
        !matchData["data"]["matchSportsEvent"]["_id"] &&
        matchData["data"]["matchSportsEvent"]["_id"] === ""
      ) {
        continue;
      }
      const liveUrl = divs[c].attributes.id;
      console.log(liveUrl);
      const query = `mutation {
                    updateSportsEvent(
                        inputSportsEvent: {
                            liveUrl: "${liveUrl}"
                            eventType: "${compType}"
                        }, 
                        _id: "${matchData["data"]["matchSportsEvent"]["_id"]}"
                    )
                }`;
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
    }
  }
};
