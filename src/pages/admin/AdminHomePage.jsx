import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/header/AdminHeader';
import '../../styles/AdminHomePage.css';

const AdminHomePage = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.2 } },
  };

  return (
    <div className="admin-homepage">
      <AdminHeader />
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
              stroke="#ffffff"
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
    </div>
  );
};

export default AdminHomePage;