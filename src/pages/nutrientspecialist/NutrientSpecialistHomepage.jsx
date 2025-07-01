import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/NutrientSpecialistHomePage.css';

const NutrientSpecialistHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser();
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 4) {
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
        localStorage.removeItem('token');
        setUser(null);
        navigate('/signin', { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!user?.userId) {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      return;
    }
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logout(user.userId);
      } catch (error) {
        console.error('Error logging out:', error.message);
      } finally {
        localStorage.removeItem('token');
        setUser(null);
        setIsSidebarOpen(true);
        navigate('/signin', { replace: true });
      }
    }
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
    hover: {
      scale: 1.1,
      filter: 'brightness(1.15)',
      transition: { duration: 0.3 },
    },
  };

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
      width: '260px',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      width: '60px',
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <div className="nutrient-specialist-homepage">
      <motion.aside
        className={`nutrient-specialist-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial="open"
      >
        <div className="sidebar-header">
          <Link to="/nutrient-specialist" className="logo" onClick={() => setIsSidebarOpen(true)}>
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Leaf icon for nutrient specialist panel"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--nutrient-specialist-highlight)"
                  stroke="var(--nutrient-specialist-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Nutrient Specialist Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--nutrient-specialist-white)"
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
            <Link to="/nutrient-specialist/dashboard" onClick={() => setIsSidebarOpen(true)} title="Dashboard Overview">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Leaf icon for dashboard">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--nutrient-specialist-primary)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard Overview</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link to="/nutrient-specialist/reports" onClick={() => setIsSidebarOpen(true)} title="Reports">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Document icon for reports">
                <path
                  d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm1 4h10v2H7V6zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"
                  fill="var(--nutrient-specialist-secondary)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Reports</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link to="/nutrient-specialist/settings" onClick={() => setIsSidebarOpen(true)} title="Settings">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gear icon for settings">
                <path
                  d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zm0-10a8 8 0 00-7.2 11.6l-1.6 1.2A10 10 0 012 12c0-5.5 4.5-10 10-10s10 4.5 10 10a10 10 0 01-1.2 4.8l-1.6-1.2A8 8 0 0012 4z"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Settings</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link to="/clinic/blog-management" onClick={() => setIsSidebarOpen(true)} title="Blog Management">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Book icon for blog management">
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12.5m-16 0H20a2 2 0 002-2V7.5L16.5 3"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Blog Management</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button className="sidebar-action-button" title="Create Consultation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plus icon for create consultation">
                <path
                  d="M12 5v14m-7-7h14"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Create Consultation</span>}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div variants={navItemVariants} className="sidebar-nav-item nutrient-specialist-profile-section">
                <div className="nutrient-specialist-profile-info" title={isSidebarOpen ? user.email : ''}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="User icon for profile">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--nutrient-specialist-white)"
                    />
                  </svg>
                  {isSidebarOpen && <span className="nutrient-specialist-profile-email">{user.email}</span>}
                </div>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Logout icon">
                    <path
                      stroke="var(--nutrient-specialist-logout)"
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
              <Link to="/signin" onClick={() => setIsSidebarOpen(true)} title="Sign In">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-label="Login icon">
                  <path
                    stroke="var(--nutrient-specialist-white)"
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
      <main className="nutrient-specialist-content">
        <section className="nutrient-specialist-banner">
          <motion.div
            className="nutrient-specialist-banner-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="nutrient-specialist-banner-title">Nutrient Specialist Dashboard</h1>
            <p className="nutrient-specialist-banner-subtitle">
              Manage consultations, provide nutrition advice, and update your profile with ease.
            </p>
            <div className="nutrient-specialist-banner-buttons">
              <Link to="/nutrient-specialist/consultations" className="nutrient-specialist-banner-button primary">
                View Consultations
              </Link>
              <Link to="/nutrient-specialist/support" className="nutrient-specialist-banner-button secondary">
                Provide Support
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="nutrient-specialist-banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Nutrition icon for dashboard">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                fill="var(--nutrient-specialist-highlight)"
                stroke="var(--nutrient-specialist-primary)"
                strokeWidth="1"
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
  );
};

export default NutrientSpecialistHomePage;