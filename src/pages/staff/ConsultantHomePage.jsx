import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConsultantHeader from '../../components/header/ConsultantHeader';
import '../../styles/ConsultantHomepage.css';

const ConsultantHomePage = () => {
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
    <div className="consultant-homepage">
      <ConsultantHeader />
      <div className="consultant-main-content">
        <motion.aside
          className={`consultant-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial="open"
        >
          <div className="sidebar-header">
            <h2 className="sidebar-title">Consultant Tools</h2>
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
                  stroke="var(--consultant-text)"
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
              <Link to="/consultant/dashboard" onClick={() => setIsSidebarOpen(false)}>
                Consultant Dashboard
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/consultant/schedule" onClick={() => setIsSidebarOpen(false)}>
                Schedule
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link to="/consultant/clients" onClick={() => setIsSidebarOpen(false)}>
                Clients
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <button className="sidebar-action-button">+ Add Consultation</button>
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
              stroke="var(--consultant-white)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
        <main className="consultant-content">
          <section className="consultant-banner">
            <motion.div
              className="consultant-banner-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="consultant-banner-title">Consultant Management Dashboard</h1>
              <p className="consultant-banner-subtitle">
                Manage consultations, client records, and support efficiently.
              </p>
              <motion.div
                className="consultant-banner-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/consultant/schedule" className="consultant-banner-button primary">
                  View Schedule
                </Link>
                <Link to="/consultant/support" className="consultant-banner-button secondary">
                  Contact Support
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="consultant-banner-image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <svg
                className="consultant-banner-img"
                width="100%"
                height="100%"
                viewBox="0 0 400 250"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Consultant Dashboard Illustration"
              >
                <rect
                  x="50"
                  y="50"
                  width="300"
                  height="150"
                  rx="10"
                  fill="var(--consultant-light-brown)"
                  stroke="var(--consultant-deep-brown)"
                  strokeWidth="2"
                />
                <path
                  d="M100 100L150 150L200 120L250 160L300 130"
                  stroke="var(--consultant-white)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="100" r="5" fill="var(--consultant-deep-brown)" />
                <circle cx="150" cy="150" r="5" fill="var(--consultant-deep-brown)" />
                <circle cx="200" cy="120" r="5" fill="var(--consultant-deep-brown)" />
                <circle cx="250" cy="160" r="5" fill="var(--consultant-deep-brown)" />
                <circle cx="300" cy="130" r="5" fill="var(--consultant-deep-brown)" />
              </svg>
            </motion.div>
          </section>
          <motion.section
            className="consultant-features"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="consultant-features-title">Consultant Management Tools</h2>
            <p className="consultant-features-description">
              Streamline your consulting services with our powerful tools.
            </p>
            <div className="consultant-features-grid">
              <motion.div variants={cardVariants} className="consultant-feature-card">
                <svg
                  className="consultant-feature-icon"
                  width="100%"
                  height="100%"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Schedule Icon"
                >
                  <rect
                    x="10"
                    y="10"
                    width="30"
                    height="30"
                    rx="4"
                    fill="var(--consultant-light-brown)"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 15H35V20H15V15Z"
                    fill="var(--consultant-deep-brown)"
                  />
                  <path
                    d="M20 25V35M30 25V35"
                    stroke="var(--consultant-white)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3>Schedule</h3>
                <p>Manage and view consultation schedules.</p>
                <Link to="/consultant/schedule" className="consultant-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="consultant-feature-card">
                <svg
                  className="consultant-feature-icon"
                  width="100%"
                  height="100%"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Clients Icon"
                >
                  <circle
                    cx="25"
                    cy="20"
                    r="10"
                    fill="var(--consultant-light-brown)"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 35C15 30 20 28 25 28C30 28 35 30 35 35"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="35"
                    cy="25"
                    r="5"
                    fill="var(--consultant-light-brown)"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="15"
                    cy="25"
                    r="5"
                    fill="var(--consultant-light-brown)"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                  />
                </svg>
                <h3>Clients</h3>
                <p>Access and update client records securely.</p>
                <Link to="/consultant/clients" className="consultant-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="consultant-feature-card">
                <svg
                  className="consultant-feature-icon"
                  width="100%"
                  height="100%"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Support Icon"
                >
                  <circle
                    cx="25"
                    cy="20"
                    r="10"
                    fill="var(--consultant-light-brown)"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 35C15 30 20 28 25 28C30 28 35 30 35 35"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 10L15 5M30 10L35 5"
                    stroke="var(--consultant-deep-brown)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3>Support</h3>
                <p>Contact support for assistance with consulting operations.</p>
                <Link to="/consultant/support" className="consultant-feature-link">
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

export default ConsultantHomePage;