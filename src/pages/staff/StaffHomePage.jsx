import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/HomePage.css';

const StaffHomePage = () => {
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

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <section className="homepage-section">
      <header className="homepage-header">
        <Link to="/" className="homepage-logo">
          <motion.svg
            variants={logoVariants}
            animate="animate"
            whileHover="hover"
            width="60"
            height="60"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M365.557,248.556c23.518-24.742,37.837-57.488,37.837-93.404c0-17.906-3.562-35.022-10.044-50.753 c19.569-8.208,33.317-27.546,33.317-50.095C426.666,24.312,402.354,0,372.363,0c-21.616,0-40.279,12.631-49.019,30.914 C303.158,21.073,280.264,15.515,256,15.515s-47.16,5.558-67.347,15.399C179.913,12.631,161.250,0,139.636,0 c-29.991,0-54.303,24.312-54.303,54.303c0,22.55,13.746,41.888,33.317,50.095c-6.484,15.731-10.044,32.847-10.044,50.753 c0,35.916,14.319,68.662,37.837,93.404c-41.235,39.013-107.441,101.769-91.749,164.532c7.255,29.023,26.186,40.513,46.223,41.554 c1.423-37.140,28.627-66.763,61.992-66.763c34.275,0,62.061,31.258,62.061,69.818c0,21.938-9.002,41.503-23.068,54.303 c24.213,0,51.259,0,54.098,0c5.964,0,31.342,0,54.098,0c-14.068-12.800-23.068-32.365-23.068-54.303 c0-38.560,27.784-69.818,62.061-69.818c33.364,0,60.568,29.622,61.992,66.760c20.036-1.041,38.968-12.530,46.224-41.551 C472.996,350.324,406.793,287.569,365.557,248.556z M133.948,76.845c-10.099-2.540-17.585-11.655-17.585-22.542 c0-12.853,10.420-23.273,23.273-23.273c10.539,0,19.431,7.011,22.295,16.620C151.218,56.073,141.785,65.904,133.948,76.845z M318.060,143.515c6.428,0,11.636,5.210,11.636,11.636c0,6.426-5.208,11.636-11.636,11.636s-11.636-5.210-11.636-11.636 C306.424,148.725,311.632,143.515,318.060,143.515z M193.939,143.515c6.428,0,11.636,5.210,11.636,11.636 c0,6.426-5.208,11.636-11.636,11.636s-11.636-5.210-11.636-11.636C182.303,148.725,187.511,143.515,193.939,143.515z M256,294.788 c-51.413,0-93.091-27.785-93.091-62.061s41.678-62.061,93.091-62.061s93.091,27.785,93.091,62.061S307.412,294.788,256,294.788z M350.068,47.652c2.863-9.610,11.756-16.621,22.295-16.621c12.853,0,23.273,10.420,23.273,23.273 c0,10.887-7.486,20.002-17.585,22.544C370.214,65.905,360.781,56.073,350.068,47.652z"
                fill="var(--text-primary)"
                stroke="#ffffff"
                strokeWidth="12"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
              />
            </g>
            <g>
              <circle cx="161.931" cy="461.576" r="27.152" fill="var(--text-primary)" />
            </g>
            <g>
              <circle cx="350.052" cy="461.576" r="27.152" fill="var(--text-primary)" />
            </g>
            <g>
              <path
                d="M256,201.697c-17.138,0-31.030,1.806-31.030,15.515c0,13.709,13.892,31.030,31.030,31.030s31.030-17.321,31.030-31.030 C287.030,203.503,273.138,201.697,256,201.697z"
                fill="var(--text-primary)"
              />
            </g>
          </motion.svg>
        </Link>
        <nav className="homepage-nav">
          <Link to="/staff/tasks" className="homepage-nav-link">Nhiệm vụ</Link>
          <Link to="/staff/support" className="homepage-nav-link">Hỗ trợ</Link>
          <Link to="/staff/profile" className="homepage-nav-link">Hồ sơ</Link>
          <Link to="/signin" className="homepage-nav-link">Đăng xuất</Link>
        </nav>
      </header>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="homepage-content"
      >
        <h1 className="homepage-title">Trang Nhân Viên</h1>
        <p className="homepage-description">
          Chào mừng đến với trang nhân viên. Quản lý nhiệm vụ, hỗ trợ người dùng, và cập nhật hồ sơ của bạn.
        </p>
        <div className="homepage-cards">
          <div className="homepage-card">
            <h2>Nhiệm vụ</h2>
            <p>Xem và quản lý các nhiệm vụ được giao, cập nhật trạng thái công việc.</p>
            <Link to="/staff/tasks" className="homepage-card-link">Khám phá</Link>
          </div>
          <div className="homepage-card">
            <h2>Hỗ trợ</h2>
            <p>Xử lý các yêu cầu hỗ trợ từ người dùng và cung cấp giải pháp kịp thời.</p>
            <Link to="/staff/support" className="homepage-card-link">Khám phá</Link>
          </div>
          <div className="homepage-card">
            <h2>Hồ sơ</h2>
            <p>Cập nhật thông tin cá nhân, cài đặt thông báo, và quản lý tài khoản.</p>
            <Link to="/staff/profile" className="homepage-card-link">Khám phá</Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default StaffHomePage;