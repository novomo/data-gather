const { parse } = require("node-html-parser");
const fetch = require("node-fetch");
const { API_URL, API_KEY } = require("./secrets");
const fs = require("fs");
const {
  checkBlogIsActive,
  getBlogDashData,
  getStatsPageData,
} = require("./blogabet");
const { httpsAgent, completeTask } = require("./helpers");
const blogabet = async (dashboardString, statisticsString, link) => {
  let stats = { link: link };
  const dashboard = parse(dashboardString);
  const statistics = parse(statisticsString);
  stats = getBlogDashData(stats, dashboard);
  console.log(stats);
  if (!checkBlogIsActive(statistics) || !stats["numberOfTips"]) {
    return false;
  }
  console.log("here");
  const { newStats, categoryData, sportsData } = getStatsPageData(
    stats,
    statistics
  );
  console.log(newStats);
  if (!newStats) {
    return false;
  }
  stats = newStats;

  console.log(stats);

  let sportsText = "[";
  for (const s in sportsData) {
    sportsText =
      sportsText +
      `{ name: "${sportsData[s]["name"]}", winRatio: ${
        sportsData[s]["win_ratio"] / 100
      }, yield: ${sportsData[s]["yield"]}, tipNum: ${
        sportsData[s]["tipNum"]
      } },`;
  }
  sportsText = sportsText + "]";
  console.log(sportsText);
  categoryText = "[";
  for (const c in categoryData) {
    categoryText =
      categoryText +
      `{ name: "${categoryData[c]["name"].replace(' - ', '-')}", winRatio: ${
        categoryData[c]["win_ratio"] / 100
      }, yield: ${categoryData[c]["yield"]}, tipNum: ${
        categoryData[c]["tipNum"]
      }},`;
  }
  categoryText = categoryText + "]";
  let status;
  if (sportsText == "[]" || categoryText == "[]") {
    return;
  }
  if (stats["number_of_tips"] > 200 && stats["yield_percentage"] > 4.99) {
    status = "live";
  } else if (
    stats["number_of_tips"] > 1000 &&
    stats["yield_percentage"] > 3.0
  ) {
    status = "live";
  } else if (stats["number_of_tips"] < 200) {
    status = "monitor";
  } else {
    status = "dead";
  }

  const query = `mutation { 
	updateTipster( inputTipster: { 
		url: "${stats["link"]}",
	platform: "Blogabet", 
	handle: "${stats.handle}", 
	profilePic: "${stats["profilePic"]}",
	status: "${status}",
	 stakingFactor: 
			${stats["flatStaking"]}, sportsRatio: ${sportsText}, categoryRatio: ${categoryText} } ) }`;
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
};

module.exports.parseTipsterData = async (tipsterData) => {
  //fs.writeFileSync("sportsTestData.json", tipsterData);
  //return;
  const tipsterJsonData = JSON.parse(tipsterData);
  //console.log(tipsterJsonData);
  if (tipsterJsonData.platform === "blogabet") {
    await blogabet(
      tipsterJsonData.dashboard,
      tipsterJsonData.stats,
      tipsterJsonData.link
    );
  }
};
