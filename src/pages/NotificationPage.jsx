import React from "react";
import "../styles/NotificationPage.css";

const NotificationPage = () => {
  const notifications = [
    {
      id: 1,
      message: "Please complete your profile by adding your date of birth.",
      date: "August 28, 2025",
    },
    {
      id: 2,
      message: "New blog post: Nutrition Tips for Pregnancy.",
      date: "August 27, 2025",
    },
    {
      id: 3,
      message: "Your consultation appointment is scheduled for tomorrow.",
      date: "August 26, 2025",
    },
  ];

  const handleClearNotifications = () => {
    // Placeholder for clearing notifications
    console.log("Clearing all notifications");
  };

  return (
    <div className="notification-page">
      <div className="notification-container">
        <h1 className="notification-title">Notifications</h1>
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <span className="notification-message">{notification.message}</span>
                <span className="notification-date">{notification.date}</span>
              </div>
            ))
          ) : (
            <p className="no-notifications">No new notifications.</p>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            className="clear-notifications-btn"
            onClick={handleClearNotifications}
          >
            Clear All Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;