import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/ClinicHeader.css';

const ClinicHeader = () => {
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
          if (userData && Number(userData.roleId) === 5) {
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
      } else {
        navigate('/signin', { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
      console.error('Error logging out:', error.message);
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

  return (
    <header className="clinic-header">
      <div className="container">
        <Link to="/clinic" className="logo">
          <motion.svg
            variants={logoVariants}
            animate="animate"
            whileHover="hover"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
              fill="var(--clinic-color3)"
              stroke="var(--clinic-color4)"
              strokeWidth="1.5"
            />
            <path
              d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
              fill="var(--clinic-color3)"
              stroke="var(--clinic-color4)"
              strokeWidth="1.5"
            />
            <path
              d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
              fill="var(--clinic-color3)"
              stroke="var(--clinic-color4)"
              strokeWidth="1.5"
            />
            <path
              d="M7 4.5L8 5.5L10 3.5"
              stroke="var(--clinic-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 10.5L8 11.5L10 9.5"
              stroke="var(--clinic-text)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Clinic Panel</span>
        </Link>
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="var(--clinic-color4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
        <nav className={isMenuOpen ? 'block' : ''}>
          <Link to="/clinic/dashboard">Dashboard</Link>
          <Link to="/clinic/schedule">Schedule</Link>
          <Link to="/clinic/patients">Patients</Link>
          <Link to="/clinic/support">Support</Link>
          {user ? (
            <div className="clinic-profile-section">
              <button
                className="clinic-profile-toggle"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                    fill="var(--clinic-color4)"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="clinic-profile-dropdown">
                  <span className="clinic-profile-email">{user.email}</span>
                  <button onClick={handleLogout}>Đăng Xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin">Đăng Nhập</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default ClinicHeader;