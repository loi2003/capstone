import React, { createContext, useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((msg) => {
    setNotifications((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:7045/hub/notificationHub?userId=${userId}`, {
        withCredentials: true,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.on("ReceiveNotification", (msg) => {
      console.log("Received:", msg);
      addNotification(msg); 
    });

    newConnection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err) => console.error(err));

    setConnection(newConnection);

    return () => newConnection.stop();
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ connection, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};