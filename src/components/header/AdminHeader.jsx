import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import { motion } from 'framer-motion';
import '../../styles/AdminHeader.css';

const AdminHeader = () => {
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
          if (userData && userData.roleId === 1) {
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
    <header className="admin-header">
      <div className="container">
        <Link to="/admin" className="logo">
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
              d="M3 4C3 3.44772 3.44772 3 4 3H8C8.55228 3 9 3.44772 9 4V8C9 8.55228 8.55228 9 8 9H4C3.44772 9 3 8.55228 3 8V4Z"
              fill="var(--admin-text)"
              stroke="var(--admin-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 16C3 15.4477 3.44772 15 4 15H8C8.55228 15 9 15.4477 9 16V20C9 20.5523 8.55228 21 8 21H4C3.44772 21 3 20.5523 3 20V16Z"
              fill="var(--admin-text)"
              stroke="var(--admin-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 4C15 3.44772 15.4477 3 16 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 20.5523 9 20 9H16C15.4477 9 15 8.55228 15 8V4Z"
              fill="var(--admin-text)"
              stroke="var(--admin-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 16C15 15.4477 15.4477 15 16 15H20C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 20.5523 15 20V16Z"
              fill="var(--admin-text)"
              stroke="var(--admin-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 6C10 5.44772 10.4477 5 11 5H13C13.5523 5 14 5.44772 14 6V18C14 18.5523 13.5523 19 13 19H11C10.4477 19 10 18.5523 10 18V6Z"
              fill="var(--admin-primary)"
              stroke="var(--admin-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Admin Panel</span>
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
          <Link to="/admin/users">User Management</Link>
          <Link to="/admin/reports">Reports</Link>
          <Link to="/admin/settings">Settings</Link>
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

export default AdminHeader;