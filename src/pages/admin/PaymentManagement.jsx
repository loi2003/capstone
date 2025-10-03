import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import {
  getMonthlyRevenue,
  getQuarterlyRevenue,
  getYearlyRevenue,
  getPaymentDashboardByYear,
  getPaymentHistory,
} from "../../apis/paymentmanagement-api";
import Chart from "chart.js/auto";
import "../../styles/PaymentManagement.css";

const PaymentManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // Default to descending (newest first)
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Refs to store chart instances
  const chartRefs = useRef({
    monthlyRevenueChart: null,
    quarterlyRevenueChart: null,
    yearlyRevenueChart: null,
    userSubscriptionChart: null,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && userData.roleId === 1) {
          setUser(userData);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    };
    fetchUser();
  }, [navigate, token]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const params = { year };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (status) params.status = status;
        if (searchEmail) params.userEmail = searchEmail;

        const [monthly, quarterly, yearly, dashboard, history] = await Promise.all([
          getMonthlyRevenue(year),
          getQuarterlyRevenue(year),
          getYearlyRevenue(),
          getPaymentDashboardByYear(year),
          getPaymentHistory(params),
        ]);
        // Sort history by createdAt based on sortOrder
        const sortedHistory = [...history].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });
        setMonthlyData(monthly);
        setQuarterlyData(quarterly);
        setYearlyData(yearly);
        setDashboardData(dashboard);
        setPaymentHistory(sortedHistory);
        setCurrentPage(1); // Reset to first page when filters or sort change
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };
    fetchPaymentData();
  }, [year, fromDate, toDate, status, searchEmail, sortOrder]);

  useEffect(() => {
    const destroyChart = (chartId) => {
      if (chartRefs.current[chartId]) {
        chartRefs.current[chartId].destroy();
        chartRefs.current[chartId] = null;
      }
    };

    // Monthly Revenue Chart
    const monthlyCtx = document.getElementById("monthlyRevenueChart")?.getContext("2d");
    if (monthlyCtx) {
      destroyChart("monthlyRevenueChart");
      chartRefs.current.monthlyRevenueChart = new Chart(monthlyCtx, {
        type: "bar",
        data: {
          labels: monthlyData.map((item) => `Month ${item.period.value}`),
          datasets: [
            {
              label: "Revenue ($)",
              data: monthlyData.map((item) => item.totalRevenue),
              backgroundColor: "rgba(32, 218, 204, 0.6)",
              borderColor: "var(--admin-accent)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
            x: { title: { display: true, text: "Month" } },
          },
          plugins: { legend: { display: true } },
        },
      });
    }

    // Quarterly Revenue Chart
    const quarterlyCtx = document.getElementById("quarterlyRevenueChart")?.getContext("2d");
    if (quarterlyCtx) {
      destroyChart("quarterlyRevenueChart");
      chartRefs.current.quarterlyRevenueChart = new Chart(quarterlyCtx, {
        type: "bar",
        data: {
          labels: quarterlyData.map((item) => `Q${item.period.value}`),
          datasets: [
            {
              label: "Revenue ($)",
              data: quarterlyData.map((item) => item.totalRevenue),
              backgroundColor: "rgba(26, 163, 171, 0.6)",
              borderColor: "var(--admin-secondary)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
            x: { title: { display: true, text: "Quarter" } },
          },
          plugins: { legend: { display: true } },
        },
      });
    }

    // Yearly Revenue Chart
    const yearlyCtx = document.getElementById("yearlyRevenueChart")?.getContext("2d");
    if (yearlyCtx) {
      destroyChart("yearlyRevenueChart");
      chartRefs.current.yearlyRevenueChart = new Chart(yearlyCtx, {
        type: "line",
        data: {
          labels: yearlyData.map((item) => item.period.year),
          datasets: [
            {
              label: "Revenue ($)",
              data: yearlyData.map((item) => item.totalRevenue),
              borderColor: "var(--admin-primary)",
              backgroundColor: "rgba(20, 111, 137, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Revenue ($)" } },
            x: { title: { display: true, text: "Year" } },
          },
          plugins: { legend: { display: true } },
        },
      });
    }

    // User Subscription Statistics Chart
    const userStatsCtx = document.getElementById("userSubscriptionChart")?.getContext("2d");
    if (userStatsCtx && dashboardData?.userSubscriptionStatistics) {
      destroyChart("userSubscriptionChart");
      chartRefs.current.userSubscriptionChart = new Chart(userStatsCtx, {
        type: "bar",
        data: {
          labels: dashboardData.userSubscriptionStatistics.map((item) => `Month ${item.period.value}`),
          datasets: [
            {
              label: "Active Users",
              data: dashboardData.userSubscriptionStatistics.map((item) => item.activeCount),
              backgroundColor: "rgba(32, 218, 204, 0.6)",
            },
            {
              label: "Expired Users",
              data: dashboardData.userSubscriptionStatistics.map((item) => item.expiredCount),
              backgroundColor: "rgba(229, 62, 62, 0.6)",
            },
            {
              label: "Canceled Users",
              data: dashboardData.userSubscriptionStatistics.map((item) => item.canceledCount),
              backgroundColor: "rgba(95, 120, 138, 0.6)",
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "User Count" } },
            x: { title: { display: true, text: "Month" } },
          },
          plugins: { legend: { display: true } },
        },
      });
    }

    return () => {
      destroyChart("monthlyRevenueChart");
      destroyChart("quarterlyRevenueChart");
      destroyChart("yearlyRevenueChart");
      destroyChart("userSubscriptionChart");
    };
  }, [monthlyData, quarterlyData, yearlyData, dashboardData]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.id) await logout(user.id);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(window.innerWidth > 768);
      navigate("/signin", { replace: true });
    }
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const sidebarVariants = {
    open: {
      width: "240px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "56px",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  // Calculate summary data for cards
  const monthlySummary = monthlyData.reduce((acc, item) => acc + item.totalRevenue, 0);
  const quarterlySummary = quarterlyData.reduce((acc, item) => acc + item.totalRevenue, 0);
  const yearlySummary = yearlyData.find((item) => item.period.year === year)?.totalRevenue || 0;
  const subscriptionSummary = dashboardData?.userSubscriptionStatistics?.reduce(
    (acc, item) => ({
      active: acc.active + item.activeCount,
      expired: acc.expired + item.expiredCount,
      canceled: acc.canceled + item.canceledCount,
    }),
    { active: 0, expired: 0, canceled: 0 }
  ) || { active: 0, expired: 0, canceled: 0 };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount for display
  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2); // Assuming amount is in cents
  };

  // Pagination logic
  const totalPages = Math.ceil(paymentHistory.length / recordsPerPage);
  const paginatedHistory = paymentHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="payment-management">
      <motion.aside
        className="payment-management__sidebar"
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="payment-management__sidebar-header">
          <Link
            to="/admin"
            className="payment-management__logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="payment-management__logo-svg-container"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Admin icon for admin panel"
              >
                <path
                  d="M3 9h18M9 3v18M3 15h18M6 12h12M12 3v18"
                  fill="var(--admin-accent)"
                  stroke="var(--admin-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Admin Panel</span>}
          </Link>
          <motion.button
            className="payment-management__sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--admin-background)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? "M13 18L7 12L13 6M18 18L12 12L18 6"
                    : "M6 18L12 12L6 6M11 18L17 12L11 6"
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="payment-management__sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/categories"
              onClick={() => setIsSidebarOpen(true)}
              title="Blog Categories"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10m-10 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Blog Categories</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/tutorial"
              onClick={() => setIsSidebarOpen(true)}
              title="Tutorial Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-6-6h12"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial Management</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/policy"
              onClick={() => setIsSidebarOpen(true)}
              title="Admin Policy"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v20m-8-4h16M4 6h16"
                />
              </svg>
              {isSidebarOpen && <span>Admin Policy</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/account-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Account Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                />
              </svg>
              {isSidebarOpen && <span>Account Management</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/system-configuration"
              onClick={() => setIsSidebarOpen(true)}
              title="System Configuration"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 0v-6m0 18v-6m6 0h6m-18 0H3"
                />
              </svg>
              {isSidebarOpen && <span>System Configuration</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="payment-management__sidebar-nav-item"
          >
            <Link
              to="/admin/payment-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Payment Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18v12H3zm4 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Payment Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="payment-management__sidebar-nav-item payment-management__admin-profile-section"
              >
                <Link
                  to="/profile"
                  className="payment-management__admin-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--admin-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="payment-management__admin-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="payment-management__sidebar-nav-item"
              >
                <button
                  className="payment-management__logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="var(--admin-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={navItemVariants}
              className="payment-management__sidebar-nav-item"
            >
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <main className={`payment-management__content ${isSidebarOpen ? "" : "closed"}`}>
        <motion.section
          className="payment-management__dashboard"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="payment-management__dashboard-header">
            <h1 className="payment-management__dashboard-title">Payment Dashboard</h1>
            <div className="payment-management__year-selector">
              <label htmlFor="year">Select Year: </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {[...Array(10)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>
          <motion.div className="payment-management__summary-grid" variants={containerVariants}>
            <motion.div variants={cardVariants} className="payment-management__summary-card">
              <div className="payment-management__summary-icon payment-management__summary-icon--light-blue">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#124966"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 1v22M8 7h8a2 2 0 0 1 0 4H8a2 2 0 1 1 0-4zm0 6h8a2 2 0 0 1 0 4H8a2 2 0 1 1 0-4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="payment-management__summary-content">
                <h3>Monthly Revenue Summary</h3>
                <p>Total Revenue: ${monthlySummary.toFixed(2)}</p>
                <p>Months: {monthlyData.length}</p>
                <p>Average Monthly: ${(monthlySummary / (monthlyData.length || 1)).toFixed(2)}</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} className="payment-management__summary-card">
              <div className="payment-management__summary-icon payment-management__summary-icon--green">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#124966"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2v6m0 4v10m-6-6h12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="payment-management__summary-content">
                <h3>Quarterly Revenue Summary</h3>
                <p>Total Revenue: ${quarterlySummary.toFixed(2)}</p>
                <p>Quarters: {quarterlyData.length}</p>
                <p>Average Quarterly: ${(quarterlySummary / (quarterlyData.length || 1)).toFixed(2)}</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} className="payment-management__summary-card">
              <div className="payment-management__summary-icon payment-management__summary-icon--red">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#124966"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h8m-6 6h4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="payment-management__summary-content">
                <h3>Yearly Revenue Summary</h3>
                <p>Selected Year: {year}</p>
                <p>Total Revenue: ${yearlySummary.toFixed(2)}</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} className="payment-management__summary-card">
              <div className="payment-management__summary-icon payment-management__summary-icon--purple">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#124966"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 6c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="payment-management__summary-content">
                <h3>Subscription Statistics</h3>
                <p>Active Users: {subscriptionSummary.active}</p>
                <p>Expired Users: {subscriptionSummary.expired}</p>
                <p>Canceled Users: {subscriptionSummary.canceled}</p>
              </div>
            </motion.div>
          </motion.div>
          <div className="payment-management__charts-grid">
            <motion.div
              variants={cardVariants}
              className="payment-management__chart-card payment-management__chart-card--full"
            >
              <h3>Monthly Revenue</h3>
              <canvas id="monthlyRevenueChart" />
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="payment-management__chart-card payment-management__chart-card--full"
            >
              <h3>Yearly Revenue</h3>
              <canvas id="yearlyRevenueChart" />
            </motion.div>
            <div className="payment-management__charts-row">
              <motion.div variants={cardVariants} className="payment-management__chart-card">
                <h3>Quarterly Revenue</h3>
                <canvas id="quarterlyRevenueChart" />
              </motion.div>
              <motion.div variants={cardVariants} className="payment-management__chart-card">
                <h3>User Subscription Statistics</h3>
                <canvas id="userSubscriptionChart" />
              </motion.div>
            </div>
          </div>
          <motion.div
            variants={cardVariants}
            className="payment-management__history-card payment-management__chart-card--full"
          >
            <h3>Payment History</h3>
            <div className="payment-management__history-filter">
              <div className="payment-management__filter-group">
                <input
                  type="text"
                  id="searchEmail"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Search by User Email"
                  className="payment-management__history-input payment-management__search-input"
                />
                <svg
                  className="payment-management__search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
                    stroke="var(--admin-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="payment-management__filter-group">
                <label htmlFor="fromDate">From Date: </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="payment-management__history-input"
                />
              </div>
              <div className="payment-management__filter-group">
                <label htmlFor="toDate">To Date: </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="payment-management__history-input"
                />
              </div>
              <div className="payment-management__filter-group">
                <label htmlFor="status">Status: </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="payment-management__history-input"
                >
                  <option value="">All</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="payment-management__filter-group">
                <label htmlFor="sortOrder">Sort by Date: </label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="payment-management__history-input"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="payment-management__history-table-wrapper">
              <table className="payment-management__history-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>User Email</th>
                    <th>Subscription Plan</th>
                    <th>Amount ($)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.length > 0 ? (
                    paginatedHistory.map((payment) => (
                      <tr key={payment.paymentId}>
                        <td>{payment.paymentId}</td>
                        <td>{payment.userEmail}</td>
                        <td>{payment.subscriptionPlan}</td>
                        <td>${formatAmount(payment.amount)}</td>
                        <td
                          className={`payment-management__history-status payment-management__history-status--${payment.status.toLowerCase()}`}
                        >
                          {payment.status}
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No payment history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="payment-management__pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="payment-management__pagination-button payment-management__pagination-button--nav"
                    aria-label="Previous page"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`payment-management__pagination-button payment-management__pagination-button--dot ${
                        currentPage === index + 1
                          ? "payment-management__pagination-button--active"
                          : ""
                      }`}
                      aria-label={`Page ${index + 1}`}
                      aria-current={currentPage === index + 1 ? "page" : undefined}
                    >
                      <span className="payment-management__pagination-dot"></span>
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="payment-management__pagination-button payment-management__pagination-button--nav"
                    aria-label="Next page"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
};

export default PaymentManagement;
