const createNewTab = async (url, task) => {
  try {
    const tab = await chrome.tabs.create({ url });
    const { id } = tab;
    updateTabId(id, task);
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
    const tab = await chrome.tabs.query({ url });
    return tab.status;
  } catch (err) {
    console.log(err);
  }
};
