const getSportsFixturePages = async (tabId) => {
  let pages = [];
  //console.log(SPORTS_LIST);
  for (const sportName in SPORTS_LIST) {
    let getDate = new Date();
    const lastDate = getDate.setDate(getDate.getDate() + 8);
    const lastDateObj = new Date(lastDate);
    let loop = new Date();
    while (loop < lastDateObj) {
      //console.log(loop);
      //console.log(lastDateObj);
      const getDateText = loop.toISOString().split("T")[0];
      //console.log(loop);
      pages.push(
        `${SPORTS_API_URL}/${SPORTS_LIST[sportName]}/scheduled-events/${getDateText}`
      );
      pages.push(
        `${SPORTS_API_URL}/${SPORTS_LIST[sportName]}/scheduled-events/${getDateText}/inverse`
      );
      let newDate = new Date(loop).setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }
  }
  return pages;
};

const getTennisFixturePages = () => {
  try {
    let pages = [];

    let today = new Date();
    const lastDate = new Date().setDate(today.getDate() + 8);
    while (today < lastDate) {
      const getDateText = today.toISOString().split("T")[0];
      pages.push(`${SPORTS_BASE_URL}/${sportName}/${getDateText}`);
      pages.push(`${SPORTS_API_URL}/tennis/scheduled-events/${getDateText}`);
      pages.push(
        `${SPORTS_API_URL}/tennis/scheduled-events/${getDateText}/inverse`
      );
    }

    return pages;
  } catch (err) {
    console.log(err);
  }
};

const getSportsFixtureData = async (page, tabId) => {
  /*const data = await tabMessageWrapper(
    tabId,
    { msg: "giveBody" },
    "content.js"
  );*/
  const data = await chrome.tabs.sendMessage(tabId, { msg: "giveBody" });

  console.log(data);
  const responseStatus = await sendData("sportsFixture", data);
  /*
  if (responseStatus === 200) {
    return true;
  } else {
    throw new Error("Error sending data");
  }*/
};
