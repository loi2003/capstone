import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConsultantHeader from '../../components/header/ConsultantHeader';
import '../../styles/ConsultantHomePage.css';

const ConsultantHomePage = () => {
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
            {isSidebarOpen && <h2 className="sidebar-title">Consultant Tools</h2>}
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
                  stroke="var(--consultant-primary)"
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
              <Link to="/consultant/dashboard" onClick={() => setIsSidebarOpen(false)} title="Dashboard">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--consultant-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12h18M12 3v18"
                  />
                </svg>
                {isSidebarOpen && <span>Dashboard</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/consultant/schedule" onClick={() => setIsSidebarOpen(false)} title="Schedule">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--consultant-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                  />
                </svg>
                {isSidebarOpen && <span>Schedule</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/consultant/clients" onClick={() => setIsSidebarOpen(false)} title="Clients">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--consultant-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  />
                </svg>
                {isSidebarOpen && <span>Clients</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link to="/consultant/support" onClick={() => setIsSidebarOpen(false)} title="Support">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--consultant-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 5.636l-3.536 3.536M5.636 5.636l3.536 3.536M12 3v3M12 15v3M18.364 18.364l-3.536-3.536M5.636 18.364l3.536-3.536M3 12h3M18 12h3"
                  />
                </svg>
                {isSidebarOpen && <span>Support</span>}
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <button className="sidebar-action-button" title="Add Consultation">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--consultant-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14m-7-7h14"
                  />
                </svg>
                {isSidebarOpen && <span>Add Consultation</span>}
              </button>
            </motion.div>
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
              <h1 className="consultant-banner-title">Consultant Management Dashboard</h1>
              <p className="consultant-banner-subtitle">
                Manage consultations, client records, and support efficiently.
              </p>
              <div className="consultant-banner-buttons">
                <Link to="/consultant/schedule" className="consultant-banner-button primary">
                  View Schedule
                </Link>
                <Link to="/consultant/support" className="consultant-banner-button secondary">
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
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 7h-6a2 2 0 01-2-2V3a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2zm-6 0V3h6v4h-6zm-4 10h10a2 2 0 002-2v-2a2 2 0 00-2-2H10a2 2 0 00-2 2v2a2 2 0 002 2zm0-2v-2h10v2H10zm-6 5h12a2 2 0 002-2v-1a2 2 0 00-2-2H4a2 2 0 00-2 2v1a2 2 0 002 2zm0-2v-1h12v1H4z"
                  fill="var(--consultant-accent)"
                  stroke="var(--consultant-primary)"
                  strokeWidth="1"
                />
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
                <h3>Schedule</h3>
                <p>Manage and view consultation schedules.</p>
                <Link to="/consultant/schedule" className="consultant-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="consultant-feature-card">
                <h3>Clients</h3>
                <p>Access and update client records securely.</p>
                <Link to="/consultant/clients" className="consultant-feature-link">
                  Explore
                </Link>
              </motion.div>
              <motion.div variants={cardVariants} className="consultant-feature-card">
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