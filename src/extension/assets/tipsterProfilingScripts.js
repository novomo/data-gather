const getTipsterProfilingPages = async (tabId) => {
  await chrome.tabs.update(accountObj.tab.id, {
    active: true,
    url: BLOGABET_PROFILE,
  });

  const data = await tabMessageWrapper(
    tabId,
    { msg: "blogabet-menu-click", txt: "FOLLOWING", pages: true },
    "content.js"
  );

  return data.pages;
};

const getTipsterProfilingData = async (page, tabId) => {
  const data = {
    dashboard: "",
    statistics: "",
    archive: "",
  };

  data.dashboard = await tabMessageWrapper(
    tabId,
    { msg: "giveBody" },
    "content.js"
  );

  data.statistics = await tabMessageWrapper(
    tabId,
    { msg: "blogabet-menu-click", txt: "STATISTICS", pages: false },
    "content.js"
  );

  data.archive = await tabMessageWrapper(
    tabId,
    { msg: "blogabet-menu-click", txt: "PICKS ARCHIVE", pages: false },
    "content.js"
  );

  const responseStatus = await sendData("blogabetTipsterData", data);
  if (responseStatus === 200) {
    return true;
  } else {
    throw new Error("Error sending data");
  }
};
