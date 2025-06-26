import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword, resetPassword } from '../apis/authentication-api';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '', server: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Handle notification clearing
  useEffect(() => {
    if (errors.server || successMessage) {
      const timer = setTimeout(() => {
        setErrors((prev) => ({ ...prev, server: '' }));
        setSuccessMessage('');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [errors.server, successMessage]);

  // Handle redirect after successful password reset
  useEffect(() => {
    if (successMessage && step === 2 && successMessage.includes('thành công')) {
      const timer = setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, step, navigate]);

  const validateEmail = () => {
    let isValid = true;
    const newErrors = { email: '', server: '' };

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateResetForm = () => {
    let isValid = true;
    const newErrors = { otp: '', newPassword: '', confirmPassword: '', server: '' };

    if (!otp) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        isValid = false;
      }
      if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword = 'Mật khẩu phải chứa ít nhất một chữ cái in hoa';
        isValid = false;
      }
      if (!/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        newErrors.newPassword = 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: '' });
    setSuccessMessage('');

    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setSuccessMessage('Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (error) {
      console.error('Lỗi khi gửi OTP:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể gửi OTP. Vui lòng thử lại.';
      setErrors({
        ...errors,
        server: errorMessage,
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: '' });
    setSuccessMessage('');

    if (!validateResetForm()) return;

    try {
      console.log('Sending reset password request:', { token: otp, newPassword });
      await resetPassword({ token: otp, newPassword });
      setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng đến đăng nhập...');
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || JSON.stringify(error.response?.data) || 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra OTP hoặc thử lại.';
      setErrors({
        ...errors,
        server: errorMessage,
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
    hover: {
      scale: 1.15,
      filter: 'brightness(1.15)',
      transition: { duration: 0.3 },
    },
  };

  const formVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const popupVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  return (
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="forgot-password-branding"
        >
          <Link to="/" className="forgot-password-logo">
            <motion.svg
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              width="120"
              height="120"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M413.342,120.063l27.982,6.995l-31.704-19.021c7.64,0.581,24.425,0.44,35.109-10.246 c14.189-14.187,9.786-39.138,9.786-39.138s-24.463-4.893-39.14,9.783c-12.056,12.057-10.908,30.705-10.114,36.984l-88.707-53.226 C313.796,22.997,283.988,0,247.593,0c-36.191,0-65.874,22.74-68.914,51.704c-0.165,1.053-0.104,9.295,0.198,11.441 c3.494,31.607,26.468,59.616,48.756,86.772c7.549,9.197,15.177,18.497,22.008,27.871c-25.121-4.865-55.331-4.431-86.754,2.449 C88.231,196.583,34.998,243.12,43.99,284.179c7.763,35.462,59.406,55.238,121.438,49.441v59.155c-4.239,3.8-6.919,9.3-6.919,15.44 s2.682,11.64,6.919,15.44V512h83.027l-55.351-27.676v-60.668c4.239-3.8,6.919-9.3,6.919-15.44s-2.682-11.64-6.919-15.44v-63.351 c0.779-0.162,1.56-0.324,2.34-0.494c66.88-14.643,116.556-53.516,119.719-90.973c0.138-0.97,0.235-1.955,0.235-2.965 c0-43.581-29.58-79.617-55.677-111.414c-2.88-3.508-5.734-6.988-8.519-10.436c20.315-0.854,38.303-8.885,50.281-21.045 l100.334,25.084c-14.703,24.748-57.359,100.103-57.359,141.336c0,34.391,27.878,62.27,62.27,62.27 c34.391,0,62.27-27.879,62.27-62.27C468.999,218.776,429.371,147.336,413.342,120.063z M261.431,68.245 c-5.732,0-10.378-4.645-10.378-10.378s4.645-10.378,10.378-10.378c5.732,0,10.378,4.645,10.378,10.378 S267.161,68.245,261.431,68.245z"
                fill="var(--text-primary)"
                stroke="var(--white)"
                strokeWidth="12"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
              />
            </motion.svg>
          </Link>
          <div className="forgot-password-branding-text">
            <h1 className="forgot-password-title">Khôi Phục Mật Khẩu</h1>
            <p className="forgot-password-description">
              Nhập email của bạn để nhận mã OTP, sau đó đặt lại mật khẩu của bạn một cách an toàn.
            </p>
            <p className="forgot-password-quote">"Chúng tôi giúp bạn lấy lại quyền truy cập nhanh chóng và dễ dàng!"</p>
          </div>
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="forgot-password-form-container"
        >
          <h2 className="forgot-password-form-title">
            {step === 1 ? 'Gửi Mã OTP' : 'Đặt Lại Mật Khẩu'}
          </h2>
          <div className="forgot-password-form">
            {step === 1 ? (
              <>
                <div className="forgot-password-input-group">
                  <label htmlFor="email" className="forgot-password-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`forgot-password-input ${errors.email ? 'forgot-password-input-error' : ''}`}
                  />
                  {errors.email && <p className="forgot-password-error">{errors.email}</p>}
                </div>
                <button onClick={handleSendOtp} className="forgot-password-button">
                  Gửi Mã OTP
                </button>
              </>
            ) : (
              <>
                <div className="forgot-password-input-group">
                  <label htmlFor="otp" className="forgot-password-label">Mã OTP</label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`forgot-password-input ${errors.otp ? 'forgot-password-input-error' : ''}`}
                  />
                  {errors.otp && <p className="forgot-password-error">{errors.otp}</p>}
                </div>
                <div className="forgot-password-input-group">
                  <label htmlFor="newPassword" className="forgot-password-label">Mật Khẩu Mới</label>
                  <div className="password-wrapper">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`forgot-password-input ${errors.newPassword ? 'forgot-password-input-error' : ''}`}
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
                            fill="var(--text-primary)"
                          />
                        ) : (
                          <path
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.20-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                            fill="var(--text-primary)"
                          />
                        )}
                      </svg>
                    </span>
                  </div>
                  {errors.newPassword && <p className="forgot-password-error">{errors.newPassword}</p>}
                </div>
                <div className="forgot-password-input-group">
                  <label htmlFor="confirmPassword" className="forgot-password-label">Xác Nhận Mật Khẩu</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`forgot-password-input ${errors.confirmPassword ? 'forgot-password-input-error' : ''}`}
                  />
                  {errors.confirmPassword && <p className="forgot-password-error">{errors.confirmPassword}</p>}
                </div>
                <button onClick={handleResetPassword} className="forgot-password-button">
                  Đặt Lại Mật Khẩu
                </button>
              </>
            )}
          </div>
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
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#EF4444"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34C759"/>
                  </svg>
                )}
              </span>
              <p className="notification-message">{errors.server || successMessage}</p>
            </motion.div>
          )}
          {/* <div className="forgot-password-links">
            <p>
              Đã có tài khoản?{' '}
              <Link to="/signin" className="forgot-password-link">
                Đăng nhập
              </Link>
            </p>
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/signup" className="forgot-password-link">
                Tạo tài khoản mới
              </Link>
            </p>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
};

export default ForgotPassword;