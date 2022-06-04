const stopError = () => {
  return null;
};

// function to pause code
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

SCRAPER_APP_USERNAME = "USERNAME";

SCRAPER_APP_PASS = "PASSWORD";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  console.log(sender);
  if (request) {
    if (request.msg === "giveBody") {
      const body = document.getElementsByTagName("body")[0].innerHTML;
      sendResponse({ sender: "content.js", data: body }); // This response is sent to the message's sender
      return true;
    } else if (request.msg === "blogabet-menu-click") {
      document
        .evaluate(
          `//*[contains(text(), '${request.txt}')]`,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        )
        .singleNodeValue.click();
      sleep(1000);
      if (request.pages) {
        let loadMore = document.getElementById("_load-more");
        while (loadMore) {
          loadMore.click();
          sleep(1000);
          loadMore = document.getElementById("_load-more");
        }

        let pages = [];
        const tipsters = document
          .getElementById("_following")
          .getElementsByTagName("li");

        for (const tipster in tipsters) {
          const link =
            document.getElementsByClassName("tipster")[0]
              .getElementsByTagName[0].href;
          pages.push(link);
        }
        sendResponse({ sender: "content.js", data: pages }); // This response is sent to the message's sender
      } else {
        const body = document.getElementsByTagName("body")[0].innerHTML;
        sendResponse({ sender: "content.js", data: body });
      }

      return true;
    }
  }
});

async function main() {
  // get current webpage url
  const url = location.href;
  //console.log(url);
  if (url === "https://scraper-app.netlify.app/login") {
    try {
      // if no tip feed logs in.
      await sleep(2000);
      document.getElementById("username").value = SCRAPER_APP_USERNAME;
      document.getElementById("password").value = SCRAPER_APP_PASS;
      document.getElementsById("loginBtn").click();
    } catch (err) {
      // logged in
      stopError();
    }
  }
}

// Runs main function
main();
