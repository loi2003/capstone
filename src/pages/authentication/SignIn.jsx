import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login, getCurrentUser } from "../../apis/authentication-api";
import apiClient from "../../apis/url-api";
import googleLogo from '/images/g-logo.png'
import "../../styles/SignIn.css";
// import { googleLogout, useGoogleLogin } from '@react-oauth/google';


// Hàm giải mã token JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi khi giải mã token:", error);
    return null;
  }
};

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", server: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (errors.server || successMessage) {
      const timer = setTimeout(() => {
        setErrors({ ...errors, server: "" });
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors.server, successMessage]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "", server: "" };

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, server: "" });
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      const loginResponse = await login({ email, passwordHash: password });
      console.log("Phản hồi đầy đủ từ API đăng nhập:", loginResponse);
      console.log("Dữ liệu phản hồi:", loginResponse.data);
      console.log("Các key trong dữ liệu:", Object.keys(loginResponse.data));
      console.log("Nội dung data.data:", loginResponse.data.data);
      console.log(
        "Các key trong data.data:",
        loginResponse.data.data
          ? Object.keys(loginResponse.data.data)
          : "Không có trường data"
      );

      const token =
        loginResponse.data.token ||
        loginResponse.data.accessToken ||
        loginResponse.data.jwt ||
        loginResponse.data.authToken ||
        loginResponse.data.access_token ||
        loginResponse.token ||
        loginResponse.data.data?.token ||
        loginResponse.data.data?.jwt ||
        loginResponse.data.data?.accessToken ||
        loginResponse.data.data?.auth_token ||
        loginResponse.data.user?.token ||
        loginResponse.data.user?.jwt ;

      if (token) {
        localStorage.setItem("token", token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("Đã lưu và thiết lập token:", token);
      } else {
        throw new Error(
          `Không tìm thấy token trong phản hồi. Các key: ${JSON.stringify(
            Object.keys(loginResponse.data)
          )}; Key trong data.data: ${
            loginResponse.data.data
              ? JSON.stringify(Object.keys(loginResponse.data.data))
              : "Không có"
          }`
        );
      }

      let roleId = 2; // Mặc định là User
      const decodedToken = decodeJWT(token);
      if (
        decodedToken &&
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ]
      ) {
        const role =
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        console.log("Vai trò từ token:", role);
        const roleMap = {
          Admin: 1,
          User: 2,
          HealthExpert: 3,
          NutrientSpecialist: 4,
          Clinic: 5,
          Consultant: 6,
        };
        if (roleMap[role]) {
          roleId = roleMap[role];
        }
      }

      try {
        const userResponse = await getCurrentUser(token);
        console.log("Phản hồi từ API lấy thông tin người dùng:", userResponse);
        console.log("Dữ liệu người dùng:", userResponse.data);
        console.log("roleId thô:", userResponse.data.data?.roleId);

        const roleIdRaw = userResponse.data.data?.roleId;
        if (roleIdRaw && !isNaN(Number(roleIdRaw))) {
          roleId = Number(roleIdRaw);
          console.log("roleId đã xử lý:", roleId);
        }
      } catch (userError) {
        console.warn(
          "Không lấy được thông tin người dùng, dùng vai trò từ token:",
          userError
        );
      }

      if (![1, 2, 3, 4, 5, 6].includes(roleId)) {
        throw new Error(`roleId không hợp lệ: ${roleId}`);
      }

      localStorage.removeItem("userRole");

      setSuccessMessage("Đăng nhập thành công!");
      setTimeout(() => {
        switch (roleId) {
          case 1:
            console.log("Chuyển hướng đến /admin cho roleId 1");
            navigate("/admin", { replace: true });
            break;
          case 2:
            console.log("Chuyển hướng đến / cho roleId 2");
            navigate("/", { replace: true });
            break;
          case 3:
            console.log("Chuyển hướng đến /health-expert cho roleId 3");
            navigate("/health-expert", { replace: true });
            break;
          case 4:
            console.log("Chuyển hướng đến /nutrient-specialist cho roleId 4");
            navigate("/nutrient-specialist", { replace: true });
            break;
          case 5:
            console.log("Chuyển hướng đến /clinic cho roleId 5");
            navigate("/clinic", { replace: true });
            break;
          case 6:
            console.log("Chuyển hướng đến /consultant cho roleId 6");
            navigate("/consultant", { replace: true });
            break;
          default:
            console.log("Chuyển hướng mặc định đến /");
            navigate("/", { replace: true });
        }
      }, 2000);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMessage =
        error.response?.data?.message?.toLowerCase().includes("invalid") ||
        error.response?.status === 401 ||
        error.message.includes("invalid")
          ? "Invalid email or account does not exist."
          : error.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.";
      setErrors({
        ...errors,
        server: errorMessage,
      });
    }
  };

  const handleGoogleLogin = async () => {
  try {
    const google = window.google;
    if (!google || !google.accounts || !google.accounts.id) {
      setErrors({ ...errors, server: "Google API chưa được tải." });
      return;
    }

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (googleResponse) => {
        try {
          console.log("Google Response:", googleResponse);
          const idToken = googleResponse.credential;
          console.log("ID Token:", idToken);

          // Register user via Google Signup API
          await apiClient.post("/api/auth/google-signup", {
            idToken: idToken,
          });

          // Login user via Google Login API
          const loginResponse = await apiClient.post("/api/auth/google-login", {
            idToken: idToken,
          });

          // Attempt all fallback paths
          const token =
          loginResponse.data?.token ||
          loginResponse.data?.data?.token ||
          loginResponse.data?.accessToken ||
          loginResponse.data?.data?.accessToken ||
          loginResponse.token;
          if (!token) throw new Error("Không nhận được token từ máy chủ.");

          localStorage.setItem("token", token);
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const decoded = decodeJWT(token);
          const role =
            decoded?.[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];

          if (role !== "User") {
            localStorage.removeItem("token");
            setErrors({
              ...errors,
              server: "Google chỉ hỗ trợ đăng nhập với tài khoản người dùng thường (User).",
            });
            return;
          }

          setSuccessMessage("Đăng nhập bằng Google thành công!");
          setTimeout(() => navigate("/", { replace: true }), 1500);
        } catch (err) {
          console.error("Lỗi đăng nhập Google:", err);
          setErrors({
            ...errors,
            server:
              err.response?.data?.message ||
              "Lỗi khi xác thực với Google. Vui lòng thử lại.",
          });
        }
      },
    });

    google.accounts.id.prompt(); // show login popup
  } catch (err) {
    console.error("Google login setup error:", err);
    setErrors({
      ...errors,
      server: "Lỗi khi khởi tạo đăng nhập Google.",
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
    <section className="signin-section">
      <div className="signin-container">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="signin-branding"
        >
          <Link to="/" className="signin-logo">
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
              <g>
                <path
                  d="M413.342,120.063l27.982,6.995l-31.704-19.021c7.64,0.581,24.425,0.44,35.109-10.246 c14.189-14.187,9.786-39.138,9.786-39.138s-24.463-4.893-39.14,9.783c-12.056,12.057-10.908,30.705-10.114,36.984l-88.707-53.226 C313.796,22.997,283.988,0,247.593,0c-36.191,0-65.874,22.74-68.914,51.704c-0.165,1.053-0.104,9.295,0.198,11.441 c3.494,31.607,26.468,59.616,48.756,86.772c7.549,9.197,15.177,18.497,22.008,27.871c-25.121-4.865-55.331-4.431-86.754,2.449 C88.231,196.583,34.998,243.12,43.99,284.179c7.763,35.462,59.406,55.238,121.438,49.441v59.155c-4.239,3.8-6.919,9.3-6.919,15.44 s2.682,11.64,6.919,15.44V512h83.027l-55.351-27.676v-60.668c4.239-3.8,6.919-9.3,6.919-15.44s-2.682-11.64-6.919-15.44v-63.351 c0.779-0.162,1.56-0.324,2.34-0.494c66.88-14.643,116.556-53.516,119.719-90.973c0.138-0.97,0.235-1.955,0.235-2.965 c0-43.581-29.58-79.617-55.677-111.414c-2.88-3.508-5.734-6.988-8.519-10.436c20.315-0.854,38.303-8.885,50.281-21.045 l100.334,25.084c-14.703,24.748-57.359,100.103-57.359,141.336c0,34.391,27.878,62.27,62.27,62.27 c34.391,0,62.27-27.879,62.27-62.27C468.999,218.776,429.371,147.336,413.342,120.063z M261.431,68.245 c-5.732,0-10.378-4.645-10.378-10.378s4.645-10.378,10.378-10.378c5.732,0,10.378,4.645,10.378,10.378 S267.161,68.245,261.431,68.245z"
                  fill="var(--text-primary)"
                  stroke="var(--white)"
                  strokeWidth="12"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                  }}
                />
              </g>
            </motion.svg>
          </Link>
          <div className="signin-branding-text">
            <h1 className="signin-title">Chào Mừng Bạn Đến Với Cộng Đồng</h1>
            <p className="signin-description">
              Đăng nhập để theo dõi hành trình thai kỳ, nhận tư vấn sức khỏe
              chuyên nghiệp và kết nối với cộng đồng các bà mẹ.
            </p>
            <p className="signin-quote">
              "Hành trình làm mẹ trở nên dễ dàng hơn với sự hỗ trợ từ chúng
              tôi!"
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="initial"
          animate="animate"
          className="signin-form-container"
        >
          <h2 className="signin-form-title">Đăng Nhập</h2>
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="signin-input-group">
              <label htmlFor="email" className="signin-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`signin-input ${
                  errors.email ? "signin-input-error" : ""
                }`}
              />
              {errors.email && <p className="signin-error">{errors.email}</p>}
            </div>
            <div className="signin-input-group">
              <label htmlFor="password" className="signin-label">
                Mật khẩu
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`signin-input ${
                    errors.password ? "signin-input-error" : ""
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
              {errors.password && (
                <p className="signin-error">{errors.password}</p>
              )}
            </div>
            <button type="submit" className="signin-button">
              Đăng Nhập
            </button>
            <div className="signin-divider">
              <span>hoặc</span>
            </div>
            <button className="google-login-btn" onClick={handleGoogleLogin}>
          <img src={googleLogo} alt="Google Logo" className="google-logo" />
          Sign In With Google
        </button>
          </form>
          {(errors.server || successMessage) && (
            <motion.div
              variants={popupVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`notification-popup ${
                errors.server ? "notification-error" : "notification-success"
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
              <p className="notification-message">
                {errors.server || successMessage}
              </p>
            </motion.div>
          )}
          <div className="signin-links">
            <p>
              <Link to="/forgot-password" className="signin-link">
                Quên mật khẩu?
              </Link>
            </p>
            <p>
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="signin-link">
                Tạo tài khoản mới
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SignIn;
