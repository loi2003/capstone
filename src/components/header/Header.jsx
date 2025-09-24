// src/components/Header.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { viewNotificationsByUserId } from "../../apis/notification-api";
import { getCurrentUser } from "../../apis/authentication-api";
import apiClient from "../../apis/url-api";
import "./Header.css";
import { set } from "lodash";
import { FaIdCard, FaComments } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FaCircleQuestion } from "react-icons/fa6";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Scroll restoration utility function
  const restoreScrollPosition = () => {
    // Clean up all body scroll-lock styles
    document.body.classList.remove("menu-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");
    document.body.style.removeProperty("height");
    
    // Handle layout container if it exists
    const layoutContainer = document.querySelector(".layout-container");
    if (layoutContainer) {
      layoutContainer.style.overflowY = "auto";
    }
    
    // Get stored scroll position
    const storedScrollY = document.body.dataset.scrollY || sessionStorage.getItem('headerScrollPosition') || "0";
    window.scrollTo(0, parseInt(storedScrollY, 10));
    
    // Clean up stored positions
    delete document.body.dataset.scrollY;
    sessionStorage.removeItem('headerScrollPosition');
  };

  // Clean up scroll lock on route changes
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      restoreScrollPosition();
    }
  }, [location.pathname]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isMenuOpen) {
        restoreScrollPosition();
      }
    };
  }, [isMenuOpen]);

  // Handle browser navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isMenuOpen) {
        restoreScrollPosition();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isMenuOpen]);

  const getAuthToken = () => {
    return (
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt") ||
      null
    );
  };

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      return;
    }

    try {
      setLoading(true);
      const userResponse = await getCurrentUser(token);
      const userId = userResponse.data?.data?.id;

      if (!userId) {
        setError("Unable to fetch user ID. Please log in again.");
        setLoading(false);
        return;
      }

      const notificationResponse = await viewNotificationsByUserId(userId, token);

      if (
        notificationResponse.error === 0 &&
        Array.isArray(notificationResponse.data)
      ) {
        const notificationsWithId = notificationResponse.data.map(
          (notif, index) => ({
            ...notif,
            id: notif.notificationId || notif.id || `notif-${index}`,
          })
        );
        setNotifications(notificationsWithId);
      } else {
        setNotifications([]);
      }

      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error("Error fetching notifications:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getCurrentUser(token)
        .then((response) => {
          const userId = response.data?.data?.id;
          if (userId) {
            setUser({
              userId,
              email: response.data?.data?.email || "user@example.com",
            });
            fetchNotifications();
          } else {
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setShowNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const newState = !prev;
      const navLinks = document.querySelector(".nav-links");
      
      if (navLinks) {
        navLinks.classList.toggle("open", newState);
      }

      if (newState) {
        // Store current scroll position in multiple places for reliability
        const scrollY = window.scrollY;
        document.body.dataset.scrollY = scrollY;
        sessionStorage.setItem('headerScrollPosition', scrollY);
        
        // Apply scroll lock
        document.body.classList.add("menu-open");
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        
        // Handle layout container if it exists
        const layoutContainer = document.querySelector(".layout-container");
        if (layoutContainer) {
          layoutContainer.style.overflowY = "hidden";
        }
      } else {
        restoreScrollPosition();
      }

      if (isDropdownOpen) setIsDropdownOpen(false);
      if (showNotification) setShowNotification(false);
      return newState;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setShowNotification(false);
  };

  const toggleNotification = () => {
    setShowNotification((prev) => {
      if (!prev) {
        fetchNotifications();
      }
      return !prev;
    });
    setIsDropdownOpen(false);
  };

  const handleNotificationClick = () => {
    setShowNotification(false);
    // Close menu and restore scroll when navigating
    if (isMenuOpen) {
      setIsMenuOpen(false);
      restoreScrollPosition();
    }
    navigate("/notifications");
  };

  const handleNavigation = (path) => {
    // Close menu and restore scroll before navigating
    if (isMenuOpen) {
      setIsMenuOpen(false);
      restoreScrollPosition();
    }
    navigate(path);
  };

  const handleLogout = async () => {
    if (!user?.userId) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
      console.log("Logout without userId");
      return;
    }

    try {
      console.log("Sending logout request for userId:", user.userId);
      await apiClient.post("/api/auth/user/logout", user.userId, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      setShowNotification(false);
      navigate("/signin", { replace: true });
    }
  };

  const hasNewNotifications = notifications.some((notif) => !notif.isRead);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/images/IMG_4602.PNG" alt="Logo" className="web-logo" />
          NestlyCare
        </Link>
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span className="menu-icon"></span>
        </button>
        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link to="/about" title="About Us">
            About
          </Link>
          {!user ? (
            <Link to="/duedate-calculator">DueDate Calculator</Link>
          ) : (
            <Link to="/pregnancy-tracking" title="Pregnancy Tracking">
              Pregnancy Tracking
            </Link>
          )}
          <Link to="/nutritional-guidance" title="Nutritional Guidance">
            Nutrition
          </Link>
          <Link to="/clinic/list" title="Consultation">
            Consultation Booking
          </Link>
          <Link to="/blog" title="Blog">
            Blog & Community
          </Link>
          <div className="auth-section">
            {user ? (
              <div
                className={`profile-section ${
                  isDropdownOpen || showNotification ? "open" : ""
                }`}
                ref={dropdownRef}
              >
                <div className="profile-icons">
                  <button
                    className="profile-toggle"
                    onClick={toggleDropdown}
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                        fill="var(--white)"
                      />
                    </svg>
                  </button>
                  <button
                    className="notification-toggle"
                    onClick={toggleNotification}
                    aria-label="Notifications"
                    aria-expanded={showNotification}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.93 5 11v5l-1.29 1.29c-.63.63-.18 1.71.71 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"
                        fill="var(--white)"
                      />
                    </svg>
                    {hasNewNotifications && (
                      <span className="notification-count">
                        {notifications.filter((n) => !n.isRead).length}
                      </span>
                    )}
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <span
                        className="profile-email"
                        title={user.email || "Người dùng"}
                      >
                        {user.email || "Người dùng"}
                      </span>
                    </div>
                    <div className="dropdown-content">
                      <Link to="/profile" className="dropdown-item">
                        <CgProfile />
                        <span>Profile</span>
                      </Link>
                      <Link to="/subscriptionplan" className="dropdown-item">
                        <FaIdCard />
                        <span>Subscription</span>
                      </Link>
                      <Link to="/consultation-chat" className="dropdown-item">
                        <FaComments />
                        <span>Consultation Chat</span>
                      </Link>
                      <Link to="/support" className="dropdown-item">
                        <FaCircleQuestion />
                        <span>Support</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-btn"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                            fill="var(--white)"
                          />
                        </svg>
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
                {showNotification && (
                  <div className="notification-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-title">Notifications</span>
                    </div>
                    <div className="notification-content">
                      {loading ? (
                        <span className="notification-message">
                          Loading notifications...
                        </span>
                      ) : error ? (
                        <span className="notification-message">{error}</span>
                      ) : notifications.length > 0 ? (
                        <>
                          <span className="notification-message">
                            {hasNewNotifications
                              ? "You have new notifications."
                              : "All notifications are read."}
                          </span>
                          {notifications.map((notification, index) => (
                            <div
                              key={notification.id || `notif-${index}`}
                              className={`notification-item ${
                                notification.isRead ? "read" : "unread"
                              }`}
                              onClick={handleNotificationClick}
                            >
                              <div className="notification-icon">
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.93 5 11v5l-1.29 1.29c-.63.63-.18 1.71.71 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"
                                    fill="var(--white)"
                                  />
                                </svg>
                              </div>
                              <div className="notification-details">
                                <span className="notification-title">
                                  {notification.message}
                                </span>
                                <span className="notification-time">
                                  {new Date(
                                    notification.createdAt || Date.now()
                                  ).toLocaleString()}
                                </span>
                              </div>
                              {!notification.isRead && (
                                <span className="notification-dot" />
                              )}
                            </div>
                          ))}
                          <div className="notification-actions">
                            <button
                              onClick={handleNotificationClick}
                              className="notification-btn primary"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                                  fill="var(--white)"
                                />
                              </svg>
                              <span>View All Notifications</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="notification-empty">
                          <div className="notification-empty-icon">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-1.1-.9-2-2-2s-2 .9-2 2v.68C6.63 5.36 5 7.93 5 11v5l-1.29 1.29c-.63.63-.18 1.71.71 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"
                                fill="var(--accent-color)"
                              />
                            </svg>
                          </div>
                          <span className="notification-empty-title">
                            No Notifications
                          </span>
                          <span className="notification-empty-message">
                            You don't have any notifications.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="sign-in-btn">
                  Sign In
                </Link>
                <p className="auth-message">
                  Not have account? <Link to="/signup">Register here</Link>
                </p>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
