const getCurrentList = () => {
    const cookies = await chrome.cookies.getAll({});
    console.log(cookies);
    return getByValue(cookies, "name", "scraperTasks");
};

const removeTask = async (task, tabId) => {
  try {
    const list = getCurrentList();
    const taskIndex = list.findIndex((obj) => {
      return obj.task === task;
    });
    if (taskIndex !== -1) {
      const newCurrentTasksState = list.splice(list, 1);
      localStorage.setItem(
        "scraperTasks",
        JSON.stringify(newCurrentTasksState)
      );
    }

    const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
    const extensionCookie = getByValue(cookies, "name", "jid");
    const query = `
        query {
            endTask(task: "${task}")
        }`;

    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Extension " + extensionCookie.value,
      },
      body: JSON.stringify({ query: query }),
    };

    const result = await fetch(API_URL, opts);
    //console.log(result)
    const data = await result.json();
    //console.log(data)
    removeTab(tabId);
  } catch (err) {
    console.log(err);
  }
};

const updateList = async (tasks) => {
    const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
    const extensionCookie = getByValue(cookies, "name", "jid");
    const tasksStr = queryfy(tasks)
    const query = `
        query {
            updateScraperCookies(tasks: "${tasksStr.replaceAll('"', "'")}")
        }`;

    const opts = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Extension " + extensionCookie.value,
      },
      body: JSON.stringify({ query: query }),
    };

    const result = await fetch(API_URL, opts);
    //console.log(result)
    const data = await result.json();
};
