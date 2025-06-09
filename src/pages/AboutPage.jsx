import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/AboutPage.css';
import MainLayout from '../layouts/MainLayout';
import { aboutpageData } from '../data/aboutpageData';

const AboutPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <MainLayout>
      <div className="about-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="hero-text"
            >
              <h1 className="hero-title">{aboutpageData.hero.title}</h1>
              <p className="hero-subtitle">{aboutpageData.hero.subtitle}</p>
              <Link to={aboutpageData.hero.ctaLink} className="hero-button primary">
                {aboutpageData.hero.cta}
              </Link>
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
                <rect x="110" y="160" width="80" height="100" rx="20" fill="rgba(255, 255, 255, 0.2)" />
                <rect x="120" y="170" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
                <rect x="120" y="190" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
                <rect x="120" y="210" width="60" height="10" fill="rgba(255, 255, 255, 0.3)" />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mission-content"
          >
            <h2 className="section-title">{aboutpageData.mission.title}</h2>
            <p className="section-description">{aboutpageData.mission.description}</p>
            <p className="section-vision">{aboutpageData.mission.vision}</p>
          </motion.div>
        </section>

        {/* History Section */}
        <section className="history-section">
          <h2 className="section-title">{aboutpageData.history.title}</h2>
          <div className="history-timeline">
            {aboutpageData.history.milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="history-milestone"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="history-milestone-content">
                  <h3 className="history-year">{milestone.year}</h3>
                  <p className="history-event">{milestone.event}</p>
                </div>
                <div className="history-dot"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <h2 className="section-title">{aboutpageData.team.title}</h2>
          <div className="team-grid">
            {aboutpageData.team.members.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img src={member.avatar} alt={`${member.name} avatar`} className="team-avatar" />
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2 className="section-title">{aboutpageData.values.title}</h2>
          <div className="values-grid">
            {aboutpageData.values.items.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section">
          <h2 className="section-title">{aboutpageData.partners.title}</h2>
          <div className="partners-grid">
            {aboutpageData.partners.items.map((partner, index) => (
              <motion.div
                key={index}
                className="partner-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <a href={partner.link} target="_blank" rel="noopener noreferrer">
                  <img src={partner.logo} alt={`${partner.name} logo`} className="partner-logo" />
                </a>
                <p className="partner-name">{partner.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="contact-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="contact-content"
          >
            <h2 className="section-title">{aboutpageData.contact.title}</h2>
            <p className="contact-subtitle">{aboutpageData.contact.subtitle}</p>
            <Link to={aboutpageData.contact.ctaLink} className="community-button">
              {aboutpageData.contact.cta}
            </Link>
          </motion.div>
        </section>

        {/* Contact Icon */}
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

        {/* Contact Popup */}
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="contact-popup"
          >
            <Link to="/contact" className="popup-button">Liên Hệ</Link>
            <Link to="/assessment" className="popup-button">Kiểm Tra Sức Khỏe</Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default AboutPage;