import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
}, [token]); // Remove userId from dependencies to avoid infinite loops
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || !token) {
        setError("User ID or token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await viewNotificationsByUserId(userId, token);
        console.log("Notifications data:", response.data); // Debug log
        if (response.error === 0 && Array.isArray(response.data)) {
          // Use notificationId or fallback to index-based ID
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

  return (
    <MainLayout>
      <div className="notification-page">
        <header className="notification-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="header-content"
          >
            <h1 className="header-title">Your Notifications</h1>
          </motion.div>
        </header>

        <motion.div
          className="notification-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="notification-title">Notifications</h2>
          {loading ? (
            <p className="notification-loading">Loading notifications...</p>
          ) : error ? (
            <div className="notification-error">
              <p>{error}</p>
              {error.includes("log in") && (
                <button
                  className="notification-action-btn"
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
                  transition={{ duration: 0.5 }}
                >
                  <span className="notification-message">{notification.message}</span>
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="notification-action-btn"
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
            <p className="no-notifications">No new notifications.</p>
          )}
          {notifications.length > 0 && notifications.some((notif) => !notif.isRead) && (
            <motion.button
              className="clear-notifications-btn"
              onClick={handleClearNotifications}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Notifications
            </motion.button>
          )}
        </motion.div>

        <footer className="notification-footer">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="footer-content"
          >
            <div className="footer-links">
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            </div>
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} Pregnancy Support. All rights reserved.
            </p>
          </motion.div>
        </footer>
      </div>
    </MainLayout>
  );
};

export default NotificationPage;