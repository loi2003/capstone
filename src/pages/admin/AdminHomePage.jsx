import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/AdminHomePage.css";

const AdminHomePage = () => {
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
        if (userData && userData.roleId === 1) {
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
    <div className="admin-homepage">
      <motion.aside
        className={`admin-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/admin"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            ></motion.div>
            {isSidebarOpen && <span>Admin Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--admin-background)"
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
              to="/admin"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/admin/categories"
              onClick={() => setIsSidebarOpen(true)}
              title="Blog Categories"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10m-10 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Blog Categories</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/admin/tutorial"
              onClick={() => setIsSidebarOpen(true)}
              title="Tutorial"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-6-6h12"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/admin/policy"
              onClick={() => setIsSidebarOpen(true)}
              title="Admin Policy"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v20m-8-4h16M4 6h16"
                />
              </svg>
              {isSidebarOpen && <span>Admin Policy</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/admin/account-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Account Management"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                />
              </svg>
              {isSidebarOpen && <span>Account Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item admin-profile-section"
              >
                <div
                  className="admin-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--admin-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="admin-profile-email">{user.email}</span>
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
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="var(--admin-logout)"
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
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-background)"
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
      <main className="admin-content">
        <section className="admin-banner">
          <motion.div
            className="admin-banner-content"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h1 className="admin-banner-title">Welcome to Admin Dashboard</h1>
            <p className="admin-banner-subtitle">
              Streamline your operations with powerful tools to manage users,
              analyze reports, and configure settings.
            </p>
            <div className="admin-banner-buttons">
              <Link to="/admin/users" className="admin-banner-button primary">
                Manage Users
              </Link>
              <Link
                to="/admin/account-management"
                className="admin-banner-button secondary"
              >
                Account Management
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="admin-banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg
              width="180"
              height="180"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9h18M9 3v18M3 15h18M6 12h12M12 3v18"
                fill="var(--admin-accent)"
                stroke="var(--admin-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </section>
        <motion.section
          className="admin-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="admin-features-title">Core Features</h2>
          <p className="admin-features-description">
            Access essential tools to manage your platform efficiently.
          </p>
          <div className="admin-features-grid">
            <motion.div variants={cardVariants} className="admin-feature-card">
              <h3>User Management</h3>
              <p>View, edit, and assign roles to user accounts seamlessly.</p>
              <Link to="/admin/users" className="admin-feature-link">
                Explore
              </Link>
            </motion.div>
            <motion.div variants={cardVariants} className="admin-feature-card">
              <h3>Account Management</h3>
              <p>Create accounts for Health Experts, Nutrient Specialists, and Clinics.</p>
              <Link to="/admin/account-management" className="admin-feature-link">
                Explore
              </Link>
            </motion.div>
            <motion.div variants={cardVariants} className="admin-feature-card">
              <h3>Settings</h3>
              <p>Customize platform configurations to suit your needs.</p>
              <Link to="/admin/settings" className="admin-feature-link">
                Explore
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default AdminHomePage;