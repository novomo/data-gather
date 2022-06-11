const createNewTab = async (url, task) => {
  try {
    const tab = await chrome.tabs.create({ url });
    const { id } = tab;
    return id;
  } catch (err) {
    console.log(err);
  }
};

const removeTab = async (id, task) => {
  try {
    await chrome.tabs.remove(id);
    return true;
  } catch (err) {
    console.log(err);
  }
};

const updateTab = async (tabId, url) => {
  try {
    await chrome.tabs.update(tabId, { url });
    return true;
  } catch (err) {
    console.log(err);
  }
};

const activateTab = async (tabId) => {
  try {
    await chrome.tabs.update(tabId, { active: true });
    return true;
  } catch (err) {
    console.log(err);
  }
};

const getTabStatus = async (url) => {
  try {
    const tabs = await chrome.tabs.query({ url });
    console.log(tabs[0]);
    return tabs[0].status;
  } catch (err) {
    console.log(err);
  }
};

const refreshAppTab = async () => {
  try {
    const tab = await chrome.tabs.query({
      url: "https://scraper-web-app-f97e9.web.app/dashboard",
    });
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.tabs.reload(tab.id);
    return tab.id;
  } catch (err) {
    console.log(err);
  }
};

const refreshTab = async (tabId) => {
  try {
    await chrome.tabs.reload(tabId);
    return true;
  } catch (err) {
    console.log(err);
  }
};
