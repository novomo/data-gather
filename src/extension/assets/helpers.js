// gets an object from array by filtering by object property
const getByValue = (arr, prop, value) => {
  const result = arr.filter(function (o) {
    return o[prop] == value;
  });
  return result ? result[0] : null; // or undefined
};

const queryfy = (obj) => {
  // Make sure we don't alter integers.
  if (typeof obj === "number") {
    return obj;
  }
  //console.log(obj);

  if (Array.isArray(obj)) {
    const props = obj.map((value) => `${queryfy(value)}`).join(",");
    return `[${props}]`;
  }

  if (typeof obj === "object") {
    const props = Object.keys(obj)
      .map((key) => {
        if (key !== "__typename") {
          return `${key}:${queryfy(obj[key])}`;
        }
      })
      .join(",");
    return `{${props}}`;
  }

  return JSON.stringify(obj);
};

const getSettings = async () => {
  const cookies = await chrome.cookies.getAll({
    domain: "scraper-web-app-f97e9.web.app",
  });
  const extensionCookie = getByValue(cookies, "name", "scraperSettings");
  console.log(extensionCookie);
  return JSON.parse(decodeURIComponent(extensionCookie.value))[0];
};

const tabMessageWrapper = (tabId, message) => {
  return new Promise((resolve, reject) => {
    console.log(tabId);
    chrome.tabs.sendMessage(tabId, message, (response) => {
      console.log(response);
      if (response && response.data) {
        resolve(response.data);
      } else {
        resolve(true);
      }
    });
  });
};

const tabQueryWrapper = (url) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ url: url }, (response) => {
      console.log(response);
      resolve(response[0]);
    });
  });
};

const tabUpdateWrapper = async (tabId, opts) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, opts, async (response) => {
      console.log(response);
      let status = response.status;
      while (status === "loading") {
        await sleep(1000);
        console.log(response.url);
        let tabDets = await tabQueryWrapper(response.url);
        console.log(tabDets);
        if (!tabDets) {
          tabDets = await tabQueryWrapper(opts.url);
        }
        console.log(tabDets);
        status = tabDets.status;
      }
      resolve(true);
    });
  });
};
