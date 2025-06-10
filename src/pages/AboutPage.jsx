import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/AboutPage.css';
import MainLayout from '../layouts/MainLayout';
import { aboutpageData } from '../data/aboutpageData';

const AboutPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Define milestones for Hành Trình Phát Triển
  const milestones = [
    {
      year: 2018,
      event: 'Thành lập GenderHealthWeb với mục tiêu nâng cao nhận thức về sức khỏe phụ nữ.',
    },
    {
      year: 2020,
      event: 'Ra mắt ứng dụng theo dõi thai kỳ, hỗ trợ hơn 10,000 bà mẹ.',
    },
    {
      year: 2022,
      event: 'Mở rộng dịch vụ với các khóa học trực tuyến về chăm sóc trước và sau sinh.',
    },
    {
      year: 2025,
      event: 'Hợp tác với các bệnh viện quốc tế để cung cấp tư vấn y khoa từ xa.',
    },
  ];

  return (
    <MainLayout>
      <div className="about-page">
        {/* Hero Section */}
        <section className="about-hero-section">
          <div className="about-hero-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="about-hero-text"
            >
              <h1 className="about-hero-title">{aboutpageData.hero.title}</h1>
              <p className="about-hero-subtitle">{aboutpageData.hero.subtitle}</p>
              <Link to={aboutpageData.hero.ctaLink} className="about-hero-button">
                {aboutpageData.hero.cta}
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="about-hero-graphic"
            >
              <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
                <circle cx="160" cy="120" r="90" fill="rgba(255, 255, 255, 0.15)" />
                <path
                  d="M160 120 C 190 70, 230 70, 270 120 S 230 170, 200 120 S 170 70, 130 120"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                />
                <circle cx="130" cy="120" r="10" fill="#ffffff" />
                <circle cx="200" cy="120" r="10" fill="#ffffff" />
                <circle cx="270" cy="120" r="10" fill="#ffffff" />
                <rect x="110" y="180" width="100" height="120" rx="25" fill="rgba(255, 255, 255, 0.1)" />
                <rect x="125" y="195" width="70" height="15" fill="rgba(255, 255, 255, 0.2)" />
                <rect x="125" y="220" width="70" height="15" fill="rgba(255, 255, 255, 0.2)" />
                <rect x="125" y="245" width="70" height="15" fill="rgba(255, 255, 255, 0.2)" />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-mission-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="about-mission-content"
          >
            <h2 className="about-section-title">{aboutpageData.mission.title}</h2>
            <p className="about-section-description">{aboutpageData.mission.description}</p>
            <p className="about-section-vision">{aboutpageData.mission.vision}</p>
          </motion.div>
        </section>

        {/* History Section */}
        <section className="about-history-section">
          <h2 className="about-section-title">Hành Trình Phát Triển</h2>
          <div className="about-history-timeline">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="about-history-milestone"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="about-history-milestone-content">
                  <h3 className="about-history-year">{milestone.year}</h3>
                  <p className="about-history-event">{milestone.event}</p>
                </div>
                <div className="about-history-dot"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team-section">
          <h2 className="about-section-title">{aboutpageData.team.title}</h2>
          <div className="about-team-grid">
            {aboutpageData.team.members.map((member, index) => (
              <motion.div
                key={index}
                className="about-team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <img src={member.avatar} alt={`${member.name} avatar`} className="about-team-avatar" />
                <h3 className="about-team-name">{member.name}</h3>
                <p className="about-team-role">{member.role}</p>
                <p className="about-team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values-section">
          <h2 className="about-section-title">{aboutpageData.values.title}</h2>
          <div className="about-values-grid">
            {aboutpageData.values.items.map((value, index) => (
              <motion.div
                key={index}
                className="about-value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="about-value-icon">{value.icon}</div>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-description">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section className="about-partners-section">
          <h2 className="about-section-title">{aboutpageData.partners.title}</h2>
          <div className="about-partners-grid">
            {aboutpageData.partners.items.map((partner, index) => (
              <motion.div
                key={index}
                className="about-partner-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <a href={partner.link} target="_blank" rel="noopener noreferrer">
                  <img src={partner.logo} alt={`${partner.name} logo`} className="about-partner-logo" />
                </a>
                <p className="about-partner-name">{partner.name}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="about-contact-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="about-contact-content"
          >
            <h2 className="about-section-title">{aboutpageData.contact.title}</h2>
            <p className="about-contact-subtitle">{aboutpageData.contact.subtitle}</p>
            <Link to={aboutpageData.contact.ctaLink} className="about-community-button">
              {aboutpageData.contact.cta}
            </Link>
          </motion.div>
        </section>

        {/* Contact Icon */}
        <motion.div
          className="about-contact-icon"
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
            className="about-contact-popup"
          >
            <Link to="/contact" className="about-popup-button">Liên Hệ</Link>
            <Link to="/assessment" className="about-popup-button">Kiểm Tra Sức Khỏe</Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default AboutPage;