import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/HomePage.css';
import MainLayout from '../layouts/MainLayout';

const HomePage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <MainLayout>
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="hero-text"
            >
              <h1 className="hero-title">
                Your Trusted Source for Gender-Specific Health Information
              </h1>
              <p className="hero-subtitle">
                Access expert-reviewed articles, resources, and tools to support your health journey.
              </p>
              <div className="hero-buttons">
                <Link to="/find-provider" className="hero-cta primary">
                  Find a Provider
                </Link>
                <Link to="/health-assessment" className="hero-cta secondary">
                  Take a Health Assessment
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-graphic"
            >
              <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
                <circle cx="150" cy="100" r="80" fill="rgba(255, 255, 255, 0.2)" />
                <path
                  d="M150 100 C 180 60, 220 60, 250 100 S 220 140, 190 100 S 160 60, 130 100"
                  stroke="#fff"
                  strokeWidth="4"
                  fill="none"
                />
                <circle cx="130" cy="100" r="8" fill="#fff" />
                <circle cx="190" cy="100" r="8" fill="#fff" />
                <circle cx="250" cy="100" r="8" fill="#fff" />
                <rect
                  x="110"
                  y="160"
                  width="80"
                  height="100"
                  rx="20"
                  fill="rgba(255, 255, 255, 0.2)"
                />
                <rect x="120" y="170" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
                <rect x="120" y="190" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
                <rect x="120" y="210" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Our Services</h2>
          <div className="features-grid">
            {[
              { title: 'Gender-Affirming Care', desc: 'Resources and information', icon: '👤' },
              { title: 'Symptom Checker', desc: 'Identify possible conditions', icon: '📋' },
              { title: 'Find a Provider', desc: 'Specialized healthcare', icon: '🏥' },
              { title: 'Appointment Planner', desc: 'Schedule your visit', icon: '📅' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Popup */}
        <motion.div
          className="contact-icon"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>

        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="popup"
          >
            <Link to="/contact" className="popup-button">Contact Us</Link>
            <Link to="/assessment" className="popup-button">Take Assessment</Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;