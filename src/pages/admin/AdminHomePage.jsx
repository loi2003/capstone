import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/header/AdminHeader';
import '../../styles/AdminHomePage.css';

const AdminHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const sidebarVariants = {
    open: {
      width: '250px',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      width: '60px',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="admin-homepage">
      <AdminHeader />
      <div className="admin-main-content">
        <motion.aside
          className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial="open"
        >
          <div className="sidebar-header">
            {isSidebarOpen && <h2 className="sidebar-title">Admin Tools</h2>}
            <motion.button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
              aria-expanded={isSidebarOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isSidebarOpen ? 'M13 18L7 12L13 6M18 18L12 12L18 6' : 'M6 18L12 12L6 6M11 18L17 12L11 6'}
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
              <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} title="Dashboard">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12h18M12 3v18"
                  />
                </svg>
                {isSidebarOpen && <span>Dashboard Overview</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/admin/reports" onClick={() => setIsSidebarOpen(false)} title="Reports">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m-4-4l8-8"
                  />
                </svg>
                {isSidebarOpen && <span>Reports</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/admin/settings" onClick={() => setIsSidebarOpen(false)} title="Settings">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8a4 4 0 100 8 4 4 0 000-8z"
                  />
                </svg>
                {isSidebarOpen && <span>Settings</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <button className="sidebar-action-button" title="Create Task">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
                {isSidebarOpen && <span>Create Task</span>}
              </button>
            </motion.div>
          </motion.nav>
        </motion.aside>
        <main className="admin-content">
          <section className="admin-banner">
            <motion.div
              className="admin-banner-content"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="admin-banner-title">Welcome to Admin Dashboard</h1>
              <p className="admin-banner-subtitle">
                Streamline your operations with powerful tools to manage users, analyze reports, and configure settings.
              </p>
              <div className="admin-banner-buttons">
                <Link to="/admin/users" className="admin-banner-button primary">
                  Manage Users
                </Link>
                <Link to="/admin/reports" className="admin-banner-button secondary">
                  View Reports
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="admin-banner-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <svg width="250" height="250" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"
                  fill="var(--admin-accent)"
                  stroke="var(--admin-background)"
                  strokeWidth="1"
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
                <h3>Reports</h3>
                <p>Generate and analyze detailed reports to track system performance.</p>
                <Link to="/admin/reports" className="admin-feature-link">
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
    </div>
  );
};

export default AdminHomePage;