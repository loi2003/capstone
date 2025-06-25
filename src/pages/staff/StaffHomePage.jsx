import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StaffHeader from '../../components/header/StaffHeader';
import '../../styles/StaffHomepage.css'


const StaffHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      x: '-100%',
      opacity: 0.8,
      scale: 0.98,
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
    <div className="staff-homepage">
      <StaffHeader />
      <div className="staff-main-content">
        <motion.aside
          className={`staff-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial="open"
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">Staff Tools</h2>
            <motion.button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={isSidebarOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--staff-text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
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
            <motion.div variants={navItemVariants}>
              <Link to="/staff/dashboard" onClick={() => setIsSidebarOpen(false)}>
                Dashboard Overview
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/staff/reports" onClick={() => setIsSidebarOpen(false)}>
                Reports
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/staff/settings" onClick={() => setIsSidebarOpen(false)}>
                Settings
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <button className="sidebar-action-button">+ Create Task</button>
            </motion.div>
          </motion.nav>
        </motion.aside>
        <motion.button
          className={`sidebar-external-toggle ${isSidebarOpen ? 'hidden' : ''}`}
          onClick={toggleSidebar}
          aria-label="Open sidebar"
          aria-hidden={isSidebarOpen}
          whileHover={{ scale: 1.05, x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              stroke="var(--staff-white)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
        <main className="staff-content">
          <section className="staff-banner">
            <motion.div
              className="staff-banner-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="staff-banner-title">Staff Dashboard</h1>
              <p className="staff-banner-subtitle">
                Manage tasks, provide support, and update your profile with ease.
              </p>
              <motion.div
                className="staff-banner-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/staff/tasks" className="staff-banner-button primary">
                  View Tasks
                </Link>
                <Link to="/staff/support" className="staff-banner-button secondary">
                  Provide Support
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="staff-banner-image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--staff-orange)"
                  stroke="var(--staff-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--staff-orange)"
                  stroke="var(--staff-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 GPU 16H16C16.5523 18 17 16 17 16 16.4477 16 16 16H4C4 16.4477 3 16 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--staff-orange)"
                  stroke="var(--staff-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--staff-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--staff-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </section>
          <motion.section
            className="staff-features"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="staff-features-title">Staff Tools</h2>
            <p className="staff-features-description">
              Access essential tools to manage your work and support users efficiently.
            </p>
            <div className="staff-features-grid">
              <motion.div variants={cardVariants} className="staff-feature-card">
                <h3>Tasks</h3>
                <p>View and manage assigned tasks, update work status.</p>
                <Link to="/staff/tasks" className="staff-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="staff-feature-card">
                <h3>Support</h3>
                <p>Handle user support requests and provide timely solutions.</p>
                <Link to="/staff/support" className="staff-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="staff-feature-card">
                <h3>Profile</h3>
                <p>Update personal information, notification settings, and account details.</p>
                <Link to="/staff/profile" className="staff-feature-link">
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

export default StaffHomePage;