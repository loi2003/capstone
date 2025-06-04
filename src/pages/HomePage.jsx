import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import '../styles/HomePage.css';
import MainLayout from '../layouts/MainLayout';
import { homepageData } from '../data/homepageData';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const HomePage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const chartRef = useRef(null);

  // Dữ liệu mẫu cho 40 tuần thai
  const pregnancyData = Array.from({ length: 40 }, (_, index) => {
    const week = index + 1;
    return {
      week: `Tuần ${week}`,
      title: `Tuần ${week}`,
      description: `Đây là tuần thứ ${week} của thai kỳ. Bé đang phát triển ${week === 1 ? 'từ một tế bào nhỏ' : `nhanh chóng, kích thước khoảng ${week} cm`}.`,
      tip: `Hãy nghỉ ngơi nhiều và ăn uống lành mạnh trong tuần ${week}!`,
    };
  });

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: pregnancyData.map(data => data.week),
    datasets: [
      {
        label: 'Tiến độ thai kỳ',
        data: Array.from({ length: 40 }, (_, i) => i + 1),
        borderColor: 'rgba(107, 159, 255, 1)',
        backgroundColor: 'rgba(107, 159, 255, 0.1)',
        pointBackgroundColor: (context) => {
          const index = context.dataIndex;
          return selectedWeek && pregnancyData[index].week === selectedWeek.week
            ? '#ff6b6b'
            : 'rgba(107, 159, 255, 1)';
        },
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(107, 159, 255, 1)',
        pointRadius: 10,
        pointHoverRadius: 12,
        pointHitRadius: 20,
        tension: 0,
      },
    ],
  };

  // Tùy chọn biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tuần Thai Kỳ',
          font: { size: 16, weight: 'bold' },
        },
        ticks: {
          maxTicksLimit: 8,
          font: { size: 14 },
          padding: 10,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Tiến Độ (Tuần)',
          font: { size: 16, weight: 'bold' },
        },
        min: 0,
        max: 40,
        ticks: {
          stepSize: 5,
          font: { size: 14 },
          padding: 10,
        },
        grid: {
          display: true,
          color: 'rgba(200, 220, 200, 0.3)',
          lineWidth: 1,
        },
      },
    },
    layout: {
      padding: { left: 20, right: 20, top: 20, bottom: 20 },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedWeek(pregnancyData[index]);
      }
    },
    onHover: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setHoveredWeek(pregnancyData[index]);
      } else {
        setHoveredWeek(null);
      }
    },
  };

  const getTooltipPosition = () => {
    if (!hoveredWeek || !chartRef.current) return { display: 'none' };
    const chart = chartRef.current;
    const index = pregnancyData.findIndex(data => data.week === hoveredWeek.week);
    if (index === -1) return { display: 'none' };

    const x = chart.scales.x.getPixelForValue(index);
    const yValue = chartData.datasets[0].data[index];
    const yPos = chart.scales.y.getPixelForValue(yValue);
    return {
      display: 'block',
      left: `${x}px`,
      top: `${yPos - 50}px`,
      transform: 'translateX(-50%)',
    };
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
            <div className="chart-wrapper">
              <Line ref={chartRef} data={chartData} options={chartOptions} height={600} />
              {hoveredWeek && (
                <div className="custom-tooltip" style={getTooltipPosition()}>
                  {hoveredWeek.week}
                </div>
              )}
            </div>
          </div>
          {selectedWeek && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="week-popup"
            >
              <h3 className="week-popup-title">{selectedWeek.title}</h3>
              <p className="week-popup-description">{selectedWeek.description}</p>
              <p className="week-popup-tip"><strong>Mẹo:</strong> {selectedWeek.tip}</p>
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