import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/HealthExpertHomePage.css";
import {
  FaComments,
  FaSearch,
  FaUser,
  FaPhone,
  FaVideo,
  FaFile,
  FaPaperclip,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaHeartbeat,
  FaStethoscope,
  FaPills,
  FaClipboardCheck,
  FaNotesMedical,
  FaUserMd,
  FaSignOutAlt,
  FaBars,
  FaClipboardList,
} from "react-icons/fa";

const HealthExpertHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 3) {
          setUser(userData);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const sidebarVariants = {
    open: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "60px",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="health-expert-homepage">
      <motion.aside
        className={`health-expert-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/health-expert"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Health Expert icon for logo"
              >
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--health-expert-color3)"
                  stroke="var(--health-expert-color4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--health-expert-color3)"
                  stroke="var(--health-expert-color4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--health-expert-color3)"
                  stroke="var(--health-expert-color4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Health Expert Panel</span>
            )}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Toggle sidebar icon"
            >
              <path
                stroke="var(--health-expert-background)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? "M13 18L7 12L13 6M18 18L12 12L18 6"
                    : "M6 18L12 12L6 6M11 18L17 12L11 6"
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/health-expert/tutorial"
              onClick={() => setIsSidebarOpen(true)}
              title="Tutorial"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Tutorial icon"
              >
                <path
                  d="M12 3v18m9-9H3"
                  fill="var(--health-expert-color1)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/health-expert/policy"
              onClick={() => setIsSidebarOpen(true)}
              title="Policy"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Policy icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5V18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2v.5"
                  fill="var(--health-expert-color2)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Policy</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/blog-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Blog Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Book icon for blog management"
              >
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12.5m-16 0H20a2 2 0 002-2V7.5L16.5 3"
                  fill="var(--health-expert-color3)"
                  stroke="var(--health-expert-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Blog Management</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item active">
            <Link
              to="/health-expert/consultation"
              onClick={() => setIsSidebarOpen(true)}
              title="Consultation"
            >
              <FaClipboardList size={20} />
              {isSidebarOpen && <span>Staff Advice</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item health-expert-profile-section"
              >
                <Link
                  to="/profile"
                  className="health-expert-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
        10 10 10-4.48 10-10S17.52 2 12 2zm0 
        3c1.66 0 3 1.34 3 3s-1.34 
        3-3 3-3-1.34-3-3 1.34-3 
        3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 
        4-3.08 6-3.08 1.99 0 5.97 1.09 
        6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--health-expert-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="health-expert-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>

              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--health-expert-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Sign in icon"
                >
                  <path
                    stroke="var(--health-expert-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <main className="health-expert-content">
        <section className="health-expert-banner">
          <motion.div
            className="health-expert-banner-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="health-expert-banner-title">
              Health Expert Dashboard
            </h1>
            <p className="health-expert-banner-subtitle">
              Empower your expertise with tools to access comprehensive
              tutorials, review policies, and manage your professional profile
              seamlessly.
            </p>
            <div className="health-expert-banner-buttons">
              <Link
                to="/health-expert/tutorial"
                className="health-expert-banner-button primary"
              >
                Explore Tutorials
              </Link>
              <Link
                to="/health-expert/policy"
                className="health-expert-banner-button secondary"
              >
                Review Policies
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="health-expert-banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Health Expert icon for banner"
            >
              <path
                d="M20 10a3 3 0 0 0-3-3h-1V5a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 6 0h1a3 3 0 0 0 3-3v-1.5a2.5 2.5 0 0 1 5 0v.5a1 1 0 0 0 2 0v-.5a4.5 4.5 0 0 0-9 0V10z"
                fill="var(--health-expert-color3)"
                stroke="var(--health-expert-color4)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </section>
        <motion.section
          className="health-expert-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="health-expert-features-title">
            Core Health Expert Tools
          </h2>
          <p className="health-expert-features-description">
            Leverage a suite of tools designed to enhance your knowledge, ensure
            compliance with platform policies, and maintain an up-to-date
            professional profile.
          </p>
          <div className="health-expert-features-grid">
            <motion.div
              variants={cardVariants}
              className="health-expert-feature-card"
            >
              <h3>Tutorial Management</h3>
              <p>
                Access detailed guides and resources to master platform features
                and enhance your expertise.
              </p>
              <Link
                to="/health-expert/tutorial"
                className="health-expert-feature-link"
              >
                Explore
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="health-expert-feature-card"
            >
              <h3>Policy Review</h3>
              <p>
                Stay informed with the latest platform policies and guidelines
                to ensure compliance.
              </p>
              <Link
                to="/health-expert/policy"
                className="health-expert-feature-link"
              >
                Explore
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="health-expert-feature-card"
            >
              <h3>Profile Management</h3>
              <p>
                Update your personal information, notification settings, and
                account details effortlessly.
              </p>
              <Link
                to="/health-expert/profile"
                className="health-expert-feature-link"
              >
                Explore
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default HealthExpertHomePage;
