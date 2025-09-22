import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { forgotPassword, resetPassword } from "../apis/authentication-api";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    server: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Handle notification clearing
  useEffect(() => {
    if (
      errors.server ||
      (successMessage && !successMessage.includes("Password reset successful"))
    ) {
      const timer = setTimeout(() => {
        setErrors((prev) => ({ ...prev, server: "" }));
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errors.server, successMessage]);

  const validateEmail = () => {
    let isValid = true;
    const newErrors = { email: "", server: "" };

    if (!email) {
      newErrors.email = "Please enter your email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateResetForm = () => {
    let isValid = true;
    const newErrors = {
      otp: "",
      newPassword: "",
      confirmPassword: "",
      server: "",
    };

    if (!otp) {
      newErrors.otp = "Please enter the OTP code";
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "Please enter a new password";
      isValid = false;
    } else {
      if (newPassword.length < 7) {
        newErrors.newPassword = "Password must be at least 7 characters";
        isValid = false;
      }
      if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one uppercase letter";
        isValid = false;
      }
      if (!/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one special character";
        isValid = false;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: "" });
    setSuccessMessage("");

    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setSuccessMessage("OTP code has been sent to your email!");
      setStep(2);
    } catch (error) {
      console.error("Lỗi khi gửi OTP:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi OTP. Vui lòng thử lại.";
      setErrors({
        ...errors,
        server: errorMessage,
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: "" });
    setSuccessMessage("");

    if (!validateResetForm()) return;

    try {
      console.log("Sending reset password request:", {
        token: otp,
        newPassword,
      });
      await resetPassword({ token: otp, newPassword });
      setSuccessMessage("Password reset successful! Redirecting to sign-in...");
      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 6000);
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra OTP hoặc thử lại.";
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
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.15,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const formVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const popupVariants = {
    initial: { opacity: 0, y: -50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
  };

  return (
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="forgot-password-branding"
        >
          <Link to="/" className="signin-logo">
            <img
              src="/images/IMG_4602.PNG"
              alt="Logo"
              className="signin-web-logo"
            />
            NestlyCare
          </Link>
          <div className="forgot-password-branding-text">
            <h1 className="forgot-password-title">Reset Your Password</h1>
            <p className="forgot-password-description">
              Enter your email to receive an OTP code, then securely reset your
              password.
            </p>
            <p className="forgot-password-quote">
              "We help you regain access quickly and easily!"
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="forgot-password-form-container"
        >
          <h2 className="forgot-password-form-title">
            {step === 1 ? "Send OTP Code" : "Reset Password"}
          </h2>
          <div className="forgot-password-form">
            {step === 1 ? (
              <>
                <div className="forgot-password-input-group">
                  <label htmlFor="email" className="forgot-password-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`forgot-password-input ${
                      errors.email ? "forgot-password-input-error" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="forgot-password-error">{errors.email}</p>
                  )}
                </div>
                <button
                  onClick={handleSendOtp}
                  className="forgot-password-button"
                >
                  Send OTP Code
                </button>
              </>
            ) : (
              <>
                <div className="forgot-password-input-group">
                  <label htmlFor="otp" className="forgot-password-label">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`forgot-password-input ${
                      errors.otp ? "forgot-password-input-error" : ""
                    }`}
                  />
                  {errors.otp && (
                    <p className="forgot-password-error">{errors.otp}</p>
                  )}
                </div>
                <div className="forgot-password-input-group">
                  <label
                    htmlFor="newPassword"
                    className="forgot-password-label"
                  >
                    New Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`forgot-password-input ${
                        errors.newPassword ? "forgot-password-input-error" : ""
                      }`}
                    />
                    <span
                      onClick={toggleShowPassword}
                      className="password-toggle-icon"
                    >
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
                  {errors.newPassword && (
                    <p className="forgot-password-error">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div className="forgot-password-input-group">
                  <label
                    htmlFor="confirmPassword"
                    className="forgot-password-label"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`forgot-password-input ${
                      errors.confirmPassword
                        ? "forgot-password-input-error"
                        : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="forgot-password-error">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleResetPassword}
                  className="forgot-password-button"
                >
                  Reset Password
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
              className={`forgot-password-notification-popup ${
                errors.server
                  ? "forgot-password-notification-error"
                  : "forgot-password_notification-success"
              }`}
            >
              <span className="forgot-password-notification-icon">
                {errors.server ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                      fill="#EF4444"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="#34C759"
                    />
                  </svg>
                )}
              </span>
              <p className="forgot-password-notification-message">
                {errors.server || successMessage}
              </p>
            </motion.div>
          )}
          <div className="forgot-password-links">
            <p>
              Remember your password?{" "}
              <Link to="/signin" className="forgot-password-link">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForgotPassword;
