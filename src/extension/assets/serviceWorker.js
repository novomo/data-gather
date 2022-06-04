import { async } from "regenerator-runtime";

// update list throughout process
importScripts(
  "secrets.js",
  "helpers.js",
  "listManager.js",
  "tabController.js",
  "taskManager.js",
  "sportsFixtureScripts.js",
  "sendData.js",
  "eSportsFixturesScripts.js",
  "liveTennisUrlScripts.js",
  "tipsterProfilingScripts.js"
);

const MAX_TASKS = 5;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const functionRef = {
  sportsFixtures: {
    compilePageList: getSportsFixturePages,
    getData: getSportsFixtureData,
  },
  eSportsFixtures: {
    compilePageList: getESportsFixturePages,
    getData: getESportsFixtureData,
  },
  tennisFixtures: {
    compilePageList: getTennisFixturePages,
    getData: getSportsFixtureData,
  },
  liveTennisUrls: {
    compilePageList: getLiveTennisUrlPages,
    getData: getLiveTennisUrlData,
  },
  tipsterProfiling: {
    compilePageList: getTipsterProfilingPages,
    getData: getTipsterProfilingData,
  },
};

const runNextTask = async (task) => {
  if (task.stage === "New") {
    task.tabId = await createNewTab(task.pages[0]);
    await activateTab(task.tabId);
    task.pages = await functionRef[task.task].compilePageList();
  } else {
    if (task.currentPage === "") {
      task.currentPage = task.pages[0];
    } else if (task.gotCurrent) {
      pageIndex = task.pages.findIndex((el) => {
        return el === task.currentPage;
      });
      task.currentPage = task.pages[pageIndex];
    }
    updateTab(task.tabId, task.currentPage);
    task.tabStatus = await getTabStatus(task.currentPage);
    if (task.tabStatus === "complete") {
      try {
        await activateTab(task.tabId);
        await functionRef[task.task].getData(task.currentPage, task.tabId);
        task.gotCurrent = true;
      } catch (err) {
        console.log(err);
        sleep(10000);
        task.gotCurrent = false;
      }
    } else {
      task.gotCurrent = false;
    }
  }
  return task;
};

const main = async () => {
  let cookie, currentTasks;
  while (true) {
    cookie = getCurrentList();
    currentTasks = JSON.parse(cookie.value);
    const loopLimit =
      currentTasks.length < MAX_TASKS ? currentTasks.length : MAX_TASKS;
    for (let i = 0; i < loopLimit; i++) {
      currentTasks[i] = runNextTask(currentTasks[i]);
    }
    // update here
    await updateList(currentTasks);
    cookie = getCurrentList();
    currentTasks = JSON.parse(cookie.value);
    if (currentTasks.length === 0) {
      await sleep(60000);
    } else {
      await sleep(10000);
    }
  }
};

main();
