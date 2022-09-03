const { parse } = require("node-html-parser");
const { API_URL, API_KEY } = require("./secrets");
const { toTimestamp, httpsAgent, completeTask } = require("./helpers");
const fs = require("fs");
const fetch = require("node-fetch");

const scoringData = (scoringChart) => {
  return {
    FPeriodPer: parseFloat(
      scoringChart[1].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    FPeriodNum: parseFloat(
      scoringChart[1].getElementsByTagName("td")[1].textContent
    ),
    SPeriodPer: parseFloat(
      scoringChart[2].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    SPeriodNum: parseFloat(
      scoringChart[2].getElementsByTagName("td")[1].textContent
    ),
    TPeriodPer: parseFloat(
      scoringChart[3].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    TPeriodNum: parseFloat(
      scoringChart[3].getElementsByTagName("td")[1].textContent
    ),
    FoPeriodPer: parseFloat(
      scoringChart[4].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    FoPeriodNum: parseFloat(
      scoringChart[4].getElementsByTagName("td")[1].textContent
    ),
    FiPeriodPer: parseFloat(
      scoringChart[5].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    FiPeriodNum: parseFloat(
      scoringChart[5].getElementsByTagName("td")[1].textContent
    ),
    SiPeriodPer: parseFloat(
      scoringChart[6].getElementsByTagName("td")[0].textContent.replace("%", "")
    ),
    SiPeriodNum: parseFloat(
      scoringChart[6].getElementsByTagName("td")[1].textContent
    ),
  };
};

const getScoringMintues = async (document) => {
  const homeGoalChart = document
    .querySelector('[id="scoring_minutes_chart_a"]')
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tr");
  const awayGoalChart = document
    .querySelector('[id="scoring_minutes_chart_b"]')
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tr");

  return [scoringData(homeGoalChart), scoringData(awayGoalChart)];
};

const getStatData = (statisticRows, col) => {
  console.log(col);
  if (statisticRows[0].getElementsByTagName("th")[0].textContent === "Rank") {
    console.log(statisticRows[4].getElementsByTagName("td"));
    return {
      matchesPlayed: parseInt(
        statisticRows[1].querySelector(`[class*="${col}"]`).textContent
      ),
      wins: parseInt(
        statisticRows[2].querySelector(`[class*="${col}"]`).textContent
      ),
      draws: parseInt(
        statisticRows[3].querySelector(`[class*="${col}"]`).textContent
      ),
      losses: parseInt(
        statisticRows[4].querySelector(`[class*="${col}"]`).textContent
      ),
      scored: parseInt(
        statisticRows[5].querySelector(`[class*="${col}"]`).textContent
      ),
      conceded: parseInt(
        statisticRows[6].querySelector(`[class*="${col}"]`).textContent
      ),
      points: parseInt(
        statisticRows[7].querySelector(`[class*="${col}"]`).textContent
      ),
      cleanSheets: parseInt(
        statisticRows[8].querySelector(`[class*="${col}"]`).textContent
      ),
      averGoalsScored: parseInt(
        statisticRows[9].querySelector(`[class*="${col}"]`).textContent
      ),
      averGoalsConceded: parseInt(
        statisticRows[10].querySelector(`[class*="${col}"]`).textContent
      ),
      avgFirstGoalScored:
        statisticRows[11]
          .querySelector(`[class*="${col}"]`)
          .textContent.replace("m", "")
          .trim() != "-"
          ? parseInt(
              statisticRows[11]
                .querySelector(`[class*="${col}"]`)
                .textContent.replace("m", "")
            )
          : -1,
      avgFirstGoalConceded:
        statisticRows[12]
          .querySelector(`[class*="${col}"]`)
          .textContent.replace("m", "")
          .trim() != "-"
          ? parseInt(
              statisticRows[12]
                .querySelector(`[class*="${col}"]`)
                .textContent.replace("m", "")
            )
          : -1,
      failedToScore: parseInt(
        statisticRows[13].querySelector(`[class*="${col}"]`).textContent
      ),
    };
  } else {
    console.log(
      statisticRows[10]
        .querySelector(`[class*="${col}"]`)
        .textContent.replace("m", "")
        .trim()
    );
    return {
      matchesPlayed: parseInt(
        statisticRows[0].querySelector(`[class*="${col}"]`).textContent
      ),
      wins: parseInt(
        statisticRows[1].querySelector(`[class*="${col}"]`).textContent
      ),
      draws: parseInt(
        statisticRows[2].querySelector(`[class*="${col}"]`).textContent
      ),
      losses: parseInt(
        statisticRows[3].querySelector(`[class*="${col}"]`).textContent
      ),
      scored: parseInt(
        statisticRows[4].querySelector(`[class*="${col}"]`).textContent
      ),
      conceded: parseInt(
        statisticRows[5].querySelector(`[class*="${col}"]`).textContent
      ),
      points: parseInt(
        statisticRows[6].querySelector(`[class*="${col}"]`).textContent
      ),
      cleanSheets: parseInt(
        statisticRows[7].querySelector(`[class*="${col}"]`).textContent
      ),
      averGoalsScored: parseInt(
        statisticRows[8].querySelector(`[class*="${col}"]`).textContent
      ),
      averGoalsConceded: parseInt(
        statisticRows[9].querySelector(`[class*="${col}"]`).textContent
      ),
      avgFirstGoalScored:
        statisticRows[10]
          .querySelector(`[class*="${col}"]`)
          .textContent.replace("m", "")
          .trim() != "-"
          ? parseInt(
              statisticRows[10]
                .querySelector(`[class*="${col}"]`)
                .textContent.replace("m", "")
            )
          : -1,
      avgFirstGoalConceded:
        statisticRows[11]
          .querySelector(`[class*="${col}"]`)
          .textContent.replace("m", "")
          .trim() != "-"
          ? parseInt(
              statisticRows[11]
                .querySelector(`[class*="${col}"]`)
                .textContent.replace("m", "")
            )
          : -1,
      failedToScore: parseInt(
        statisticRows[12].querySelector(`[class*="${col}"]`).textContent
      ),
    };
  }
};

const getStatistics = (document) => {
  console.log(
    document.querySelector('[id*="page_match_1_block_h2hsection_team"]')
  );

  const statisticRows = document
    .querySelector('[id*="page_match_1_block_h2hsection_team"]')
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  const awayStatistics = {
    all: getStatData(statisticRows, "total"),
    home: getStatData(statisticRows, "home"),
    away: getStatData(statisticRows, "away"),
  };
  const homeStatistics = {
    all: getStatData(statisticRows, "total"),
    home: getStatData(statisticRows, "home"),
    away: getStatData(statisticRows, "away"),
  };

  const homeRank =
    parseInt(statisticRows[0].getElementsByTagName("td")[0].textContent) || 99;
  const awayRank =
    parseInt(statisticRows[0].getElementsByTagName("td")[3].textContent) || 99;

  return [homeStatistics, awayStatistics, homeRank, awayRank];
};

const getHead2Head = (document) => {
  const tableRows = document
    .querySelector(
      '[id="page_match_1_block_h2hsection_head2head_7_block_h2h_matches_1-wrapper"]'
    )
    .getElementsByTagName("table")[0]
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  const h2hMatches = [];
  for (let i = 0; i < tableRows.length; i++) {
    if (tableRows[i].querySelector('[class*="score"]').length === 0) {
      continue;
    }
    //console.log(tableRows[i])
    h2hMatches.push({
      home: tableRows[i]
        .querySelector('[class*="team-a"]')
        .getElementsByTagName("a")[0]
        .textContent.trim(),
      away: tableRows[i]
        .querySelector('[class*="team-b"]')
        .getElementsByTagName("a")[0]
        .textContent.trim(),
      result: tableRows[i]
        .querySelector('[class*="score"]')
        .getElementsByTagName("a")[0]
        .textContent.trim(),
    });
  }
  return h2hMatches;
};

const calcStratgies = (
  homeAverageGoalsPerGame,
  awayAverageGoalsPerGame,
  percentOfGoalsInFHHome,
  percentOfGoalsInFHAway,
  percentOfGoalsInSHHome,
  percentOfGoalsInSHAway,
  homeStatistics,
  awayStatistics,
  homeRank,
  awayRank,
  homeForm,
  awayForm,
  homeScoringMinutes,
  awayScoringMinutes
) => {
  // lay under 1.5, LTD, SH Domination,
  // under 3.5, under 2.5,
  // FH Domination, FH LTD
  const strategies = [];
  console.log("this is the from data");
  console.log(homeForm, awayForm);
  if ((percentOfGoalsInSHHome + percentOfGoalsInSHAway) / 2 > 60) {
    if (homeForm["over15Per"] > 80 && awayForm["over15Per"] > 80) {
      if (homeForm["over25Per"] > 70 && awayForm["over25Per"] > 70) {
        if (percentOfGoalsInFHHome > 40 || percentOfGoalsInFHAway > 40) {
          strategies.push("FH LTD");
          if (homeRank - awayRank > 5 || awayRank - homeRank > 5) {
            strategies.push("FH Domination");
          }
        }
        if (homeForm["over35Per"] > 40 && awayForm["over35Per"] > 40) {
          strategies.push("HT LTD");
          strategies.push("Lay Under 1.5");
          if (homeRank - awayRank > 5 || awayRank - homeRank > 5) {
            strategies.push("SH Domination");
          }
        }
      }
    }
  }

  if (homeAverageGoalsPerGame > 2.5 || awayAverageGoalsPerGame > 2.5) {
    if (
      homeStatistics.home.avgFirstGoalScored > 18 &&
      homeStatistics.home.avgFirstGoalConceded > 18 &&
      awayStatistics.away.avgFirstGoalScored > 18 &&
      awayStatistics.away.avgFirstGoalConceded > 18
    ) {
      if (percentOfGoalsInFHHome < 30 && percentOfGoalsInFHAway < 30) {
        if (
          homeScoringMinutes.FPeriodPer < 15 &&
          awayScoringMinutes.FPeriodPer < 15
        ) {
          if (
            homeScoringMinutes.SPeriodPer < 15 &&
            awayScoringMinutes.SPeriodPer < 15
          ) {
            strategies.push("Under 2.5");
            strategies.push("Under 3.5");
          }
        }
      }
    }
  }

  return strategies;
};

function array_gql_string(data) {
  let returnString = "";
  for (let i = 0; i < data.length; i++) {
    returnString = returnString + '"' + data[i] + '", ';
  }
  return returnString;
}

const queryfy = (obj) => {
  // Make sure we don't alter integers.
  if (typeof obj === "number") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const props = obj.map((value) => `${queryfy(value)}`).join(",");
    return `[${props}]`;
  }

  if (typeof obj === "object") {
    const props = Object.keys(obj)
      .map((key) => `${key}:${queryfy(obj[key])}`)
      .join(",");
    return `{${props}}`;
  }

  return JSON.stringify(obj);
};

async function send_match(match) {
  console.log(match);
  const strategies = array_gql_string(match.tradingStrategies);
  query = `mutation {
              updateSportsEvent(
                inputSportsEvent: {
                  preTradesStrategies: [${strategies}],
                  homeMatchStats: ${queryfy(match.homeMatchStats)},
                  awayMatchStats: ${queryfy(match.awayMatchStats)},
                  head2head: ${queryfy(match.head2head)}
              } ,
              _id: "${match.id}"
              )
            }`;
  console.log(query);
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "API " + API_KEY,
    },
    body: JSON.stringify({ query }),
    agent: httpsAgent,
  };
  console.log(query);
  const result = await fetch(API_URL, opts);
  const success = await result.json();
  console.log(success);

  //await sleep(10000)
  if (success.errors) {
    throw new Error("poo");
  }
  return success;
}

module.exports.parseSoccerwayPrematch = async (data) => {
  //fs.writeFileSync("sportsTestData.json", data);
  //const data = JSON.parse(fs.readFileSync("sportsTestData.json", "utf8"));
  const { page, comp, forms, match } = JSON.parse(data);
  const document = parse(page);
  //console.log(page);
  const scoringMinutesA = document.querySelector(
    '[id="scoring_minutes_chart_a"]'
  );
  const scoringMinutesB = document.querySelector(
    '[id="scoring_minutes_chart_b"]'
  );

  let homeScoringMinutes = null;
  let awayScoringMinutes = null;
  if (
    (scoringMinutesA || scoringMinutesA !== null) &&
    (scoringMinutesB || scoringMinutesB !== null)
  ) {
    [homeScoringMinutes, awayScoringMinutes] = await getScoringMintues(
      document
    );
  }

  // get statistics
  console.log(2);

  const [homeStatistics, awayStatistics, homeRank, awayRank] =
    getStatistics(document);
  let strategies;
  console.log(homeStatistics.home.averGoalsScored);
  if (
    homeStatistics.home.avgFirstGoalScored === -1 ||
    awayStatistics.away.avgFirstGoalScored === -1 ||
    homeStatistics.home.avgFirstGoalConceded === -1 ||
    awayStatistics.away.avgFirstGoalConceded === -1
  ) {
    strategies = [];
  } else {
    const homeAverageGoalsPerGame =
      homeStatistics.home.averGoalsScored +
      homeStatistics.home.averGoalsConceded;
    const awayAverageGoalsPerGame =
      awayStatistics.away.averGoalsScored +
      awayStatistics.away.averGoalsConceded;

    const percentOfGoalsInFHHome =
      homeScoringMinutes.FPeriodPer +
      homeScoringMinutes.SPeriodPer +
      homeScoringMinutes.TPeriodPer;
    const percentOfGoalsInFHAway =
      awayScoringMinutes.FPeriodPer +
      awayScoringMinutes.SPeriodPer +
      awayScoringMinutes.TPeriodPer;
    const percentOfGoalsInSHHome =
      homeScoringMinutes.FoPeriodPer +
      homeScoringMinutes.FiPeriodPer +
      homeScoringMinutes.SiPeriodPer;
    const percentOfGoalsInSHAway =
      awayScoringMinutes.FoPeriodPer +
      awayScoringMinutes.FiPeriodPer +
      awayScoringMinutes.SiPeriodPer;
    strategies = calcStratgies(
      homeAverageGoalsPerGame,
      awayAverageGoalsPerGame,
      percentOfGoalsInFHHome,
      percentOfGoalsInFHAway,
      percentOfGoalsInSHHome,
      percentOfGoalsInSHAway,
      homeStatistics,
      awayStatistics,
      homeRank,
      awayRank,
      forms["container-left"]["form"],
      forms["container-right"]["form"],
      homeScoringMinutes,
      awayScoringMinutes
    );
  }

  console.log(strategies);
  // head 2 head

  const head2head = getHead2Head(document);

  // get home forms
  let homeMatchStats;
  let awayMatchStats;

  if (!homeScoringMinutes || homeScoringMinutes === null) {
    homeMatchStats = {
      ...forms["container-left"],
      ...homeStatistics,
      rank: homeRank,
    };
  } else {
    homeMatchStats = {
      ...forms["container-left"],
      ...homeStatistics,
      rank: homeRank,
      scoringMinutes: homeScoringMinutes,
    };
  }

  // get away forms
  if (!homeScoringMinutes || homeScoringMinutes === null) {
    awayMatchStats = {
      ...awayStatistics,
      rank: awayRank,
    };
  } else {
    awayMatchStats = {
      ...awayStatistics,
      rank: awayRank,
      scoringMinutes: awayScoringMinutes,
    };
  }
  console.log(comp);
  console.log(match);
  console.log(match["competitionID"]);
  console.log(comp);
  //await sleep(10000)

  // total scored

  if (!comp["home"] || !comp["away"]) {
    return false;
  }
  if (
    comp["home"]["matchesPlayed"] === 0 ||
    comp["home"]["matchesPlayed"] === 0 ||
    comp["home"]["goalsConceded"] === 0 ||
    comp["away"]["goalsConceded"] === 0
  ) {
    return false;
  }
  const AGSaH = comp["home"]["goalsScored"] / comp["home"]["matchesPlayed"];
  const AGSaA = comp["away"]["goalsScored"] / comp["away"]["matchesPlayed"];
  // total conceded
  const AGCaH = comp["home"]["goalsConceded"] / comp["home"]["goalsConceded"];
  const AGCaA = comp["away"]["goalsConceded"] / comp["away"]["goalsConceded"];
  // home average scored
  const HTAGSaH =
    homeMatchStats["home"]["scored"] /
    homeMatchStats["home"]["matchesPlayed"] /
    AGSaH;
  // away average conceded
  const ATAGCaA =
    awayMatchStats["away"]["conceded"] /
    awayMatchStats["away"]["matchesPlayed"] /
    AGCaA;
  //home team xG
  homeMatchStats["expectedGoals"] = HTAGSaH * ATAGCaA * AGSaH;
  // away average scored
  const ATAGSaA =
    awayMatchStats["away"]["scored"] /
    homeMatchStats["away"]["matchesPlayed"] /
    AGSaA;
  // home average conceded
  const HTAGCaH =
    homeMatchStats["home"]["conceded"] /
    awayMatchStats["home"]["matchesPlayed"] /
    AGCaH;
  //away team xG
  awayMatchStats["expectedGoals"] = ATAGSaA * HTAGCaH * AGCaA;

  if (!awayMatchStats["expectedGoals"] || !homeMatchStats["expectedGoals"]) {
    return false;
  }
  const newMatch = {
    ...match,
    tradingStrategies: strategies,
    homeMatchStats,
    awayMatchStats,
    head2head,
    id: match._id,
  };
  console.log(newMatch);
  await send_match(newMatch);
};
