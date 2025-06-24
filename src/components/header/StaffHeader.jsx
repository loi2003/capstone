import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import { motion } from 'framer-motion';
import '../../styles/StaffHeader.css';

const StaffHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token); // Debug: Check token presence
      if (token) {
        try {
          const response = await getCurrentUser();
          console.log('getCurrentUser response:', response); // Debug: Log full response
          const userData = response.data?.data;
          console.log('User data:', userData); // Debug: Log user data
          if (userData && Number(userData.roleId) === 2) {
            setUser(userData);
            console.log('Staff user set:', userData.email);
          } else {
            console.warn('Invalid role or user data:', userData?.roleId);
            localStorage.removeItem('token');
            setUser(null);
            navigate('/signin', { replace: true });
          }
        } catch (error) {
          console.error('Error fetching user:', error.message, error.response?.data);
          localStorage.removeItem('token');
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } else {
        console.log('No token, redirecting to signin');
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
      console.warn('No userId for logout, clearing token');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      return;
    }
    try {
      await logout(user.userId);
      console.log('Logout successful');
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
    <header className="staff-header">
      <div className="container">
        <Link to="/staff" className="logo">
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
              fill="var(--staff-text)"
              stroke="var(--staff-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
              fill="var(--staff-primary)"
              stroke="var(--staff-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
              fill="var(--staff-text)"
              stroke="var(--staff-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 4.5L8 5.5L10 3.5"
              fill="none"
              stroke="var(--staff-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 10.5L8 11.5L10 9.5"
              fill="none"
              stroke="var(--staff-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Staff Panel</span>
        </Link>
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
        <nav className={isMenuOpen ? 'block' : ''}>
          <Link to="/staff/tasks">Tasks</Link>
          <Link to="/staff/support">Support</Link>
          <Link to="/staff/profile">Profile</Link>
          {user ? (
            <div className="profile-section">
              <button
                className="profile-toggle icon-only"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <span className="profile-email">{user.email}</span>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin">Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default StaffHeader;