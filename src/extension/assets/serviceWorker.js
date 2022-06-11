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

let APP_TAB_ID = "";

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

const checkLoggedIn = async () => {
  const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
  const extensionCookie = getByValue(cookies, "name", "jid");
  if (extensionCookie) {
    return true;
  } else {
    return false;
  }
};

const runNextTask = async (task) => {
  console.log(task);
  if (task.stage === "New") {
    // if task is new
    if (!functionRef[task.task]) {
      // if task if not correct flag for removal
      task.stage = "Complete";
      return task;
    }
    // create new tab to run task and assign to task
    task.tabId = await createNewTab(task.pages[0]);
    console.log(`task tab id ${task.tabId}`);
    // activate new tab
    await activateTab(task.tabId);
    console.log(`activate tab for task ${task.task}`);
    // get pages to scrape
    task.pages = await functionRef[task.task].compilePageList();
    //console.log(task.pages);
    // make task active
    task.stage = "In Progress";
  } else {
    // if task is active
    if (task.currentPage === "") {
      // if running first part of task
      task.currentPage = task.pages[0];
      // get first page
      updateTab(task.tabId, task.currentPage);
    } else if (task.gotCurrent) {
      // if last page has been scraped move to next page
      pageIndex = task.pages.findIndex((el) => {
        return el === task.currentPage;
      });
      task.currentPage = task.pages[pageIndex + 1];
      // get next page
      updateTab(task.tabId, task.currentPage);
    }
    console.log(task.currentPage);
    // get task tab status
    task.tabStatus = await getTabStatus(task.currentPage);
    console.log(task.tabStatus);
    // if the task tab has finish loading get pages data
    if (task.tabStatus === "loading") {
      try {
        // activate tab
        await activateTab(task.tabId);
        // get data and send to micro server
        await sleep(1000);
        await functionRef[task.task].getData(task.currentPage, task.tabId);
        task.gotCurrent = true;
        // set gotCurrent to true
        if (task.currentPage === task.pages[task.pages.length - 1]) {
          //if the last tab has been scraper
          task.stage = "Complete";
        }
      } catch (err) {
        // for derbugging
        console.log(err);
        sleep(10000);
        task.gotCurrent = false;
      }
    } else {
      // if tab has not finished uploading
      task.gotCurrent = false;
    }
  }
  // return edited task
  return task;
};

const main = async () => {
  if (!(await checkLoggedIn())) {
    return;
  }
  let currentTasks, scraperSettings;
  while (true) {
    console.log("started...");
    // get current task list
    currentTasks = await getCurrentList();
    scraperSettings = await getSettings();
    console.log(currentTasks);
    console.log(scraperSettings);

    if (!currentTasks) {
      // if no task sleep for 5 minutes
      console.log("sleeping no tasks");
      await sleep(300000);
    } else {
      // define maximum jobs allowed

      let activeTasks = currentTasks.filter((task) => {
        if (task.stage !== "Complete" && task.stage !== "") {
          for (const setting in task.settings) {
            if (
              scraperSettings[setting] &&
              scraperSettings[setting] === task.settings[setting]
            ) {
              return true;
            } else if (
              scraperSettings[setting] &&
              scraperSettings[setting] !== task.settings[setting]
            ) {
              return false;
            } else if (!scraperSettings[setting]) {
              return true;
            }
          }
        }
        return false;
      });
      const loopLimit =
        activeTasks.length < MAX_TASKS ? activeTasks.length : MAX_TASKS;
      console.log(activeTasks);
      for (let i = 0; i < loopLimit; i++) {
        // run next part of each job
        console.log(activeTasks[i]);
        const changedTask = await runNextTask(activeTasks[i]);
        await updateTask(changedTask);
      }
      // sleep for 10 seconds
      console.log("sleeping");
      await sleep(300000);
    }
    refreshAppTab();
  }
};

main();
