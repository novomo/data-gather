import React, { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import Cookies from "universal-cookie";
import { TASK_SUBSCRIPTION, UPDATE_TASKS_SUBSCRIPTION } from "./queries";

// user defined modules
import { trim } from "../common/styles";

const findByValueOfObject = (key, value, obj) => {
  return obj.filter(function (item) {
    return item[key] === value;
  });
};

const Dashboard = () => {
  const [cookiesState, setCookiesState] = useState({ proxy: false });
  useEffect(() => {
    const cookies = new Cookies();
    const currentSettingsState = cookies.get("scraperSettings");
    //console.log(currentSettingsState[0]);
    if (currentSettingsState) {
      setCookiesState(currentSettingsState[0]);
    } else {
      cookies.set(
        "scraperSettings",
        {
          proxy: false,
        },
        { path: "/" }
      );
    }
  }, []);

  const proxyChange = async () => {
    setCookiesState({ proxy: !cookiesState.proxy });
    const cookies = new Cookies();
    const currentCookieState = cookies.get("scraperSettings");
    if (currentCookieState) {
      cookies.set(
        "scraperSettings",
        [
          {
            ...currentCookieState,
            proxy: !cookiesState.proxy,
          },
        ],
        { path: "/" }
      );
    } else {
      cookies.set(
        "scraperSettings",
        [
          {
            proxy: !cookiesState.proxy,
          },
        ],
        { path: "/" }
      );
    }
  };
  return (
    <div id="tasks">
      <label style={{ color: trim }}>
        <input
          type="checkbox"
          id="proxy"
          onChange={proxyChange}
          checked={cookiesState.proxy}
        />
        Proxy
      </label>
    </div>
  );
};

export default Dashboard;
