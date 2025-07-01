import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HealthExpertHeader from '../../components/header/HealthExpertHeader';
import '../../styles/HealthExpertHomePage.css';

const HealthExpertHomePage = () => {
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
    <div className="health-expert-homepage">
      <HealthExpertHeader />
      <div className="health-expert-main-content">
        <motion.aside
          className={`health-expert-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial="open"
        >
          <div className="sidebar-header">
            {isSidebarOpen && <h2 className="sidebar-title">Health Expert Tools</h2>}
            <motion.button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
              aria-expanded={isSidebarOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              whileFocus={{ scale: 1.1, boxShadow: '0 0 0 3px rgba(85, 138, 161, 0.3)' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--health-expert-color1)"
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
              <Link to="/health-expert/dashboard" onClick={() => setIsSidebarOpen(false)} title="Dashboard">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stethoscope icon for dashboard">
                  <path
                    d="M20 10a3 3 0 0 0-3-3h-1V5a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 6 0h1a3 3 0 0 0 3-3v-1.5a2.5 2.5 0 0 1 5 0v.5a1 1 0 0 0 2 0v-.5a4.5 4.5 0 0 0-9 0V10z"
                    fill="var(--health-expert-color1)"
                    stroke="var(--health-expert-text)"
                    strokeWidth="1.5"
                  />
                </svg>
                {isSidebarOpen && <span>Dashboard Overview</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/health-expert/reports" onClick={() => setIsSidebarOpen(false)} title="Reports">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stethoscope icon for reports">
                  <path
                    d="M20 10a3 3 0 0 0-3-3h-1V5a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 6 0h1a3 3 0 0 0 3-3v-1.5a2.5 2.5 0 0 1 5 0v.5a1 1 0 0 0 2 0v-.5a4.5 4.5 0 0 0-9 0V10z"
                    fill="var(--health-expert-color2)"
                    stroke="var(--health-expert-text)"
                    strokeWidth="1.5"
                  />
                </svg>
                {isSidebarOpen && <span>Reports</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/health-expert/settings" onClick={() => setIsSidebarOpen(false)} title="Settings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stethoscope icon for settings">
                  <path
                    d="M20 10a3 3 0 0 0-3-3h-1V5a4 4 0 0 0-8 0v2H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 6 0h1a3 3 0 0 0 3-3v-1.5a2.5 2.5 0 0 1 5 0v.5a1 1 0 0 0 2 0v-.5a4.5 4.5 0 0 0-9 0V10z"
                    fill="var(--health-expert-color3)"
                    stroke="var(--health-expert-text)"
                    strokeWidth="1.5"
                  />
                </svg>
                {isSidebarOpen && <span>Settings</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <button className="sidebar-action-button" title="Create Consultation">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plus icon for create consultation">
                  <path
                    d="M12 5v14m-7-7h14"
                    stroke="var(--health-expert-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isSidebarOpen && <span>Create Consultation</span>}
              </button>
            </motion.div>
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
              <h1 className="health-expert-banner-title">Health Expert Dashboard</h1>
              <p className="health-expert-banner-subtitle">
                Manage consultations, provide health advice, and update your profile with ease.
              </p>
              <div className="health-expert-banner-buttons">
                <Link to="/health-expert/consultations" className="health-expert-banner-button primary">
                  View Consultations
                </Link>
                <Link to="/health-expert/support" className="health-expert-banner-button secondary">
                  Provide Support
                </Link>
              </div>
            </motion.div>
            <motion.div
              className="health-expert-banner-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Stethoscope icon for health expert dashboard">
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
            <h2 className="health-expert-features-title">Health Expert Tools</h2>
            <p className="health-expert-features-description">
              Access essential tools to manage your consultations and support users efficiently.
            </p>
            <div className="health-expert-features-grid">
              <motion.div variants={cardVariants} className="health-expert-feature-card">
                <h3>Consultations</h3>
                <p>View and manage assigned consultations, update health advice.</p>
                <Link to="/health-expert/consultations" className="health-expert-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="health-expert-feature-card">
                <h3>Support</h3>
                <p>Handle user support requests and provide timely health solutions.</p>
                <Link to="/health-expert/support" className="health-expert-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="health-expert-feature-card">
                <h3>Profile</h3>
                <p>Update personal information, notification settings, and account details.</p>
                <Link to="/health-expert/profile" className="health-expert-feature-link">
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

export default HealthExpertHomePage;