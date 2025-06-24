import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import { login, getCurrentUser } from '../../apis/authentication-api'; 
import apiClient from '../../apis/url-api';
import '../../styles/SignIn.css'; 

// Hàm giải mã token JWT (chìa khóa xác thực) để lấy thông tin như vai trò (role)
const decodeJWT = (token) => {
  // Bắt đầu thử giải mã token
  try {
    // Token JWT có 3 phần (header, payload, signature) phân cách bằng dấu .
    // Lấy phần payload (phần giữa, chứa thông tin người dùng)
    const base64Url = token.split('.')[1];
    // Chuyển đổi định dạng base64 để giải mã
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Giải mã base64 thành chuỗi JSON
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    // Chuyển chuỗi JSON thành đối tượng JavaScript (ví dụ: { "role": "Staff" })
    return JSON.parse(jsonPayload);
  // Nếu giải mã thất bại, ghi lỗi và trả về null
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error);
    return null;
  }
};

// Component chính: Trang đăng nhập
const SignIn = () => {
  // Tạo các trạng thái (state) để lưu dữ liệu người dùng nhập
  const [email, setEmail] = useState(''); // Lưu email người dùng gõ
  const [password, setPassword] = useState(''); // Lưu mật khẩu người dùng gõ
  const [showPassword, setShowPassword] = useState(false); // Quyết định hiển thị mật khẩu (text) hay ẩn (dots)
  const [errors, setErrors] = useState({ email: '', password: '', server: '' }); // Lưu thông báo lỗi
  const [successMessage, setSuccessMessage] = useState(''); // Lưu thông báo thành công
  const navigate = useNavigate(); // Hàm để chuyển hướng trang (ví dụ: đến /staff)

  // Thêm useEffect để tự động xóa thông báo sau 5 giây
  useEffect(() => {
    if (errors.server || successMessage) {
      const timer = setTimeout(() => {
        setErrors({ ...errors, server: '' });
        setSuccessMessage('');
      }, 5000); // 5000ms = 5 giây
      return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
    }
  }, [errors.server, successMessage]); // Chạy lại khi errors.server hoặc successMessage thay đổi

  // Hàm kiểm tra email và mật khẩu có hợp lệ không
  const validateForm = () => {
    let isValid = true; // Biến kiểm tra form có hợp lệ không
    const newErrors = { email: '', password: '', server: '' }; // Tạo đối tượng lỗi mới

    // Kiểm tra email
    if (!email) {
      newErrors.email = 'Vui lòng nhập email'; // Nếu email trống
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ'; // Nếu email không đúng định dạng (thiếu @ hoặc .com)
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'; // Nếu mật khẩu trống
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'; // Nếu mật khẩu quá ngắn
      isValid = false;
    }

    setErrors(newErrors); // Cập nhật lỗi để hiển thị trên giao diện
    return isValid; // Trả về true nếu hợp lệ, false nếu có lỗi
  };

  // Hàm xử lý khi người dùng nhấn nút "Đăng Nhập"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form gửi yêu cầu mặc định của HTML
    setErrors({ ...errors, server: '' }); // Xóa lỗi máy chủ trước đó
    setSuccessMessage(''); // Xóa thông báo thành công trước đó

    // Kiểm tra form, nếu không hợp lệ thì dừng lại
    if (!validateForm()) return;

    // Bắt đầu thử đăng nhập
    try {
      // Gửi yêu cầu đăng nhập đến API /api/auth/user/login
      const loginResponse = await login({ email, passwordHash: password });
      // Ghi log để kiểm tra phản hồi từ máy chủ
      console.log('Phản hồi đầy đủ từ API đăng nhập:', loginResponse);
      console.log('Dữ liệu phản hồi:', loginResponse.data);
      console.log('Các key trong dữ liệu:', Object.keys(loginResponse.data));
      console.log('Nội dung data.data:', loginResponse.data.data);
      console.log('Các key trong data.data:', loginResponse.data.data ? Object.keys(loginResponse.data.data) : 'Không có trường data');

      // Tìm token (chìa khóa xác thực) trong phản hồi
      const token = loginResponse.data.token || 
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
                    loginResponse.data.user?.jwt;
      // Nếu tìm thấy token
      if (token) {
        // Lưu token vào localStorage (như lưu chìa khóa vào ví)
        localStorage.setItem('token', token);
        // Thêm token vào header của các yêu cầu API tiếp theo
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Đã lưu và thiết lập token:', token);
      // Nếu không tìm thấy token, báo lỗi
      } else {
        throw new Error(`Không tìm thấy token trong phản hồi. Các key: ${JSON.stringify(Object.keys(loginResponse.data))}; Key trong data.data: ${loginResponse.data.data ? JSON.stringify(Object.keys(loginResponse.data.data)) : 'Không có'}`);
      }

      // Giải mã token để lấy vai trò (role) làm phương án dự phòng
      let roleId = 2; // Mặc định là người dùng (roleId: 2)
      const decodedToken = decodeJWT(token); // Giải mã token
      // Nếu token có vai trò "Staff", đặt roleId là 3 (nhân viên)
      if (decodedToken && decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Staff') {
        roleId = 3;
        console.log('Vai trò từ token:', decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
      }

      // Gọi API /api/User/get-current-user để lấy thông tin người dùng
      try {
        const userResponse = await getCurrentUser();
        console.log('Phản hồi từ API lấy thông tin người dùng:', userResponse);
        console.log('Dữ liệu người dùng:', userResponse.data);
        console.log('roleId thô:', userResponse.data.data?.roleId);

        // Lấy roleId từ phản hồi
        const roleIdRaw = userResponse.data.data?.roleId;
        // Nếu roleId hợp lệ (là số), cập nhật roleId
        if (roleIdRaw && !isNaN(Number(roleIdRaw))) {
          roleId = Number(roleIdRaw);
          console.log('roleId đã xử lý:', roleId);
        }
      // Nếu API lấy thông tin thất bại, giữ roleId từ token
      } catch (userError) {
        console.warn('Không lấy được thông tin người dùng, dùng vai trò từ token:', userError);
      }

      // Kiểm tra roleId có hợp lệ không (phải là 1, 2, hoặc 3)
      if (![1, 2, 3].includes(roleId)) {
        throw new Error(`roleId không hợp lệ: ${roleId}`);
      }

      // Xóa dữ liệu cũ trong localStorage để tránh xung đột
      localStorage.removeItem('userRole');

      // Hiển thị thông báo thành công
      setSuccessMessage('Đăng nhập thành công!');
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        if (roleId === 1) {
          console.log('Chuyển hướng đến /admin cho roleId 1');
          navigate('/admin', { replace: true });
        } else if (roleId === 3) {
          console.log('Chuyển hướng đến /staff cho roleId 3');
          navigate('/staff', { replace: true });
        } else {
          console.log('Chuyển hướng đến / cho roleId 2');
          navigate('/', { replace: true });
        }
      }, 2000);
    // Xử lý lỗi nếu đăng nhập thất bại
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      // Hiển thị thông báo lỗi trên giao diện
      setErrors({
        ...errors,
        server: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.',
      });
    }
  };

  // Hàm xử lý nút "Đăng nhập với Gmail" (chưa hoàn thiện)
  const handleGmailLogin = () => {
    console.log('Bắt đầu đăng nhập với Gmail');
  };

  // Hàm bật/tắt hiển thị mật khẩu
  const toggleShowPassword = () => {
    setShowPassword(!showPassword); // Đổi giữa hiển thị và ẩn mật khẩu
  };

  // Định nghĩa hiệu ứng động cho logo
  const logoVariants = {
    animate: {
      scale: [1, 1.08, 1], // Phóng to rồi thu nhỏ lặp lại
      transition: {
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
    hover: {
      scale: 1.15, // Phóng to hơn khi rê chuột
      filter: 'brightness(1.15)',
      transition: { duration: 0.3 },
    },
  };

  // Định nghĩa hiệu ứng động cho form
  const formVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 }, // Form bắt đầu mờ và nhỏ
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }, // Form hiện rõ và to dần
  };

  // Định nghĩa hiệu ứng động cho popup thông báo
  const popupVariants = {
    initial: { opacity: 0, y: -50 }, // Popup bắt đầu mờ và ở trên
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }, // Popup hiện rõ và hạ xuống
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }, // Popup mờ đi khi biến mất
  };

  // Giao diện trang đăng nhập
  return (
    <section className="signin-section">
      <div className="signin-container">
        {/* Phần bên trái: Logo và thông điệp */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} // Bắt đầu mờ và lệch trái
          animate={{ opacity: 1, x: 0 }} // Hiện rõ và dịch về giữa
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="signin-branding"
        >
          <Link to="/" className="signin-logo">
            <motion.svg
              variants={logoVariants} // Áp dụng hiệu ứng phóng to/thu nhỏ
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
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                />
              </g>
            </motion.svg>
          </Link>
          <div className="signin-branding-text">
            <h1 className="signin-title">Chào Mừng Bạn Đến Với Cộng Đồng</h1>
            <p className="signin-description">
              Đăng nhập để theo dõi hành trình thai kỳ, nhận tư vấn sức khỏe chuyên nghiệp và kết nối với cộng đồng các bà mẹ.
            </p>
            <p className="signin-quote">"Hành trình làm mẹ trở nên dễ dàng hơn với sự hỗ trợ từ chúng tôi!"</p>
          </div>
        </motion.div>

        {/* Phần bên phải: Form đăng nhập */}
        <motion.div
          variants={formVariants} // Áp dụng hiệu ứng cho form
          initial="initial"
          animate="animate"
          className="signin-form-container"
        >
          <h2 className="signin-form-title">Đăng Nhập</h2>
          <div className="signin-form">
            <div className="signin-input-group">
              <label htmlFor="email" className="signin-label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={email} // Hiển thị email người dùng gõ
                onChange={(e) => setEmail(e.target.value)} // Cập nhật email khi gõ
                className={`signin-input ${errors.email ? 'signin-input-error' : ''}`} // Thêm viền đỏ nếu có lỗi
              />
              {errors.email && <p className="signin-error">{errors.email}</p>} {/* Hiển thị lỗi email */}
            </div>
            <div className="signin-input-group">
              <label htmlFor="password" className="signin-label">Mật khẩu</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'} // Hiển thị hoặc ẩn mật khẩu
                  placeholder="Nhập mật khẩu của bạn"
                  value={password} // Hiển thị mật khẩu người dùng gõ
                  onChange={(e) => setPassword(e.target.value)} // Cập nhật mật khẩu khi gõ
                  className={`signin-input ${errors.password ? 'signin-input-error' : ''}`} // Thêm viền đỏ nếu có lỗi
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
                        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                        fill="var(--text-primary)"
                      />
                    )}
                  </svg>
                </span>
              </div>
              {errors.password && <p className="signin-error">{errors.password}</p>} {/* Hiển thị lỗi mật khẩu */}
            </div>
            <button onClick={handleSubmit} className="signin-button">
              Đăng Nhập
            </button>
            <div className="signin-divider">
              <span>hoặc</span>
            </div>
            <button onClick={handleGmailLogin} className="signin-gmail-button">
              <svg
                className="gmail-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6H4C2.895 6 2 6.895 2 8V16C2 17.105 2.895 18 4 18H20C21.105 18 22 17.105 22 16V8C22 6.895 21.105 6 20 6ZM20 8L12 13L4 8V7L12 12L20 7V8Z"
                  fill="var(--text-primary)"
                />
              </svg>
              Đăng nhập với Gmail
            </button>
          </div>
          {/* Hiển thị popup thông báo lỗi hoặc thành công */}
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
          <div className="signin-links">
            <p>
              <Link to="/forgot-password" className="signin-link">
                Quên mật khẩu?
              </Link>
            </p>
            <p>
              Chưa có tài khoản?{' '}
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

export default SignIn; // Xuất component để dùng trong ứng dụng