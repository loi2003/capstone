import { useState, useRef } from 'react';
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
                <Link to={homepageData.hero.ctaLink} className="hero-button primary">
                  {homepageData.hero.cta}
                </Link>
                <Link to={homepageData.hero.secondaryCtaLink} className="hero-button secondary">
                  {homepageData.hero.secondaryCta}
                </Link>
                <Link to={homepageData.hero.pregnancyTipsLink} className="hero-button video">
                  {homepageData.hero.pregnancyTipsText}
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-graphic"
            >
              {/* Placeholder for graphic, can be replaced with actual content */}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Our Service</h2>
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
          <h2 className="section-title">What Our Community Says</h2>
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
                <img
                  src={`https://picsum.photos/50/50?random=${index + 1}`}
                  alt={`${testimonial.name} avatar`}
                  className="testimonial-avatar"
                />
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
              <Link to="/pregnancy-tracking" className="week-popup-button">
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

        {/* Pregnancy Guides Section */}
        <section className="resources-section">
          <h2 className="section-title">{homepageData.pregnancyGuides.title}</h2>
          <p className="section-description">{homepageData.pregnancyGuides.description}</p>
          <div className="resources-grid">
            {homepageData.pregnancyGuides.items.map((resource, index) => (
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
          <Link to={homepageData.pregnancyGuides.ctaLink} className="resources-button">
            {homepageData.pregnancyGuides.cta}
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
                  <img
                    src={`https://picsum.photos/100/50?random=${index + 101}`}
                    alt={`${partner.name} logo`}
                    className="partner-logo"
                  />
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
            <Link to="/consultation" className="popup-button">Consultant Chat</Link>
            <Link to="/advice" className="popup-button">Quick Advice</Link>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;