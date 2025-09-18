import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { viewNotificationsByUserId, markNotificationAsRead } from "../apis/notification-api";
import MainLayout from "../layouts/MainLayout";
import "../styles/NotificationPage.css";

const NotificationPage = ({ userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await viewNotificationsByUserId(userId, token);
        setNotifications(response.data || []); // Adjust based on API response structure
        setLoading(false);
      } catch (err) {
        setError("Failed to load notifications. Please try again.");
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId, token]);

  // Handle marking a single notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId, token);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Handle clearing all notifications
  const handleClearNotifications = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.read) {
          await markNotificationAsRead(notification.id, token);
        }
      }
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <MainLayout>
      <div className="notification-page">
        {/* Header Section */}
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

        {/* Main Content */}
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
            <p className="notification-error">{error}</p>
          ) : notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  className={`notification-item ${notification.read ? "read" : ""}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="notification-message">{notification.message}</span>
                  <span className="notification-date">{notification.date}</span>
                  {!notification.read && (
                    <button
                      className="notification-action-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="no-notifications">No new notifications.</p>
          )}
          {notifications.length > 0 && notifications.some((notif) => !notif.read) && (
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

        {/* Footer Section */}
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