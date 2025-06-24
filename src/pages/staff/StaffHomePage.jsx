import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StaffHeader from '../../components/header/StaffHeader';
import '../../styles/StaffHomePage.css';

const StaffHomePage = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.15 },
    },
  };

  return (
    <div className="staff-homepage">
      <StaffHeader />
      <section className="staff-banner">
        <motion.div
          className="staff-banner-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="staff-banner-title">Trang Nhân Viên</h1>
          <p className="staff-banner-subtitle">
            Chào mừng đến với trang nhân viên. Quản lý nhiệm vụ, hỗ trợ người dùng, và cập nhật hồ sơ của bạn.
          </p>
          <div className="staff-banner-buttons">
            <Link to="/staff/tasks" className="staff-banner-button primary">
              Xem Nhiệm Vụ
            </Link>
            <Link to="/staff/support" className="staff-banner-button secondary">
              Cung Cấp Hỗ Trợ
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="staff-banner-image"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
              fill="var(--staff-primary)"
              stroke="var(--staff-white)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
              fill="var(--staff-text)"
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
          </svg>
        </motion.div>
      </section>
      <motion.section
        className="staff-features"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <h2 className="staff-features-title">Công Cụ Nhân Viên</h2>
        <p className="staff-features-description">
          Truy cập các công cụ thiết yếu để quản lý công việc và hỗ trợ người dùng hiệu quả.
        </p>
        <div className="staff-features-grid">
          <motion.div variants={cardVariants} className="staff-feature-card">
            <h3>Nhiệm Vụ</h3>
            <p>Xem và quản lý các nhiệm vụ được giao, cập nhật trạng thái công việc.</p>
            <Link to="/staff/tasks" className="staff-feature-link">
              Khám Phá
            </Link>
          </motion.div>
          <motion.div variants={cardVariants} className="staff-feature-card">
            <h3>Hỗ Trợ</h3>
            <p>Xử lý yêu cầu hỗ trợ từ người dùng và cung cấp giải pháp kịp thời.</p>
            <Link to="/staff/support" className="staff-feature-link">
              Khám Phá
            </Link>
          </motion.div>
          <motion.div variants={cardVariants} className="staff-feature-card">
            <h3>Hồ Sơ</h3>
            <p>Cập nhật thông tin cá nhân, cài đặt thông báo, và quản lý tài khoản.</p>
            <Link to="/staff/profile" className="staff-feature-link">
              Khám Phá
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default StaffHomePage;