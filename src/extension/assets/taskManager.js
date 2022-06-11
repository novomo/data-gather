const askForData = async (tabId) => {
  await activateTab(tabId);
  sleep(1000);
  const data = await tabMessageWrapper(
    tabId,
    { msg: "giveBody" },
    "content.js"
  );
  return data;
};
