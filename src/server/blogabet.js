const fetch = require("node-fetch");
const { flatStaking } = require("./tipsterCalcs");
const getActiveMonths = (stats, statistics) => {
  const tableRows = statistics
    .querySelector('div[id="alltime-archive-StatsTabContent"]')
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  let profitableMonths = 0;
  for (const row in tableRows) {
    //console.log(tableRows[row].getElementsByTagName('td').innerHTML)
    const profit = tableRows[row]
      .getElementsByTagName("td")[3]
      .getElementsByTagName("span")[0].innerHTML;
    //console.log("profit");
    //console.log(profit);

    if (profit.includes("+")) {
      profitableMonths = profitableMonths + 1;
    }
  }
  stats.profitableMonths = profitableMonths;
  stats.monthsProfit = parseFloat(
    tableRows[0]
      .getElementsByTagName("td")[3]
      .getElementsByTagName("span")[0]
      .innerHTML.replace("+", "")
  );
  stats.monthsWinRatio =
    parseFloat(
      tableRows[0].getElementsByTagName("td")[2].innerHTML.replace("%", "")
    ) / 100;

  stats.activeMonths = tableRows.length;
  return stats;
};

const getSportsData = (statistics) => {
  let sports = [];
  console.log("getting sports data");
  tableRows = statistics
    .querySelector('[id="alltime-sports-StatsTabContent"]')
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  if (tableRows.length == 0) {
    return false;
  }
  console.log(tableRows.length);
  for (const row in tableRows) {
    let sport = {};
    sport["name"] = tableRows[row]
      .getElementsByTagName("td")[0]
      .textContent.trim();

    if (sport["name"] === "" || !sport["name"]) {
      key = tableRows[row]
        .getElementsByTagName("td")[0]
        .innerHTML.split("\n")[1]
        .trim();
    }

    sport["win_ratio"] = parseFloat(
      tableRows[row].getElementsByTagName("td")[2].textContent.replace("%", "")
    );
    if (!sport["win_ratio"] || sport["win_ratio"] === "") {
      sport["win_ratio"] = parseFloat(
        tableRows[row].getElementsByTagName("td")[2].innerHTML.replace("%", "")
      );
    }

    sport["profit"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[3]
        .getElementsByTagName("span")[0]
        .textContent.replace("+", "")
    );
    if (!sport["profit"] || sport["profit"] === "") {
      sport["profit"] = parseFloat(
        tableRows[row]
          .getElementsByTagName("td")[3]
          .getElementsByTagName("span")[0]
          .innerHTML.replace("+", "")
      );
    }

    sport["yield"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[4]
        .getElementsByTagName("span")[0]
        .textContent.replace("+", "")
        .replace("%", "")
    );
    if (!sport["yield"] || sport["yield"] === "") {
      sport["yield"] = parseFloat(
        tableRows[row]
          .getElementsByTagName("td")[4]
          .getElementsByTagName("span")[0]
          .innerHTML.replace("+", "")
          .replace("%", "")
      );
    }

    sport["tipNum"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[1]
        .textContent.replace("+", "")
        .replace("%", "")
    );
    if (!sport["tipNum"] || sport["tipNum"] === "") {
      sport["tipNum"] = parseFloat(
        tableRows[row]
          .getElementsByTagName("td")[1]
          .innerHTML.replace("+", "")
          .replace("%", "")
      );
    }
    sports.push(sport);
  }
  console.log(sports);
  return sports;
};

module.exports.checkBlogIsActive = (statistics) => {
  const table = statistics.querySelector(
    '[id="alltime-stakes-StatsTabContent"]'
  );
  console.log(table);
  if (table) {
    return true;
  } else {
    return false;
  }
};

module.exports.getBlogDashData = (stats, dashboard) => {
  if (dashboard.querySelector('[id="header-picks"]')) {
    stats.handle = dashboard
      .querySelector('div[class="tipster"]')
      .getElementsByTagName("h1")[0]._attrs["data-original-title"];
    /*console.log(
      dashboard
        .querySelector('div[class="media-body"]')
        .querySelector('div[class="title-name"]')
        .getElementsByTagName("a")[0]
        .rawAttrs.split("=")[3]
        .replaceAll('"', "")
        .split(" ")[0]
    );*/
    stats.numberOfTips = parseFloat(
      dashboard.querySelector('[id="header-picks"]').innerHTML.trim()
    );
    stats.yieldPercentage = parseFloat(
      dashboard
        .querySelector('[id="header-yield"]')
        .innerHTML.trim()
        .replace("-", "")
        .replace("+", "")
        .replace("%", "")
    );
    /*console.log(
      `winRate: ${dashboard
        .querySelector('[id="winrate_container"]')
        .getElementsByTagName("h4")[0]
        .getElementsByTagName("span")[0]
        .innerHTML.trim()
        .replace("%", "")}`
    );*/
    stats.winRate =
      parseFloat(
        dashboard
          .querySelector('[id="winrate_container"]')
          .getElementsByTagName("h4")[0]
          .getElementsByTagName("span")[0]
          .innerHTML.trim()
          .replace("%", "")
      ) / 100;
    stats.profitBlogabet = parseFloat(
      dashboard.querySelector('[id="header-profit"]').innerHTML.replace("+", "")
    );
    /*console.log(
      dashboard.querySelector('[class="img-md"]').getElementsByTagName("img")[0]
        ._attrs.src
    );*/
    stats.profilePic = dashboard
      .querySelector('[class="img-md"]')
      .getElementsByTagName("img")[0]._attrs.src;
    return stats;
  } else {
    return false;
  }
};

const getCategoryData = (statistics) => {
  categories = [];
  console.log("getting category data");
  tableRows = statistics
    .querySelector('div[id="alltime-categories-StatsTabContent"]')
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  if (tableRows.length == 0) {
    return false;
  }

  console.log(tableRows);
  for (const row in tableRows) {
    let category = {};
    category["name"] = tableRows[row]
      .getElementsByTagName("td")[0]
      .getElementsByTagName("span")[0]
      .textContent.trim();
    category["win_ratio"] = parseFloat(
      tableRows[row].getElementsByTagName("td")[2].textContent.replace("%", "")
    );

    category["profit"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[3]
        .getElementsByTagName("span")[0]
        .textContent.replace("+", "")
    );

    category["yield"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[4]
        .getElementsByTagName("span")[0]
        .textContent.replace("+", "")
        .replace("%", "")
    );

    category["tipNum"] = parseFloat(
      tableRows[row]
        .getElementsByTagName("td")[1]
        .textContent.replace("+", "")
        .replace("%", "")
    );

    categories.push(category);
  }
  console.log(categories);
  return categories;
};

module.exports.getStatsPageData = (stats, statistics) => {
  //console.log(statistics);
  stats = getActiveMonths(stats, statistics);
  const sportsData = getSportsData(statistics);
  console.log("stats");
  console.log(stats);
  if (!sportsData) {
    return false;
  }
  console.log("sports Data");
  console.log(sportsData);
  const categoryData = getCategoryData(statistics);
  if (!categoryData) {
    return false;
  }
  console.log("category Data");
  console.log(categoryData);
  const stakeTable = statistics
    .querySelector("[id='alltime-stakes-StatsTabContent']")
    .getElementsByTagName("tbody")[0];
  stats.flatStaking = flatStaking(stakeTable, "Blogabet");
  return {
    newStats: stats,
    categoryData,
    sportsData,
  };
};
