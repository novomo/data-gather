import React, { useState, useEffect } from "react";
import { useSubscription } from "@apollo/client";
import Cookies from "universal-cookie";
import { TASK_SUBSCRIPTION, UPDATE_TASKS_SUBSCRIPTION } from "./queries";

const findByValueOfObject = (key, value, obj) => {
  return obj.filter(function (item) {
    return item[key] === value;
  });
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const cookies = new Cookies();
    const currentTasksState = cookies.get("scraperTasks");
    console.log(currentTasksState);
    if (currentTasksState) {
      setTasks(currentTasksState);
    }
  }, []);
  const {
    data: startData,
    loading: startLoading,
    error: startError,
  } = useSubscription(TASK_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      //console.log(subscriptionData);
      const data = subscriptionData.data;
      if (data && data.sendTask) {
        console.log(data);
        const there = findByValueOfObject("task", data.sendTask.task, tasks);
        console.log(there);
        const cookies = new Cookies();
        if (there.length === 0) {
          const currentTasksState = cookies.get("scraperTasks");
          console.log(currentTasksState);
          if (!currentTasksState) {
            cookies.set(
              "scraperTasks",
              [
                {
                  ...data.sendTask,
                },
              ],
              { path: "/" }
            );
          } else {
            cookies.set(
              "scraperTasks",
              [
                ...currentTasksState,
                {
                  ...data.sendTask,
                },
              ],
              { path: "/" }
            );
          }

          setTasks([...tasks, data.sendTask.task]);
        }
      }
    },
  });

  const {
    data: endData,
    loading: endLoading,
    error: endError,
  } = useSubscription(UPDATE_TASKS_SUBSCRIPTION, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      //console.log(subscriptionData);
      const data = subscriptionData.data;
      const cookies = new Cookies();
      if (data && data.updateTasks) {
        setTasks(data.updateTasks);
        cookies.set("scraperTasks", data.updateTasks, {
          path: "/",
        });
      }
    },
  });

  console.log(tasks);
  return (
    <div id="tasks">
      {tasks.map((task) => {
        return (
          <div>
            <p className="task" id={task.task.replaceAll(" ", "_")}>
              {task.task}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Dashboard;
