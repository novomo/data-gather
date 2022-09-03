const { toTimestamp, httpsAgent, completeTask } = require("./helpers");
const fetch = require("node-fetch");
const { parse } = require("node-html-parser");
const strptime = require("strptime").strptime;
const { API_URL, API_KEY, ESPORTS_BASE_URL } = require("./secrets");
const fs = require("fs");
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

module.exports.parseESportsData = async (eSportsData) => {
  //fs.writeFileSync("sportsTestData.json", eSportsData);
  //return;

  const soup = parse(eSportsData);
  const matches = soup.querySelectorAll('div[class="make_bnt_list"]');
  for (const m in matches) {
    console.log(matches[m]);
    const startTime = matches[m]
      .querySelector("span[class*='matchTime']")
      .text.trim();
    console.log(startTime);
    if (startTime == "Live") {
      continue;
    }
    const homeTeam = matches[m]
      .querySelector('span[class*="matchTeamLeft"]')
      .querySelector('span[class*="matchTeamName"]')
      .text.trim();
    const awayTeam = matches[m]
      .querySelector('span[class*="matchTeamRight"]')
      .querySelector('span[class*="matchTeamName"]')
      .text.trim();
    if (
      homeTeam === "" ||
      awayTeam === "" ||
      homeTeam === "TBD" ||
      awayTeam === "TBD"
    ) {
      return;
    }

    console.log(matches[m].querySelector('span[class*="matchIcon"]'));
    const sport = matches[m]
      .querySelector('span[class*="matchIcon"]')
      .getElementsByTagName("img")[0].attributes.alt;
    const competition = matches[m]
      .querySelector('span[class*="tournamentName"]')
      .text.trim()
      .split(" - ")[0];

    let region = "World";

    const homeTeamURL = `${ESPORTS_BASE_URL}/${homeTeam}/${sport}`;
    const awayTeamURL = `${ESPORTS_BASE_URL}/${awayTeam}/${sport}`;
    const competitionURL = `${ESPORTS_BASE_URL}/${competition}/${sport}`;

    const url = `${ESPORTS_BASE_URL}${
      matches[m].querySelector('a[class*="matchBox"]').attributes.href
    }`;
    console.log(region, competition, startTime, sport, homeTeam, awayTeam);
    console.log(url);
    console.log(homeTeam, awayTeam);

    const status = "Pending";
    query = `mutation {
                            updateSportsEvent(inputSportsEvent: {
                                homeTeam: "${homeTeam}",
                                awayTeam: "${awayTeam}",
                                url: "${url}",
                                sport: "${sport}",
                                region: "${region}",
                                eventDate: ${toTimestamp(
                                  strptime("13.09.22 13:00", "%d.%m.%y %H:%M")
                                )},
                                startTimeText: "${startTime}",
                                competition: "${competition}",
                                platform: "esportguide",
                                status: "${status}",
                                homeTeamURL: "${ESPORTS_BASE_URL}{homeTeamURL}",
                                homeTeamID: "${homeTeamURL}",
                                awayTeamURL: "${ESPORTS_BASE_URL}{awayTeamURL}",
                                awayTeamID: "${awayTeamURL}",
                                competitionURL: "${competitionURL}",
                                competitionID: "${competitionURL}",
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

    const result = await fetch(API_URL, opts);
  }
};
