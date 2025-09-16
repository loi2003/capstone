import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { register, verifyOtp } from "../../apis/authentication-api";
import apiClient from "../../apis/url-api";
import "../../styles/SignUp.css";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [timer, setTimer] = useState(120);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
    otp: "",
    server: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Clear token and Authorization header
  useEffect(() => {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common["Authorization"];
  }, []);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (errors.server || successMessage) {
      const timeout = setTimeout(() => {
        setErrors({ ...errors, server: "" });
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errors.server, successMessage]);

  // Timer effect for OTP
  useEffect(() => {
    let interval;
    if (showOtpForm && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowOtpForm(false);
            setErrors({
              ...errors,
              server: "OTP has expired. Please register again.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpForm, timer]);

  // Validation functions
  const validateUsername = (value) => {
    if (!value) return "Please enter your username";
    if (value.length < 3) return "Username must be at least 3 characters";
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return "Please enter your email";
    if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email address";
    return "";
  };

  const validatePhoneNo = (value) => {
    if (value && !/^\d{10,15}$/.test(value)) return "Invalid phone number";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Please enter a password";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (value, password) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords don't match";
    return "";
  };

  // Validate entire form on submit
  const validateForm = () => {
    const newErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      phoneNo: validatePhoneNo(phoneNo),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      otp: "",
      server: "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: "" });
    setSuccessMessage("");

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("UserName", username);
    formData.append("Email", email);
    formData.append("PhoneNo", phoneNo || "");
    formData.append("PasswordHash", password);

    try {
      const response = await register(formData);
      setSuccessMessage(
        "Registration successful! Please enter the OTP sent to your email."
      );
      setShowOtpForm(true);
      setTimer(120);
    } catch (error) {
      setErrors({
        ...errors,
        server:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    }
  };

  // OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, otp: "", server: "" });
    setSuccessMessage("");

    if (!otp || otp.length !== 6) {
      setErrors({ ...errors, otp: "Please enter a 6-digit OTP" });
      return;
    }

    try {
      const response = await verifyOtp({ email, otp });
      setSuccessMessage(
        "OTP verification successful! Your account has been activated."
      );
      setShowOtpForm(false);
      setOtp("");
      setTimer(0);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      setErrors({
        ...errors,
        otp: error.response?.data?.message || "Invalid OTP",
      });
    }
  };

  // Animation variants
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

  const brandingVariants = {
    initial: { opacity: 0, x: -30 },
    animate: {
      opacity: 1,
      x: 0,
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
    <section className="signup-section">
      <div className="signup-container">
        <motion.div
          variants={brandingVariants}
          initial="initial"
          animate="animate"
          className="signup-branding"
        >
          <Link to="/" className="signup-logo">
            <img
              src="/images/IMG_4602.PNG"
              alt="Logo"
              className="signin-web-logo"
            />
            NestlyCare
          </Link>

          <div className="signup-branding-text">
            <h1 className="signup-title">Create a New Account</h1>
            <p className="signup-description">
              Register to begin your pregnancy journey, receive professional
              health advice, and connect with a community of mothers.
            </p>
            <p className="signup-quote">
              "Your motherhood journey starts here!"
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="signup-form-container"
        >
          <h2 className="signup-form-title">
            {showOtpForm ? "Verify OTP" : "Sign Up"}
          </h2>
          <div className="signup-form">
            {showOtpForm ? (
              <>
                <div className="signup-input-group">
                  <label htmlFor="otp" className="signup-label">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`signup-input ${
                      errors.otp ? "signup-input-error" : ""
                    }`}
                    maxLength="6"
                  />
                  {errors.otp && <p className="signup-error">{errors.otp}</p>}
                </div>
                <p className="signup-timer">
                  Time remaining: {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </p>
                <button onClick={handleOtpSubmit} className="signup-button">
                  Verify OTP
                </button>
              </>
            ) : (
              <>
                <div className="signup-input-group">
                  <label htmlFor="username" className="signup-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`signup-input ${
                      errors.username ? "signup-input-error" : ""
                    }`}
                  />
                  {errors.username && (
                    <p className="signup-error">{errors.username}</p>
                  )}
                </div>
                <div className="signup-input-group">
                  <label htmlFor="email" className="signup-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`signup-input ${
                      errors.email ? "signup-input-error" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="signup-error">{errors.email}</p>
                  )}
                </div>
                <div className="signup-input-group">
                  <label htmlFor="phoneNo" className="signup-label">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phoneNo"
                    type="text"
                    placeholder="Enter phone number"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className={`signup-input ${
                      errors.phoneNo ? "signup-input-error" : ""
                    }`}
                  />
                  {errors.phoneNo && (
                    <p className="signup-error">{errors.phoneNo}</p>
                  )}
                </div>
                <div className="signup-input-group">
                  <label htmlFor="password" className="signup-label">
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`signup-input ${
                        errors.password ? "signup-input-error" : ""
                      }`}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
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
                            fill="currentColor"
                          />
                        ) : (
                          <path
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                            fill="currentColor"
                          />
                        )}
                      </svg>
                    </span>
                  </div>
                  {errors.password && (
                    <p className="signup-error">{errors.password}</p>
                  )}
                </div>
                <div className="signup-input-group">
                  <label htmlFor="confirmPassword" className="signup-label">
                    Confirm Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`signup-input ${
                        errors.confirmPassword ? "signup-input-error" : ""
                      }`}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="password-toggle-icon"
                    >
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
                            fill="currentColor"
                          />
                        ) : (
                          <path
                            d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                            fill="currentColor"
                          />
                        )}
                      </svg>
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="signup-error">{errors.confirmPassword}</p>
                  )}
                </div>
                <button onClick={handleSubmit} className="signup-button">
                  Sign Up
                </button>
              </>
            )}
            {(errors.server || successMessage) && (
              <motion.div
                variants={popupVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`signup-notification-popup ${
                  errors.server ? "signup-notification-error" : "signup-notification-success"
                }`}
              >
                <span className="notification-icon">
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
                        fill="#ef4444"
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
                        fill="#34c759"
                      />
                    </svg>
                  )}
                </span>
                <p className="signup-notification-message">
                  {errors.server || successMessage}
                </p>
              </motion.div>
            )}
            <div className="signup-links">
              <p>
                Already have an account?{" "}
                <Link to="/signin" className="signup-link">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SignUp;
