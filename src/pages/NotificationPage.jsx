import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { viewNotificationsByUserId, markNotificationAsRead, deleteNotification } from "../apis/notification-api";
import { getCurrentUser } from "../apis/authentication-api";
import MainLayout from "../layouts/MainLayout";
import "../styles/NotificationPage.css";

const getAuthToken = () => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    null;
  return token;
};

const NotificationPage = ({ userId: propUserId, token: propToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(propUserId);
  const [token, setToken] = useState(propToken || getAuthToken());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        const fetchedUserId = response.data?.data?.id;
        if (fetchedUserId) {
          setUserId(fetchedUserId);
        } else {
          setError("Unable to fetch user ID. Please log in again.");
          setLoading(false);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        console.error("Failed to fetch user information:", errorMessage);
        setError(`Failed to fetch user information: ${errorMessage}. Please log in again.`);
        setLoading(false);
      }
    };
    fetchUserId();
  }, [token]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || !token) {
        setError("User ID or token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await viewNotificationsByUserId(userId, token);
        console.log("Notifications data:", response.data);
        if (response.error === 0 && Array.isArray(response.data)) {
          const notificationsWithId = response.data.map((notif, index) => ({
            ...notif,
            id: notif.notificationId || notif.id || `notif-${index}`,
          }));
          setNotifications(notificationsWithId);
        } else {
          setNotifications([]);
          setError("No notifications found or invalid response.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch notifications error:", err.response?.data || err.message);
        setError("Failed to load notifications. Please try again.");
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchNotifications();
    }
  }, [userId, token]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      const errorMessage = err.message || "Failed to mark notification as read. Please try again.";
      console.error(`Failed to mark notification ${notificationId} as read:`, err);
      setError(errorMessage);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId, token);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (err) {
      const errorMessage = err.message || "Failed to delete notification. Please try again.";
      console.error(`Failed to delete notification ${notificationId}:`, err);
      setError(errorMessage);
    }
  };

  const handleClearNotifications = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.isRead) {
          await markNotificationAsRead(notification.id, token);
        }
      }
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (err) {
      console.error("Failed to clear notifications:", err.response?.data || err.message);
      setError("Failed to clear notifications. Please try again.");
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      for (const notification of notifications) {
        await deleteNotification(notification.id, token);
      }
      setNotifications([]);
    } catch (err) {
      console.error("Failed to delete all notifications:", err.response?.data || err.message);
      setError("Failed to delete all notifications. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="notification-page">
        <header className="notification-header">
          <motion.div
            className="header-content animate-slide-up"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="notification-section-title">Your Notifications</h1>
          </motion.div>
        </header>

        <motion.div
          className="notification-container animate-slide-up"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <h2 className="notification-title">Notifications</h2>
          {loading ? (
            <p className="notification-loading">Loading notifications...</p>
          ) : error ? (
            <div className="notification-error">
              <p>{error}</p>
              {error.includes("log in") && (
                <button
                  className="notification-action-btn login-btn"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>
              )}
            </div>
          ) : notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id || `notif-${index}`}
                  className={`notification-item ${notification.isRead ? "read" : ""}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <span className="notification-message">{notification.message}</span>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="notification-action-btn mark-read-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      className="notification-action-btn delete-btn"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="no-notifications-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <svg
                className="no-notifications-svg"
                width="200"
                height="200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C9.24 2 7 4.24 7 7V10.5L5.5 12V16H18.5V12L17 10.5V7C17 4.24 14.76 2 12 2Z"
                  fill="url(#bellGradient)"
                />
                <path
                  d="M12 19C13.1 19 14 18.1 14 17H10C10 18.1 10.9 19 12 19Z"
                  fill="url(#bellGradient)"
                />
                <defs>
                  <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#04668D", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#03C39A", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="10 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                  values="0 12 12;10 12 12;-10 12 12;0 12 12"
                  keyTimes="0;0.33;0.66;1"
                />
              </svg>
              <p className="no-notifications-text">No new notifications</p>
            </motion.div>
          )}
          {notifications.length > 0 && (
            <div className="notification-controls">
              {notifications.some((notif) => !notif.isRead) && (
                <motion.button
                  className="notification-action-btn clear-btn"
                  onClick={handleClearNotifications}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  Clear All Notifications
                </motion.button>
              )}
              <motion.button
                className="notification-action-btn delete-all-btn"
                onClick={handleDeleteAllNotifications}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                Delete All Notifications
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default NotificationPage;