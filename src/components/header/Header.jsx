import React, { useState, useEffect } from "react"; // Thư viện React và hook để quản lý trạng thái, hiệu ứng
import { Link, useNavigate } from "react-router-dom"; // Link để tạo liên kết, useNavigate để chuyển hướng
import { getCurrentUser } from "../../apis/authentication-api"; // Hàm gọi API lấy thông tin người dùng
import apiClient from "../../apis/url-api"; // Công cụ gửi yêu cầu HTTP đến máy chủ
import "./Header.css"; // Tệp CSS định dạng header

// Component Header: Thanh điều hướng trên cùng của trang web
const Header = () => {
  // Trạng thái để kiểm soát menu trên mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Trạng thái để kiểm soát dropdown của biểu tượng người dùng
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Trạng thái lưu thông tin người dùng (đã đăng nhập hay chưa)
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Hàm chuyển hướng trang
  const token = localStorage.getItem("token");
  // Kiểm tra trạng thái đăng nhập khi component tải
  useEffect(() => {
    // Hàm lấy thông tin người dùng từ API
    const fetchUser = async () => {
      // Kiểm tra xem có token trong localStorage không

      if (token) {
        try {
          // Gọi API để lấy thông tin người dùng
          const response = await getCurrentUser(token);
          console.log("data: ", response);
          
          // Kiểm tra cấu trúc dữ liệu trả về
          const userData = response.data?.data;
          if (userData && userData.roleId === 2) {
            // Chỉ hiển thị user icon cho roleId: 2
            setUser(userData);
            console.log("Thông tin người dùng:", userData);
          } else {
            console.warn(
              "Người dùng không có roleId: 2 hoặc dữ liệu không hợp lệ:",
              userData
            );
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error.message);
          // Nếu token không hợp lệ, xóa token và đặt user là null
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        console.log("Không tìm thấy token trong localStorage");
      }
    };
    fetchUser(); // Gọi hàm khi component tải
  }, []); // Chỉ chạy một lần khi component được tạo

  // Hàm mở/đóng menu trên mobile
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Đổi trạng thái menu
    if (isDropdownOpen) setIsDropdownOpen(false); // Đóng dropdown nếu đang mở
  };

  // Hàm mở/đóng dropdown của biểu tượng người dùng
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Đổi trạng thái dropdown
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    if (!user?.userId) {
      // console.error('Không tìm thấy userId để đăng xuất');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/signin', { replace: true });
      return;
    }

    try {
      // Gọi API đăng xuất với userId trong body (thử cả hai định dạng)
      console.log('Gửi yêu cầu logout với userId:', user.userId);
      await apiClient.post('/api/auth/user/logout', user.userId, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Đăng xuất thành công');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error.message);
    } finally {
      // Xóa token khỏi localStorage
      localStorage.removeItem('token');
      // Đặt user về null để cập nhật giao diện
      setUser(null);
      // Đóng dropdown và menu
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      // Chuyển hướng về trang đăng nhập
      navigate('/signin', { replace: true });
    }
  };

  // Giao diện thanh header
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo liên kết về trang chủ */}
        <Link to="/" className="logo">
          NestlyCare
        </Link>
        {/* Nút mở/đóng menu trên mobile */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span className="menu-icon"></span>
        </button>
        {/* Menu điều hướng */}
        <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link to="/about">About</Link>
          <Link to="/pregnancy-tracking">Pregnancy Tracking</Link>
          <Link to="/nutritional-guidance">Nutritional Guidance</Link>
          <Link to="/consultation">Consultation</Link>
          <Link to="/community">Community</Link>
          <Link to="/donation">Donation</Link>
          {/* Phần xác thực: Hiển thị nút Sign In hoặc user icon */}
          <div className="auth-section">
            {user ? (
              // Nếu đã đăng nhập, hiển thị biểu tượng người dùng
              <div className="profile-section">
                <button
                  className="profile-toggle"
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--white)"
                    />
                  </svg>
                </button>
                {/* Dropdown khi nhấn vào user icon */}
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <span className="profile-email">
                      {user.email || "Người dùng"}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Nếu chưa đăng nhập, hiển thị nút Sign In và Sign Up
              <>
                <Link to="/signin" className="sign-in-btn">
                  Sign In
                </Link>
                <p className="auth-message">
                  Chưa có tài khoản? <Link to="/signup">Đăng ký tại đây</Link>.
                </p>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; // Xuất component để dùng trong ứng dụng
