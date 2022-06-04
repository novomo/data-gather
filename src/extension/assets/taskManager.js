const sendData = async (data) => {
  const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
  const extensionCookie = getByValue(cookies, "name", "jid");

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Extension " + extensionCookie.value,
    },
    body: JSON.stringify({ data }),
  };

  const result = await fetch(PARSER_URL, opts);
  //console.log(result)
  const resData = await result.json();
  //console.log(resData)
};

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
