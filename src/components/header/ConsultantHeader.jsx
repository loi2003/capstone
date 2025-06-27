import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/ConsultantHeader.css';

const ConsultantHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      console.log('Token từ localStorage:', token);
      if (token) {
        try {
          const response = await getCurrentUser();
          console.log('Phản hồi getCurrentUser:', response);
          const userData = response.data?.data;
          if (userData && Number(userData.roleId) === 6) {
            console.log('User hợp lệ với roleId 6:', userData);
            setUser(userData);
          } else {
            console.warn('User không hợp lệ hoặc roleId không phải 6:', userData);
            localStorage.removeItem('token');
            setUser(null);
            navigate('/signin', { replace: true });
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          localStorage.removeItem('token');
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } else {
        console.warn('Không tìm thấy token, chuyển hướng đến /signin');
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
      console.warn('Không có userId, xóa token và chuyển hướng');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      return;
    }
    try {
      console.log('Đăng xuất userId:', user.userId);
      await logout(user.userId);
    } catch (error) {
      console.error('Lỗi đăng xuất:', error.message);
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
    <header className="consultant-header">
      <div className="container">
        <Link to="/consultant" className="logo" aria-label="Consultant Panel Home">
          <motion.svg
            variants={logoVariants}
            animate="animate"
            whileHover="hover"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20C20.5523 6 21 5.55228 21 5C21 5.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
              fill="var(--consultant-deep-brown)"
              stroke="var(--consultant-white)"
              strokeWidth="1.5"
            />
            <path
              d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
              fill="var(--consultant-light-brown)"
              stroke="var(--consultant-white)"
              strokeWidth="1.5"
            />
            <path
              d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
              fill="var(--consultant-deep-brown)"
              stroke="var(--consultant-white)"
              strokeWidth="1.5"
            />
            <path
              d="M7 4.5L8 5.5L10 3.5"
              stroke="var(--consultant-light-brown)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 10.5L8 11.5L10 9.5"
              stroke="var(--consultant-deep-brown)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
          <span>Consultant Panel</span>
        </Link>
        <motion.button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              stroke="var(--consultant-text)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </motion.button>
        <nav className={`consultant-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <Link to="/consultant/dashboard" onClick={() => setIsMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/consultant/schedule" onClick={() => setIsMenuOpen(false)}>
            Schedule
          </Link>
          <Link to="/consultant/clients" onClick={() => setIsMenuOpen(false)}>
            Clients
          </Link>
          <Link to="/consultant/support" onClick={() => setIsMenuOpen(false)}>
            Support
          </Link>
        </nav>
        <div className="consultant-user-section">
          {user ? (
            <div className="consultant-user-info">
              <motion.div
                className="consultant-user-icon"
                onClick={toggleDropdown}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="User menu"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="var(--consultant-text)"
                  />
                </svg>
              </motion.div>
              {isDropdownOpen && (
                <motion.div
                  className="consultant-user-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="consultant-user-email">{user.email}</span>
                  <button onClick={handleLogout} className="consultant-logout-button">
                    Đăng Xuất
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="consultant-login-link">
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default ConsultantHeader;