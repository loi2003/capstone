import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../apis/authentication-api";
import apiClient from "../../apis/url-api";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
      return newState;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => {
      const newState = !prev;
      return newState;
    });
  };

  const handleLogout = async () => {
    if (!user?.userId) {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      console.log("Logout without userId");
      return;
    }

    try {
      console.log("Sending logout request for userId:", user.userId);
      await apiClient.post('/api/auth/user/logout', user.userId, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      navigate('/signin', { replace: true });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/images/IMG_4602.PNG" alt="Logo" className="web-logo"/>
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
          <Link to="/about" title="About Us">About</Link>
          <Link to="/duedate-calculator">DueDate Calculator</Link>
          <Link to="/pregnancy-tracking" title="Pregnancy Tracking">Pregnancy</Link>
          <Link to="/nutritional-guidance" title="Nutritional Guidance">Nutrition</Link>
          <Link to="/consultation" title="Consultation">Consultation</Link>
          <Link to="/blog" title="Blog">Blog</Link>

          {/* Phần xác thực: Hiển thị nút Sign In hoặc user icon */}
          <div className="auth-section">
            {user ? (
              <div className={`profile-section ${isDropdownOpen ? "open" : ""}`} ref={dropdownRef}>
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
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <span className="profile-email" title={user.email || "Người dùng"}>
                      {user.email || "Người dùng"}
                    </span>
                    <Link to="/profile" className="dropdown-link">
                      Profile
                    </Link>
                    <Link to="/support" className="dropdown-link">
                      Support
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng xuất
                    </button>
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