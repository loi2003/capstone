import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../apis/authentication-api";
import apiClient from "../../apis/url-api";
import "./Header.css";
import { set } from "lodash";
import { FaIdCard, FaComments } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { FaCircleQuestion } from 'react-icons/fa6';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [showSubscription, setShowSubscription] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          const userData = response.data?.data;
          if (userData && userData.roleId === 2) {
            setUser(userData);
            console.log("User info:", userData);
          } else {
            console.warn("Invalid user role or data:", userData);
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user:", error.message);
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        console.log("No token found in localStorage");
      }
    };
    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => {
      const newState = !prev;
      const navLinks = document.querySelector(".nav-links");
      if (navLinks) {
        navLinks.classList.toggle("open", newState);
      }

      if (newState) {
        const scrollY = window.scrollY;
        document.body.classList.add("menu-open");
        document.body.style.top = `-${scrollY}px`;
        document.querySelector(".layout-container").style.overflowY = "hidden";
      } else {
        const scrollY = document.body.style.top;
        document.body.classList.remove("menu-open");
        document.body.style.top = "";
        document.querySelector(".layout-container").style.overflowY = "auto";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }

      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
      if (showNotification) {
        setShowNotification(false);
      }
      return newState;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setShowNotification(false);
  };

  const toggleNotification = () => {
    setShowNotification((prev) => !prev);
    setIsDropdownOpen(false);
  };

  // const toggleSubscription = () => {
  //   setShowSubscription((prev) => !prev);
  //   setIsDropdownOpen(false);
  // };

  const handleNotificationClick = () => {
    setShowNotification(false);
    navigate("/notifications");
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
                className={`profile-section ${isDropdownOpen || showNotification ? "open" : ""}`}
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
                  </button>
                  
                </div>
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <span className="profile-email" title={user.email || "Người dùng"}>
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
                      
                      <button onClick={handleLogout} className="dropdown-item logout-btn">
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
                      <span className="notification-message">
                        You have new notifications.
                      </span>
                      <button
                        onClick={handleNotificationClick}
                        className="dropdown-item notification-btn"
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
                            fill="var(--primary-bg)"
                          />
                        </svg>
                        <span>View Notifications</span>
                      </button>
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