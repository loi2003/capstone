import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/NutrientSpecialistHeader.css';

const NutrientSpecialistHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getCurrentUser();
          const userData = response.data?.data;
          if (userData && Number(userData.roleId) === 4) {
            setUser(userData);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            navigate('/signin', { replace: true });
          }
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } else {
        navigate('/signin', { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!user?.userId) {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      return;
    }
    try {
      await logout(user.userId);
    } catch (error) {
      console.error('Logout failed:', error.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      navigate('/signin', { replace: true });
    }
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <header className="nutrient-specialist-header">
      <div className="container">
        <Link to="/nutrient-specialist" className="logo" aria-label="Nutrient Specialist Panel Home">
          <motion.svg
            variants={logoVariants}
            animate="animate"
            whileHover="hover"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Apple icon for nutrient specialist panel"
          >
            <path
              d="M12 3C8.686 3 6 5.686 6 9c0 2.5 1.5 4.5 3.5 5.5C7.5 16 6 18 6 20h12c0-2-1.5-4-3.5-5.5C16.5 13.5 18 11.5 18 9c0-3.314-2.686-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-1 12h2v4h-2v-4z"
              fill="var(--nutrient-specialist-yellow)"
              stroke="var(--nutrient-specialist-white)"
              strokeWidth="1.5"
            />
          </motion.svg>
          <span>Nutrient Specialist Panel</span>
        </Link>
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="var(--nutrient-specialist-white)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
        <nav className={isMenuOpen ? 'block' : ''} aria-label="Main navigation">
          <Link to="/nutrient-specialist/consultations" onClick={() => setIsMenuOpen(false)}>Consultations</Link>
          <Link to="/nutrient-specialist/support" onClick={() => setIsMenuOpen(false)}>Support</Link>
          <Link to="/nutrient-specialist/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
          {user ? (
            <div className="profile-section">
              <button
                className="profile-toggle"
                onClick={toggleDropdown}
                aria-label="Toggle user menu"
                aria-expanded={isDropdownOpen}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                    fill="var(--nutrient-specialist-white)"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="profile-email">{user.email}</span>
                  <button onClick={handleLogout}>Logout</button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link to="/signin" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NutrientSpecialistHeader;