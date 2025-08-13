import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/ClinicHomePage.css";

const ClinicHomePage = () => {
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
        if (userData && Number(userData.roleId) === 5) {
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
    <div className="clinic-homepage">
      <motion.aside
        className={`clinic-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/clinic"
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
                aria-label="Clinic icon for logo"
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 11h6m-9-9h12"
                  fill="var(--clinic-color3)"
                  stroke="var(--clinic-color4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Clinic Panel</span>}
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
                stroke="var(--clinic-background)"
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
              to="/clinic/dashboard"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Clinic icon for dashboard"
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 11h6m-9-9h12"
                  fill="var(--clinic-color1)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Clinic Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/schedule"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Calendar icon for schedule"
              >
                <path
                  d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                  fill="var(--clinic-color2)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/patients"
              onClick={() => setIsSidebarOpen(true)}
              title="Patients"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Users icon for patients"
              >
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm6 10v-2a4 4 0 00-3-3.87m4-5.13a4 4 0 100-8 4 4 0 000 8z"
                  fill="var(--clinic-color3)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Patients</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/support"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Support icon"
              >
                <path
                  d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728M12 9v3m0 3h.01"
                  fill="var(--clinic-color4)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button className="sidebar-action-button" title="Add Appointment">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Clipboard plus icon for add appointment"
              >
                <path
                  d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m4 6v6m-3-3h6"
                  fill="var(--clinic-background)"
                  stroke="var(--clinic-color4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Add Appointment</span>}
            </button>
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
                  d="M4 19.5A2.5 2.5 0 016.5 17H20m-16-13h13.5c1.38 0 2.5 1.12 2.5 2.5v13c0 1.38-1.12 2.5-2.5 2.5H4m2.5-13v13"
                  fill="var(--clinic-color5)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Blog Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item clinic-profile-section"
              >
                <div
                  className="clinic-profile-info"
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
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--clinic-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="clinic-profile-email">{user.email}</span>
                  )}
                </div>
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
                      stroke="var(--clinic-logout)"
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
            <motion.div
              variants={navItemVariants}
              className="sidebar-nav-item"
            >
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
                    stroke="var(--clinic-background)"
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
      <main className="clinic-content">
        <section className="clinic-banner">
          <motion.div
            className="clinic-banner-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="clinic-banner-title">Clinic Dashboard</h1>
            <p className="clinic-banner-subtitle">
              Optimize your clinic's operations with powerful tools for managing appointments, patient records, and support services, ensuring seamless healthcare delivery.
            </p>
            <div className="clinic-banner-buttons">
              <Link
                to="/clinic/schedule"
                className="clinic-banner-button primary"
              >
                Manage Schedule
              </Link>
              <Link
                to="/clinic/patients"
                className="clinic-banner-button secondary"
              >
                View Patients
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="clinic-banner-image"
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
              aria-label="Stethoscope icon for clinic"
            >
              <path
                d="M20 10c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-.34.05-.67.13-1H9.5c-.83 0-1.5.67-1.5 1.5v3c0 .83.67 1.5 1.5 1.5h1v2H6v-2H4.5c-.83 0-1.5-.67-1.5-1.5v-3c0-.83.67-1.5 1.5-1.5h1.87c.08-.33.13-.66.13-1 0-2.21-1.79-4-4-4S2 5.79 2 8c0 1.1.45 2.1 1.18 2.82l-.7.71a1 1 0 000 1.42 1 1 0 001.42 0l.71-.71A3.96 3.96 0 006 10c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .34-.05.67-.13 1H14.5c.83 0 1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5h-1v2h5v-2h1.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5z"
                fill="var(--clinic-color3)"
                stroke="var(--clinic-color4)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </section>
        <motion.section
          className="clinic-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="clinic-features-title">Core Clinic Management Tools</h2>
          <p className="clinic-features-description">
            Utilize a comprehensive set of tools designed to streamline appointment scheduling, patient management, and support services for efficient clinic operations.
          </p>
          <div className="clinic-features-grid">
            <motion.div variants={cardVariants} className="clinic-feature-card">
              <h3>Appointment Scheduling</h3>
              <p>Efficiently manage and organize clinic appointments to optimize your schedule and enhance patient care.</p>
              <Link to="/clinic/schedule" className="clinic-feature-link">
                Explore
              </Link>
            </motion.div>
            <motion.div variants={cardVariants} className="clinic-feature-card">
              <h3>Patient Management</h3>
              <p>Securely access, update, and manage patient records to ensure accurate and up-to-date medical information.</p>
              <Link to="/clinic/patients" className="clinic-feature-link">
                Explore
              </Link>
            </motion.div>
            <motion.div variants={cardVariants} className="clinic-feature-card">
              <h3>Support Services</h3>
              <p>Access dedicated support to resolve operational challenges and maintain smooth clinic functionality.</p>
              <Link to="/clinic/support" className="clinic-feature-link">
                Explore
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default ClinicHomePage;