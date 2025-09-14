import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import * as signalR from "@microsoft/signalr";
import apiClient from "../apis/url-api";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const connectionRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((msg) => {
    setNotifications((prev) => {
      // optional: prevent duplicates if server sends same message twice
      if (prev.some((n) => n.id && n.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const baseUrl = apiClient.defaults.baseURL;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/notificationHub?userId=${userId}`, {
        withCredentials: true,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (msg) => {
      console.log("Notification received:", msg);
      addNotification(msg);
    });

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err) =>
        console.error("Failed to connect to SignalR:", err.message)
      );

    connectionRef.current = connection;

    return () => {
      connection
        .stop()
        .then(() => console.log("SignalR disconnected"))
        .catch((err) => console.error("Error stopping SignalR:", err));
    };
  }, [addNotification]);

  const contextValue = useMemo(
    () => ({
      connection: connectionRef.current,
      notifications,
    }),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
