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
                  stroke="var(--nutrient-specialist-text)"
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
              <Link to="/nutrient-specialist/dashboard" onClick={() => setIsSidebarOpen(false)}>
                Dashboard Overview
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/nutrient-specialist/reports" onClick={() => setIsSidebarOpen(false)}>
                Reports
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/nutrient-specialist/settings" onClick={() => setIsSidebarOpen(false)}>
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
              stroke="var(--nutrient-specialist-white)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
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
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--nutrient-specialist-purple)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--nutrient-specialist-purple)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--nutrient-specialist-purple)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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