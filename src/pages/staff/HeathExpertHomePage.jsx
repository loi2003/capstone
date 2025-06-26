import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HealthExpertHeader from '../../components/header/HealthExpertHeader';
import '../../styles/HealthExpertHomepage.css';

const HealthExpertHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
            <h2 className="sidebar-title">Health Expert Tools</h2>
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
                  stroke="var(--health-expert-text)"
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
              <Link to="/health-expert/dashboard" onClick={() => setIsSidebarOpen(false)}>
                Dashboard Overview
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/health-expert/reports" onClick={() => setIsSidebarOpen(false)}>
                Reports
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/health-expert/settings" onClick={() => setIsSidebarOpen(false)}>
                Settings
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <button className="sidebar-action-button">+ Create Consultation</button>
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
              stroke="var(--health-expert-white)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
        <main className="health-expert-content">
          <section className="health-expert-banner">
            <motion.div
              className="health-expert-banner-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="health-expert-banner-title">Health Expert Dashboard</h1>
              <p className="health-expert-banner-subtitle">
                Manage consultations, provide health advice, and update your profile with ease.
              </p>
              <motion.div
                className="health-expert-banner-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/health-expert/consultations" className="health-expert-banner-button primary">
                  View Consultations
                </Link>
                <Link to="/health-expert/support" className="health-expert-banner-button secondary">
                  Provide Support
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="health-expert-banner-image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--health-expert-orange)"
                  stroke="var(--health-expert-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--health-expert-orange)"
                  stroke="var(--health-expert-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--health-expert-orange)"
                  stroke="var(--health-expert-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--health-expert-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--health-expert-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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