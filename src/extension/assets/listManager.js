const getCurrentList = async () => {
  const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
  const extensionCookie = getByValue(cookies, "name", "jid");
  console.log(extensionCookie);
  const query = `
        query {
          getTasks
            {
              task
              tabStatus
              currentPage
              pages
              stage
              tabId
              gotCurrent
              settings {
                proxy
            }
          }
        }`;
  //console.log(query);

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Extension " + extensionCookie.value,
    },
    body: JSON.stringify({ query: query }),
  };

  const result = await fetch(API_URL, opts);
  console.log(result);
  const data = await result.json();
  console.log(data);
  return data.data.getTasks;
};

const updateTask = async (task) => {
  const cookies = await chrome.cookies.getAll({ domain: COOKIE_DOMAIN });
  const extensionCookie = getByValue(cookies, "name", "jid");
  console.log(extensionCookie);
  const query = `
        mutation {
          editTask(key: "${task.task}", data: "${JSON.stringify(
    task
  ).replaceAll('"', '\\"')}")
        }`;
  console.log(query);

  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Extension " + extensionCookie.value,
    },
    body: JSON.stringify({ query: query }),
  };

  const result = await fetch(API_URL, opts);
  console.log(result);
  const data = await result.json();
  console.log(data);
};
