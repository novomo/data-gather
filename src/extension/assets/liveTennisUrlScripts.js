const getLiveTennisUrlPages = async (tabId) => {
  pages = [LIVE_TENNIS_BASE_URL];
  return pages;
};

const getLiveTennisUrlData = async (page, tabId) => {
  const data = await tabMessageWrapper(
    tabId,
    { msg: "giveBody" },
    "content.js"
  );

  const responseStatus = await sendData("liveTennisUrls", data);
  if (responseStatus === 200) {
    return true;
  } else {
    throw new Error("Error sending data");
  }
};
