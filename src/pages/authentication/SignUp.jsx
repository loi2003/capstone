import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, verifyOtp } from '../../apis/authentication-api';
import '../../styles/SignUp.css';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [timer, setTimer] = useState(120);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    otp: '',
    server: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      phoneNo: '',
      password: '',
      confirmPassword: '',
      otp: '',
      server: '',
    };

    if (!username) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.userQname = 'Tên người dùng phải có ít nhất 3 ký tự';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (phoneNo && !/^\d{10,15}$/.test(phoneNo)) {
      newErrors.phoneNo = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: '' });
    setSuccessMessage('');

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('UserName', username);
    formData.append('Email', email);
    formData.append('PhoneNo', phoneNo || '');
    formData.append('PasswordHash', password);

    try {
      const response = await register(formData);
      setSuccessMessage('Đăng ký thành công! Vui lòng nhập OTP được gửi đến email của bạn.');
      setShowOtpForm(true);
      setTimer(120);
    } catch (error) {
      setErrors({
        ...errors,
        server: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký',
      });
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, otp: '', server: '' });
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setErrors({ ...errors, otp: 'Vui lòng nhập OTP 6 chữ số' });
      return;
    }

    try {
      const response = await verifyOtp({ email, otp });
      setSuccessMessage('Xác minh OTP thành công! Tài khoản của bạn đã được kích hoạt.');
      setShowOtpForm(false);
      setOtp('');
      setTimer(0);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      setErrors({
        ...errors,
        otp: error.response?.data?.message || 'OTP không hợp lệ',
      });
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    let interval;
    if (showOtpForm && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowOtpForm(false);
            setErrors({ ...errors, server: 'OTP đã hết hạn. Vui lòng đăng ký lại.' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpForm, timer]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Animation for the logo (heartbeat effect)
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

  // Animation for the form container
  const formVariants = {
    initial: { opacity: 0, scale: 0.95, x: -20 },
    animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // Animation for the branding section
  const brandingVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  // Animation for the background icons
  const iconVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut', delay: 0.5 } },
  };

  // Animation for popup
  const popupVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  return (
    <section className="signup-section">
      <div className="signup-container">
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          className="signup-background-icons"
        >
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="signup-form-container"
        >
          <h2 className="signup-form-title">{showOtpForm ? 'Xác Minh OTP' : 'Đăng Ký'}</h2>
          {showOtpForm ? (
            <div className="signup-form">
              <div className="signup-input-group">
                <label htmlFor="otp" className="signup-label">Mã OTP</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP 6 chữ số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`signup-input ${errors.otp ? 'signup-input-error' : ''}`}
                  maxLength="6"
                />
                {errors.otp && <p className="signup-error">{errors.otp}</p>}
              </div>
              <p className="signup-timer">Thời gian còn lại: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
              <button onClick={handleOtpSubmit} className="signup-button">
                Xác Minh OTP
              </button>
            </div>
          ) : (
            <div className="signup-form">
              <div className="signup-input-group">
                <label htmlFor="username" className="signup-label">Tên người dùng</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Nhập tên người dùng"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`signup-input ${errors.username ? 'signup-input-error' : ''}`}
                />
                {errors.username && <p className="signup-error">{errors.username}</p>}
              </div>
              <div className="signup-input-group">
                <label htmlFor="email" className="signup-label">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`signup-input ${errors.email ? 'signup-input-error' : ''}`}
                />
                {errors.email && <p className="signup-error">{errors.email}</p>}
              </div>
              <div className="signup-input-group">
                <label htmlFor="phoneNo" className="signup-label">Số điện thoại (Tùy chọn)</label>
                <input
                  id="phoneNo"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className={`signup-input ${errors.phoneNo ? 'signup-input-error' : ''}`}
                />
                {errors.phoneNo && <p className="signup-error">{errors.phoneNo}</p>}
              </div>
              <div className="signup-input-group">
                <label htmlFor="password" className="signup-label">Mật khẩu</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`signup-input ${errors.password ? 'signup-input-error' : ''}`}
                  />
                  <span onClick={toggleShowPassword} className="password-toggle-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showPassword ? (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          fill="#ff9cbb"
                        />
                      ) : (
                        <path
                          d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          fill="#ff9cbb"
                        />
                      )}
                    </svg>
                  </span>
                </div>
                {errors.password && <p className="signup-error">{errors.password}</p>}
              </div>
              <div className="signup-input-group">
                <label htmlFor="confirmPassword" className="signup-label">Nhập mật khẩu lần nữa</label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`signup-input ${errors.confirmPassword ? 'signup-input-error' : ''}`}
                  />
                  <span onClick={toggleShowConfirmPassword} className="password-toggle-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {showConfirmPassword ? (
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          fill="#ff9cbb"
                        />
                      ) : (
                        <path
                          d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                          fill="#ff9cbb"
                        />
                      )}
                    </svg>
                  </span>
                </div>
                {errors.confirmPassword && <p className="signup-error">{errors.confirmPassword}</p>}
              </div>
              <button onClick={handleSubmit} className="signup-button">
                Đăng Ký
              </button>
            </div>
          )}
          {(errors.server || successMessage) && (
            <motion.div
              variants={popupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`notification-popup ${errors.server ? 'notification-error' : 'notification-success'}`}
            >
              <span className="notification-icon">
                {errors.server ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34c759"/>
                  </svg>
                )}
              </span>
              <p className="notification-message">{errors.server || successMessage}</p>
            </motion.div>
          )}
          <div className="signup-links">
            <p>
              Đã có tài khoản?{' '}
              <Link to="/signin" className="signup-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={brandingVariants}
          initial="initial"
          animate="animate"
          className="signup-branding"
        >
          <Link to="/" className="signup-logo">
            <motion.svg
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              width="120"
              height="120"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
            >
              <g>
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
              </g>
            </motion.svg>
          </Link>
          <div className="signup-branding-text">
            <h1 className="signup-title">Tạo Tài Khoản Mới</h1>
            <p className="signup-description">
              Đăng ký để bắt đầu hành trình thai kỳ, nhận tư vấn sức khỏe chuyên nghiệp và kết nối với cộng đồng các bà mẹ.
            </p>
            <p className="signup-quote">"Hành trình làm mẹ bắt đầu từ đây!"</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SignUp;