import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">GenderHealthWeb</Link>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          <span className="menu-icon"></span>
        </button>
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/health-a-z">Health A-Z</Link>
          <Link to="/gender-care">Gender Care</Link>
          <Link to="/conditions">Conditions</Link>
          <Link to="/treatments">Treatments</Link>
          <Link to="/resources">Resources</Link>
          <div className="auth-section">
            <Link to="/signin" className="sign-in-btn">Sign In</Link>
            <p className="auth-message">
              Don't have an account? <Link to="/signin">Sign up here</Link>.
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
