const getSportsFixturePages = async (tabId) => {
  pages = [];
  for (const sportName in SPORTS_LIST) {
    let today = new Date();
    const lastDate = new Date().setDate(today.getDate() + 8);
    while (today < lastDate) {
      const getDateText = today.toISOString().split("T")[0];
      pages.push(`${SPORTS_BASE_URL}/${sportName}/${getDateText}`);
      pages.push(
        `${SPORTS_API_URL}/${sportName}/scheduled-events/${getDateText}`
      );
      pages.push(
        `${SPORTS_API_URL}/${sportName}/scheduled-events/${getDateText}/inverse`
      );
    }
  }
  return pages;
};

const getTennisFixturePages = () => {
  pages = [];

  let today = new Date();
  const lastDate = new Date().setDate(today.getDate() + 8);
  while (today < lastDate) {
    const getDateText = today.toISOString().split("T")[0];
    pages.push(`${SPORTS_BASE_URL}/${sportName}/${getDateText}`);
    pages.push(
      `${SPORTS_API_URL}/tennis/scheduled-events/${getDateText}`
    );
    pages.push(
      `${SPORTS_API_URL}/tennis/scheduled-events/${getDateText}/inverse`
    );
  }
  
  return pages;
};

const getSportsFixtureData = (page, tabId) => {
    if (!page.includes(SPORTS_API_URL) && page.includes(SPORTS_BASE_URL)) {
      return true;
    }
    const data = await tabMessageWrapper(tabId, {msg: "giveBody"}, 'content.js')

    const responseStatus = await sendData('sportsFixture', data)
    if (responseStatus === 200) {
      return true
    } else {
      throw new Error('Error sending data')
    } 
};
