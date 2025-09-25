import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import {
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaQuestionCircle,
  FaVideo,
  FaHospital,
  FaUser,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBriefcase,
  FaBars,
  FaQuestion,
} from "react-icons/fa";
import "../../styles/ConsultantHomePage.css";
const ConsultantHomePage = () => {
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
        if (userData && Number(userData.roleId) === 6) {
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
    if (!user?.userId) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
      return;
    }
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await logout(user.userId);
      } catch (error) {
        console.error("Error logging out:", error.message);
      } finally {
        localStorage.removeItem("token");
        setUser(null);
        setIsSidebarOpen(true);
        navigate("/signin", { replace: true });
      }
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
      width: "250px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "100px",
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
    <div className="consultant-homepage">
      <motion.aside
        className={`consultant-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/consultant"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              {/* <FaBars className="logo-svg" /> */}
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Consultant Panel</span>
            )}
          </Link>
          {isSidebarOpen && <h2 className="sidebar-title"></h2>}
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSidebarOpen ? (
              <FaChevronLeft size={24} />
            ) : (
              <FaChevronRight size={24} />
            )}
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
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <FaChartLine size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              <FaCalendarAlt size={20} />
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Clients"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Clients</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              <FaQuestionCircle size={20} />
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultation/consultation-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Consultation Chat"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Patient Consultation</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Add Consultation"
              onClick={() =>
                navigate("/consultation/online-consultation-management")
              }
            >
              <FaVideo size={20} />
              {isSidebarOpen && <span>Online Consultation</span>}
            </button>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Add Consultation"
              onClick={() =>
                navigate("/consultation/offline-consultation-management")
              }
            >
              <FaHospital size={20} />
              {isSidebarOpen && <span>Offline Consultation</span>}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item consultant-profile-section"
              >
                <Link
                  to="/profile"
                  className="consultant-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <FaUser size={20} />
                  {isSidebarOpen && (
                    <span className="consultant-profile-email">
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
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--consultant-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                  <FaSignOutAlt size={20} />
                  {isSidebarOpen && <span>Sign out</span>}
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
                    stroke="var(--consultant-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
                <FaSignOutAlt size={20} />
                {isSidebarOpen && <span>Sign out</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <main className="consultant-content">
        <section className="consultant-banner">
          <motion.div
            className="consultant-banner-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="consultant-banner-title">
              Consultant Management Dashboard
            </h1>
            <p className="consultant-banner-subtitle">
              Manage consultations, client records, and support efficiently.
            </p>
            <div className="consultant-banner-buttons">
              <Link
                to="/consultant/schedule"
                className="consultant-banner-button primary"
              >
                View Schedule
              </Link>
              <Link
                to="/consultant/support"
                className="consultant-banner-button secondary"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="consultant-banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FaBriefcase size={200} color="var(--consultant-accent)" />
          </motion.div>
        </section>
        <motion.section
          className="consultant-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="consultant-features-title">
            Consultant Management Tools
          </h2>
          <p className="consultant-features-description">
            Streamline your consulting services with our powerful tools.
          </p>
          <div className="consultant-features-grid">
            <motion.div
              variants={cardVariants}
              className="consultant-feature-card"
            >
              <h3>Schedule</h3>
              <p>Manage and view consultation schedules.</p>
              <Link
                to="/consultant/schedule"
                className="consultant-feature-link"
              >
                Explore
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="consultant-feature-card"
            >
              <h3>Clients</h3>
              <p>Access and update client records securely.</p>
              <Link
                to="/consultant/clients"
                className="consultant-feature-link"
              >
                Explore
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="consultant-feature-card"
            >
              <h3>Support</h3>
              <p>Contact support for assistance with consulting operations.</p>
              <Link
                to="/consultant/support"
                className="consultant-feature-link"
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

export default ConsultantHomePage;
