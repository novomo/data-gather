const getESportsFixturePages = async (tabId) => {
    pages = [ESPORTS_BASE_URL];
    return pages;
  };
  
  const getESportsFixtureData = (page, tabId) => {
      const data = await tabMessageWrapper(tabId, {msg: "giveBody"}, 'content.js')
  
      const responseStatus = await sendData('eSportsfixture', data)
      if (responseStatus === 200) {
        return true
      } else {
        throw new Error('Error sending data')
      } 
  };