import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NutrientSpecialistHeader from '../../components/header/NutrientSpecialistHeader';
import '../../styles/NutrientSpecialistHomepage.css';

const NutrientSpecialistHomePage = () => {
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
      width: '260px',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      width: '60px',
      opacity: 0.9,
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
    <div className="nutrient-specialist-homepage">
      <NutrientSpecialistHeader />
      <div className="nutrient-specialist-main-content">
        <motion.aside
          className={`nutrient-specialist-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial="open"
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">Nutrient Specialist Tools</h2>
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
                  stroke="var(--nutrient-specialist-purple)"
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
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/nutrient-specialist/dashboard" onClick={() => setIsSidebarOpen(false)} title="Dashboard Overview">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple icon for dashboard">
                  <path
                    d="M12 3C8.686 3 6 5.686 6 9c0 2.5 1.5 4.5 3.5 5.5C7.5 16 6 18 6 20h12c0-2-1.5-4-3.5-5.5C16.5 13.5 18 11.5 18 9c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-1 12h2v4h-2v-4z"
                    fill="var(--nutrient-specialist-purple)"
                    stroke="var(--nutrient-specialist-purple-dark)"
                    strokeWidth="1.5"
                    className="icon-stroke"
                  />
                </svg>
                {isSidebarOpen && <span>Dashboard Overview</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/nutrient-specialist/reports" onClick={() => setIsSidebarOpen(false)} title="Reports">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple icon for reports">
                  <path
                    d="M12 3C8.686 3 6 5.686 6 9c0 2.5 1.5 4.5 3.5 5.5C7.5 16 6 18 6 20h12c0-2-1.5-4-3.5-5.5C16.5 13.5 18 11.5 18 9c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-1 12h2v4h-2v-4z"
                    fill="var(--nutrient-specialist-purple-dark)"
                    stroke="var(--nutrient-specialist-purple-dark)"
                    strokeWidth="1.5"
                    className="icon-stroke"
                  />
                </svg>
                {isSidebarOpen && <span>Reports</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/nutrient-specialist/settings" onClick={() => setIsSidebarOpen(false)} title="Settings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple icon for settings">
                  <path
                    d="M12 3C8.686 3 6 5.686 6 9c0 2.5 1.5 4.5 3.5 5.5C7.5 16 6 18 6 20h12c0-2-1.5-4-3.5-5.5C16.5 13.5 18 11.5 18 9c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-1 12h2v4h-2v-4z"
                    fill="var(--nutrient-specialist-light-bg)"
                    stroke="var(--nutrient-specialist-purple-dark)"
                    strokeWidth="1.5"
                    className="icon-stroke"
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
                    stroke="var(--nutrient-specialist-purple)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon-stroke"
                  />
                </svg>
                {isSidebarOpen && <span>Create Consultation</span>}
              </button>
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
              stroke="var(--nutrient-specialist-yellow)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
              className="icon-stroke"
            />
          </svg>
        </motion.button>
        <main className="nutrient-specialist-content">
          <section className="nutrient-specialist-banner">
            <motion.div
              className="nutrient-specialist-banner-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="nutrient-specialist-banner-title">Nutrient Specialist Dashboard</h1>
              <p className="nutrient-specialist-banner-subtitle">
                Manage consultations, provide nutrition advice, and update your profile with ease.
              </p>
              <motion.div
                className="nutrient-specialist-banner-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/nutrient-specialist/consultations" className="nutrient-specialist-banner-button primary">
                  View Consultations
                </Link>
                <Link to="/nutrient-specialist/support" className="nutrient-specialist-banner-button secondary">
                  Provide Support
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="nutrient-specialist-banner-image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple icon for nutrient specialist dashboard">
                <path
                  d="M12 3C8.686 3 6 5.686 6 9c0 2.5 1.5 4.5 3.5 5.5C7.5 16 6 18 6 20h12c0-2-1.5-4-3.5-5.5C16.5 13.5 18 11.5 18 9c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-1 12h2v4h-2v-4z"
                  fill="var(--nutrient-specialist-yellow)"
                  stroke="var(--nutrient-specialist-purple-dark)"
                  strokeWidth="1"
                  className="icon-stroke"
                />
              </svg>
            </motion.div>
          </section>
          <motion.section
            className="nutrient-specialist-features"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="nutrient-specialist-features-title">Nutrient Specialist Tools</h2>
            <p className="nutrient-specialist-features-description">
              Access essential tools to manage your consultations and support users efficiently.
            </p>
            <div className="nutrient-specialist-features-grid">
              <motion.div variants={cardVariants} className="nutrient-specialist-feature-card">
                <h3>Consultations</h3>
                <p>View and manage assigned consultations, update nutrition advice.</p>
                <Link to="/nutrient-specialist/consultations" className="nutrient-specialist-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="nutrient-specialist-feature-card">
                <h3>Support</h3>
                <p>Handle user support requests and provide timely nutrition solutions.</p>
                <Link to="/nutrient-specialist/support" className="nutrient-specialist-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="nutrient-specialist-feature-card">
                <h3>Profile</h3>
                <p>Update personal information, notification settings, and account details.</p>
                <Link to="/nutrient-specialist/profile" className="nutrient-specialist-feature-link">
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

export default NutrientSpecialistHomePage;