const sendData = async (type, data) => {
  const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
  const extensionCookie = getByValue(cookies, "name", "jid");
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Extension " + extensionCookie.value,
    },
    body: JSON.stringify({ type, data }),
  };

  const result = await fetch(MICRO_SERVER, opts);
  console.log(result);
  const res = await result.json();
  console.log(res);
  return res.status;
};
