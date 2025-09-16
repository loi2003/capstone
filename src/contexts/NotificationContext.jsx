// NotificationContext.jsx
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
  const [notifications, setNotifications] = useState([]); // SignalR messages
  const [toasts, setToasts] = useState([]); // Local toast notifications

  const addNotification = useCallback((msg) => {
    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n.type === msg.type &&
          JSON.stringify(n.payload) === JSON.stringify(msg.payload)
      );
      if (exists) return prev;
      return [...prev, msg];
    });
  }, []);

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const baseUrl = apiClient.defaults.baseURL;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/notificationHub?userId=${userId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceivedNotification", (msg) => {
      const type = msg.type;
      const payload = msg.payload;

      console.log("=== SignalR Notification Received ===");
      // console.log("Full message object:", msg);
      // console.log("Message type:", type);
      // console.log("Message payload:", payload);
      // console.log(
      //   "Message stringified:",
      //   JSON.stringify({ type, payload }, null, 2)
      // );
      // console.log("=====================================");

      addNotification({ type, payload, id: Date.now() });
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
        .catch((err) => console.error("Error stopping SignalR:", err));
    };
  }, [addNotification]);

  const contextValue = useMemo(
    () => ({
      connection: connectionRef.current,
      notifications,
      toasts,
      showNotification,
    }),
    [notifications, toasts, showNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
