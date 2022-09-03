const https = require("https");
const fetch = require("node-fetch");
const { API_KEY, API_URL } = require("./secrets");

module.exports.formatDate = (date, time = false) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hours = d.getHours(),
    minutes = d.getMinutes();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (time) {
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  return [year, month, day].join("-");
};

module.exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

module.exports.toTimestamp = (d) => {
  let dt;
  if (typeof d === "string") {
    dt = new Date(d);
  } else {
    dt = d;
  }
  console.log(dt);
  return dt / 1000;
};

module.exports.addHours = function (d, h) {
  d.setTime(d.getTime() + h * 60 * 60 * 1000);
  return d;
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

module.exports.completeTask = (task) => {
  const dataStr = JSON.stringify(task, {
    task: task,
    stage: "Complete",
  }).replace('"', '\\"');

  const query = `mutation {
  editTask(
      key: "${task}"
      data: "${dataStr}"
    )
}`;
  let opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "API " + API_KEY,
    },
    body: JSON.stringify({ query: query }),
  };

  const matchResult = fetch(API_URL, opts);
  console.log(matchResult);
};

module.exports.httpsAgent = httpsAgent;
