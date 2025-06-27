import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, CategoryScale, Tooltip, Legend, LineElement } from 'chart.js';
import '../styles/HomePage.css';
import MainLayout from '../layouts/MainLayout';
import { homepageData } from '../data/homepageData';

// Register Chart.js components
ChartJS.register(PointElement, LinearScale, CategoryScale, Tooltip, Legend, LineElement);

const HomePage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [currentTrimester, setCurrentTrimester] = useState(0);
  const chartRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Get pregnancy data
  const pregnancyData = homepageData.pregnancyTracker.chartData.weeks;

  // Define trimester ranges (0-based indices)
  const trimesters = [
    { start: 0, end: 11 }, // Weeks 1–12
    { start: 12, end: 25 }, // Weeks 13–26
    { start: 26, end: 39 }, // Weeks 27–40
  ];

  // Chart data for timeline
  const chartData = {
    datasets: [
      {
        label: 'Tiến độ thai kỳ',
        data: pregnancyData
          .slice(trimesters[currentTrimester].start, trimesters[currentTrimester].end + 1)
          .map((data, index) => ({
            x: index + trimesters[currentTrimester].start,
            y: 0,
            week: data.week,
          })),
        backgroundColor: (context) => {
          const index = context.dataIndex;
          const globalIndex = index + trimesters[currentTrimester].start;
          return selectedWeek && pregnancyData[globalIndex]?.week === selectedWeek.week
            ? '#ff6b6b'
            : 'rgba(107, 159, 255, 1)';
        },
        borderColor: 'rgba(107, 159, 255, 1)',
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointHoverBackgroundColor: 'rgba(90, 140, 230, 1)',
        showLine: true,
        lineTension: 0,
        fill: false,
      },
    ],
  };

  // Chart options for timeline
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }, // Disable default tooltip
    },
    scales: {
      x: {
        type: 'linear',
        min: trimesters[currentTrimester].start - 0.5,
        max: trimesters[currentTrimester].end + 0.5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            const index = Math.round(value);
            return index >= 0 && index < pregnancyData.length ? pregnancyData[index].week : '';
          },
          font: { size: 12 },
          maxRotation: 0,
          padding: 10,
        },
        grid: { display: false },
        title: {
          display: true,
          text: `Tuần Thai Kỳ (Tam Cá Nguyệt ${currentTrimester + 1})`,
          font: { size: 16, weight: 'bold' },
          color: '#333',
        },
      },
      y: {
        display: false, // Hide y-axis
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const globalIndex = index + trimesters[currentTrimester].start;
        setSelectedWeek(pregnancyData[globalIndex]);
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    layout: {
      padding: { top: 40, bottom: 20, left: 20, right: 20 },
    },
  };

  // Navigation handlers
  const handlePrevTrimester = () => {
    if (currentTrimester > 0) {
      setCurrentTrimester(currentTrimester - 1);
      setSelectedWeek(null); // Close popup when changing trimester
    }
  };

  const handleNextTrimester = () => {
    if (currentTrimester < trimesters.length - 1) {
      setCurrentTrimester(currentTrimester + 1);
      setSelectedWeek(null); // Close popup when changing trimester
    }
  };

  // Drag scrolling handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = startX.current - e.clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentTrimester < trimesters.length - 1) {
        setCurrentTrimester(currentTrimester + 1);
        setSelectedWeek(null); // Close popup when dragging
      } else if (deltaX < 0 && currentTrimester > 0) {
        setCurrentTrimester(currentTrimester - 1);
        setSelectedWeek(null); // Close popup when dragging
      }
      isDragging.current = false;
      document.body.style.cursor = 'default';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = startX.current - e.touches[0].clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentTrimester < trimesters.length - 1) {
        setCurrentTrimester(currentTrimester + 1);
        setSelectedWeek(null); // Close popup when dragging
      } else if (deltaX < 0 && currentTrimester > 0) {
        setCurrentTrimester(currentTrimester - 1);
        setSelectedWeek(null); // Close popup when dragging
      }
      isDragging.current = false;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

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
              <h1 className="hero-title">{homepageData.hero.title}</h1>
              <p className="hero-tagline">{homepageData.hero.tagline}</p>
              <p className="hero-subtitle">{homepageData.hero.subtitle}</p>
              <p className="hero-quote">{homepageData.hero.quote}</p>
              <div className="hero-buttons">
                <Link to="/explore" className="hero-button primary">
                  {homepageData.hero.cta}
                </Link>
                <Link to={homepageData.hero.secondaryCtaLink} className="hero-button secondary">
                  {homepageData.hero.secondaryCta}
                </Link>
                <Link to={homepageData.hero.videoLink} className="hero-button video">
                  {homepageData.hero.videoText}
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-graphic"
            >
              {/* <svg height="300px" width="300px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xmlSpace="preserve">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <g id="XMLID_1299_">
                    <circle id="XMLID_1300_" style={{fill: '#6B9FFF'}} cx="270" cy="255" r="60"></circle>
                    <circle id="XMLID_1301_" style={{fill: '#FF9CC6'}} cx="220" cy="255" r="60"></circle>
                    <path id="XMLID_1302_" style={{fill: '#FFD7A8'}} d="M220,195c-33.137,0-60,26.863-60,60s26.863,60,60,60"></path>
                    <circle id="XMLID_1303_" style={{fill: '#34C759'}} cx="170" cy="255" r="60"></circle>
                    <circle id="XMLID_1304_" style={{fill: '#6B9FFF'}} cx="120" cy="245" r="60"></circle>
                    <path id="XMLID_1305_" style={{fill: '#FF9CC6'}} d="M120,185c-33.137,0-60,26.863-60,60s26.863,60,60,60"></path>
                    <path id="XMLID_1306_" style={{fill: '#FFD7A8'}} d="M121.134,17.153C105.75,11,88.291,18.483,82.138,33.866 c-4.123,10.308-2.117,21.543,4.28,29.689L73.782,95.146l13.927,5.57l13.928,5.571l12.636-31.59 c10.25-1.488,19.451-8.24,23.574-18.548C143.999,40.767,136.517,23.307,121.134,17.153z"></path>
                    <circle id="XMLID_27_" style={{fill: '#333333'}} cx="109.992" cy="45.008" r="10"></circle>
                    <path id="XMLID_1307_" style={{fill: '#34C759'}} d="M53.582,63.555c6.396-8.146,8.403-19.381,4.28-29.689 C51.708,18.483,34.249,11,18.866,17.153S-4,40.767,2.154,56.15c4.123,10.308,13.324,17.06,23.574,18.548l12.636,31.59l13.928-5.571 l13.927-5.57L53.582,63.555z"></path>
                    <circle id="XMLID_25_" style={{fill: '#333333'}} cx="30.008" cy="45.008" r="10"></circle>
                    <circle id="XMLID_1308_" style={{fill: '#FF9CC6'}} cx="80" cy="205" r="60"></circle>
                    <circle id="XMLID_1309_" style={{fill: '#FFD7A8'}} cx="70" cy="145" r="70"></circle>
                    <path id="XMLID_1310_" style={{fill: '#6B9FFF'}} d="M70,215c-38.66,0-70-31.341-70-70c0-38.66,31.34-70,70-70"></path>
                    <path id="XMLID_1311_" style={{fill: '#FFFFFF'}} d="M100,145c0,16.543-13.458,30-30,30s-30-13.457-30-30H20c0,27.57,22.43,50,50,50 s50-22.43,50-50H100z"></path>
                  </g>
                </g>
              </svg> */}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>
          <div className="features-grid">
            {homepageData.features.map((feature, index) => (
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
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2 className="section-title">Cộng Đồng Nói Gì</h2>
          <div className="testimonials-grid">
            {homepageData.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img src={testimonial.avatar} alt={`${testimonial.name} avatar`} className="testimonial-avatar" />
                <h3 className="testimonial-name">{testimonial.name}</h3>
                <p className="testimonial-feedback">{testimonial.feedback}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="community-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="community-content"
          >
            <h2 className="section-title">{homepageData.community.title}</h2>
            <p className="community-description">{homepageData.community.description}</p>
            <p className="community-highlight">{homepageData.community.highlight}</p>
            <Link to={homepageData.community.ctaLink} className="community-button">
              {homepageData.community.cta}
            </Link>
          </motion.div>
        </section>

        {/* Pregnancy Tracker Section */}
        <section className="pregnancy-tracker-section">
          <h2 className="section-title">{homepageData.pregnancyTracker.title}</h2>
          <p className="section-description">{homepageData.pregnancyTracker.description}</p>
          <div className="tracker-chart-container">
            <motion.button
              className="nav-button left"
              onClick={handlePrevTrimester}
              disabled={currentTrimester === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>
            <div
              className="chart-wrapper"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Scatter ref={chartRef} data={chartData} options={chartOptions} />
            </div>
            <motion.button
              className="nav-button right"
              onClick={handleNextTrimester}
              disabled={currentTrimester === trimesters.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.button>
          </div>
          {selectedWeek && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="week-popup"
            >
              <h3 className="week-popup-title">{selectedWeek.week}</h3>
              <h4 className="week-popup-subtitle">{selectedWeek.title}</h4>
              <p className="week-popup-description">{selectedWeek.description}</p>
              <p className="week-popup-tip"><strong>Mẹo:</strong> {selectedWeek.tip}</p>
              <Link to="/pregnancy" className="week-popup-button">
                Để biết thêm thông tin chi tiết, vui lòng chọn tại đây
              </Link>
              <button className="week-popup-close" onClick={() => setSelectedWeek(null)}>
                Đóng
              </button>
            </motion.div>
          )}
          <Link to={homepageData.pregnancyTracker.ctaLink} className="tracker-button">
            {homepageData.pregnancyTracker.cta}
          </Link>
        </section>

        {/* Health Tips Section */}
        <section className="health-tips-section">
          <h2 className="section-title">{homepageData.healthTips.title}</h2>
          <p className="section-description">{homepageData.healthTips.description}</p>
          <div className="tips-grid">
            {homepageData.healthTips.items.map((item, index) => (
              <motion.div
                key={index}
                className="tip-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="tip-title">{item.trimester}</h3>
                <ul className="tip-list">
                  {item.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <Link to={homepageData.healthTips.ctaLink} className="tips-button">
            {homepageData.healthTips.cta}
          </Link>
        </section>

        {/* Resources Section */}
        <section className="resources-section">
          <h2 className="section-title">{homepageData.resources.title}</h2>
          <p className="section-description">{homepageData.resources.description}</p>
          <div className="resources-grid">
            {homepageData.resources.items.map((resource, index) => (
              <motion.div
                key={index}
                className="resource-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <Link to={resource.link} className="resource-link">Xem chi tiết</Link>
              </motion.div>
            ))}
          </div>
          <Link to={homepageData.resources.ctaLink} className="resources-button">
            {homepageData.resources.cta}
          </Link>
        </section>

        {/* Partners Section */}
        <section className="partners-section">
          <h2 className="section-title">{homepageData.partners.title}</h2>
          <p className="section-description">{homepageData.partners.description}</p>
          <div className="partners-grid">
            {homepageData.partners.items.map((partner, index) => (
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

export default HomePage;