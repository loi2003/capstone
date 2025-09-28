// src/contexts/MessageContext.jsx
import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import * as signalR from "@microsoft/signalr";
import apiClient from "../apis/url-api";

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [userId, setUserId] = useState(null);
  const connectionRef = useRef(null);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Monitor localStorage for userId changes
  useEffect(() => {
    const checkUserId = () => {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId && storedUserId !== userId) {
        console.log("UserId found in localStorage:", storedUserId);
        setUserId(storedUserId);
      }
    };

    // Check immediately
    checkUserId();

    // Set up polling to check for userId (useful for login scenarios)
    const intervalId = setInterval(checkUserId, 1000);

    // Listen for storage events (when localStorage changes)
    const handleStorageChange = (e) => {
      if (e.key === 'userId') {
        console.log("UserId changed in localStorage:", e.newValue);
        setUserId(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId]);

  // Create connection when userId is available
  useEffect(() => {
    if (!userId) {
      console.log("No userId available, waiting...");
      return;
    }

    // Clean up existing connection
    if (connectionRef.current) {
      console.log("Cleaning up existing connection");
      connectionRef.current.stop().catch(console.error);
      connectionRef.current = null;
      setConnection(null);
    }

    console.log("Creating SignalR connection for userId:", userId);
    const baseUrl = apiClient.defaults.baseURL;
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/messageHub?userId=${userId}`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = newConnection;

    // Message handler
    newConnection.on("ReceivedMessage", (msg) => {
      console.log("Message received:", msg);
      console.log("payload received:", msg?.payload);
      
      if (msg?.payload) {
        addMessage(msg.payload);
      } else {
        addMessage(msg);
      }
    });

    // Connection state handlers
    newConnection.onreconnecting((error) => {
      console.log("Connection lost. Attempting to reconnect...", error);
      setConnectionStatus('reconnecting');
      setIsReconnecting(true);
    });

    newConnection.onreconnected((connectionId) => {
      console.log("Connection reestablished. Connected with connectionId", connectionId);
      setConnectionStatus('connected');
      setIsReconnecting(false);
    });

    newConnection.onclose((error) => {
      console.log("Connection permanently closed", error);
      setConnectionStatus('disconnected');
      setIsReconnecting(false);
      setConnection(null);
      
      // Attempt manual reconnection after automatic attempts failed
      setTimeout(() => {
        if (connectionRef.current && connectionRef.current.state === signalR.HubConnectionState.Disconnected) {
          console.log("Attempting manual reconnection...");
          connectionRef.current.start()
            .then(() => {
              console.log("Manual reconnection successful");
              setConnection(connectionRef.current);
              setConnectionStatus('connected');
            })
            .catch((err) => {
              console.error("Manual reconnection failed:", err);
            });
        }
      }, 10000);
    });

    // Start connection
    setConnectionStatus('connecting');
    newConnection
      .start()
      .then(() => {
        console.log("MessageHub connected successfully");
        setConnection(newConnection);
        setConnectionStatus('connected');
      })
      .catch((err) => {
        console.error("Failed to connect to MessageHub:", err.message);
        setConnectionStatus('disconnected');
        
        // Retry connection after delay
        setTimeout(() => {
          if (connectionRef.current) {
            connectionRef.current.start()
              .then(() => {
                console.log("Retry connection successful");
                setConnection(connectionRef.current);
                setConnectionStatus('connected');
              })
              .catch((retryErr) => {
                console.error("Retry connection failed:", retryErr);
              });
          }
        }, 5000);
      });

    return () => {
      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .catch((err) => console.error("Error stopping MessageHub:", err));
        connectionRef.current = null;
      }
    };
  }, [userId, addMessage]);

  const contextValue = useMemo(() => ({
    connection,
    messages,
    addMessage,
    connectionStatus,
    isReconnecting,
    isConnected: connectionStatus === 'connected',
    userId,
  }), [connection, messages, addMessage, connectionStatus, isReconnecting, userId]);

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};
