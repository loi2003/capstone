import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllAllergyCategories,
  createAllergyCategory,
  updateAllergyCategory,
  deleteAllergyCategory,
  getAllAllergies,
} from "../../apis/nutriet-api";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/AllergyCategoryManagement.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Simple debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  return input.replace(
    /[<>"'&]/g,
    (match) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      }[match])
  );
};

// Search Icon
const SearchIcon = () => (
  <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Loader Icon
const LoaderIcon = () => (
  <svg
    className="icon loader"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    role="img"
    aria-label="Loading indicator"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414"
    />
  </svg>
);

// Notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="notification-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={
              type === "success"
                ? "M20 6L9 17L4 12"
                : "M12 12V8M12 16V16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            }
            stroke="var(--blue-white)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="notification-content">
        <h4>{type === "success" ? "Success" : "Error"}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const AllergyCategoryManagement = () => {
  const [allergyCategories, setAllergyCategories] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [formData, setFormData] = useState({
    allergyCategoryId: "",
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const [chartData, setChartData] = useState(null);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // UUID validation regex
  const isValidUUID = (id) => {
    if (!id) return false;
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    return uuidRegex.test(id);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 4) {
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
  }, [navigate]);

  // Fetch allergy categories
  const fetchAllergyCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAllergyCategories(token);
      console.log("Fetched allergy categories:", data);
      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid data format: Expected an array of allergy categories"
        );
      }
      data.forEach((category, index) => {
        if (!category.id || !isValidUUID(category.id)) {
          console.warn(
            `Invalid or missing ID for category at index ${index}:`,
            category
          );
        }
      });
      setAllergyCategories(data || []);
    } catch (error) {
      showNotification(
        `Failed to fetch allergy categories: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      console.error("Error fetching allergy categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch allergies
  const fetchAllergies = async () => {
    setIsLoading(true);
    try {
      const response = await getAllAllergies(token);
      console.log("Fetched allergies response:", response);
      const data = response.data?.data || response.data || [];
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: Expected an array of allergies");
      }
      data.forEach((allergy, index) => {
        if (!allergy.id || !isValidUUID(allergy.id)) {
          console.warn(
            `Invalid or missing ID for allergy at index ${index}:`,
            allergy
          );
        }
      });
      setAllergies(data);
    } catch (error) {
      showNotification(
        `Failed to fetch allergies: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      console.error("Error fetching allergies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data with theme-aware colors
  useEffect(() => {
    if (allergyCategories.length > 0 && allergies.length > 0) {
      const isDarkTheme =
        document.documentElement.classList.contains("dark-theme");
      const textColor = isDarkTheme ? "#ffffff" : "#0d47a1";
      const backgroundColor = isDarkTheme ? "#1a3c5e" : "#e3f2fd";

      setChartData({
        labels: allergyCategories.map((category) => category.name),
        datasets: [
          {
            label: "Number of Allergies",
            data: allergyCategories.map(
              (category) =>
                allergies.filter(
                  (allergy) => allergy.allergyCategoryId === category.id
                ).length
            ),
            backgroundColor: "#1e88e5", // --blue-primary
            borderColor: "#42a5f5", // --blue-secondary
            borderWidth: 1,
          },
        ],
      });

      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor, // --blue-text or --blue-white
              font: {
                family: "'Roboto', sans-serif",
              },
            },
          },
          title: {
            display: true,
            text: "Allergies by Category",
            color: textColor, // --blue-text or --blue-white
            font: {
              family: "'Roboto', sans-serif",
              size: 16,
              weight: "600",
            },
          },
          tooltip: {
            backgroundColor: "#e3f2fd", // --blue-light-bg
            titleColor: textColor, // --blue-text or --blue-white
            bodyColor: textColor, // --blue-text or --blue-white
            borderColor: "#42a5f5", // --blue-secondary
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Allergies",
              color: textColor, // --blue-text or --blue-white
              font: {
                family: "'Roboto', sans-serif",
                size: 14,
              },
            },
            ticks: {
              color: textColor, // --blue-text or --blue-white
            },
            grid: {
              color: "#90caf9", // --blue-accent
              borderColor: "#42a5f5", // --blue-secondary
            },
          },
          x: {
            title: {
              display: true,
              text: "Allergy Categories",
              color: textColor, // --blue-text or --blue-white
              font: {
                family: "'Roboto', sans-serif",
                size: 14,
              },
            },
            ticks: {
              color: textColor, // --blue-text or --blue-white
            },
            grid: {
              color: "#90caf9", // --blue-accent
              borderColor: "#42a5f5", // --blue-secondary
            },
          },
        },
        backgroundColor: backgroundColor, // --blue-light-bg or dark theme background
      });
    }
  }, [allergyCategories, allergies]);

  // Handle input changes with sanitization
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showNotification("Please fill in the name field", "error");
      return;
    }
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData = {
          id: formData.allergyCategoryId,
          name: formData.name,
          description: formData.description,
        };
        console.log("Updating allergy category with:", updateData);
        await updateAllergyCategory(updateData);
        showNotification("Allergy category updated successfully", "success");
      } else {
        await createAllergyCategory({
          name: formData.name,
          description: formData.description,
        });
        showNotification("Allergy category created successfully", "success");
      }
      resetForm();
      fetchAllergyCategories();
      fetchAllergies();
    } catch (error) {
      showNotification(
        `Failed to ${isEditing ? "update" : "create"} allergy category: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      console.error(
        `Error in ${isEditing ? "update" : "create"} allergy category:`,
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (allergyCategory) => {
    console.log("Editing allergy category:", allergyCategory);
    if (!allergyCategory.id || !isValidUUID(allergyCategory.id)) {
      showNotification("Invalid or missing category ID for editing", "error");
      console.error("Invalid or missing category ID:", allergyCategory.id);
      return;
    }
    setFormData({
      allergyCategoryId: allergyCategory.id,
      name: allergyCategory.name,
      description: allergyCategory.description || "",
    });
    setIsEditing(true);
  };

  // Handle delete
  const handleDelete = async (allergyCategoryId) => {
    if (!allergyCategoryId) {
      showNotification("Missing allergy category ID", "error");
      console.error("Missing allergyCategoryId");
      return;
    }
    if (!isValidUUID(allergyCategoryId)) {
      showNotification("Invalid allergy category ID format", "error");
      console.error("Invalid allergyCategoryId format:", allergyCategoryId);
      return;
    }
    if (
      window.confirm("Are you sure you want to delete this allergy category?")
    ) {
      setLoadingItems((prev) => ({ ...prev, [allergyCategoryId]: true }));
      try {
        console.log("Deleting allergy category with ID:", allergyCategoryId);
        await deleteAllergyCategory(allergyCategoryId);
        showNotification("Allergy category deleted successfully", "success");
        fetchAllergyCategories();
        fetchAllergies();
      } catch (error) {
        showNotification(
          `Failed to delete allergy category: ${
            error.response?.data?.message || error.message
          }`,
          "error"
        );
        console.error(
          "Error deleting allergy category:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingItems((prev) => ({ ...prev, [allergyCategoryId]: false }));
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
  };

  const handleHomepageNavigation = () => {
    setIsSidebarOpen(true);
    navigate("/nutrient-specialist");
  };

  // Reset form
  const resetForm = () => {
    setFormData({ allergyCategoryId: "", name: "", description: "" });
    setIsEditing(false);
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  // Close notification
  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  // Handle search with debouncing
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);
  const handleSearch = (e) => debouncedSearch(sanitizeInput(e.target.value));

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isNutrientDropdownOpen) setIsNutrientDropdownOpen(false);
    if (isFoodDropdownOpen) setIsFoodDropdownOpen(false);
  };

  // Toggle dropdowns
  const toggleNutrientDropdown = () => {
    setIsNutrientDropdownOpen((prev) => !prev);
  };

  const toggleFoodDropdown = () => {
    setIsFoodDropdownOpen((prev) => !prev);
  };

  // Pagination
  const filteredAllergyCategories = allergyCategories.filter(
    (allergyCategory) =>
      allergyCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedAllergyCategories = filteredAllergyCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAllergyCategories.length / itemsPerPage);

  // Handle window resize to toggle sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllergyCategories();
    fetchAllergies();
  }, []);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const sidebarVariants = {
    open: {
      width: "min(260px, 25vw)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "min(60px, 15vw)",
      transition: { duration: 0.3, ease: "easeIn" },
    },
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

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  // Chart options
  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#0d47a1", // --blue-text
          font: {
            family: "'Roboto', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: "Allergies by Category",
        color: "#0d47a1", // --blue-text
        font: {
          family: "'Roboto', sans-serif",
          size: 16,
          weight: "600",
        },
      },
      tooltip: {
        backgroundColor: "#e3f2fd", // --blue-light-bg
        titleColor: "#0d47a1", // --blue-text
        bodyColor: "#0d47a1", // --blue-text
        borderColor: "#42a5f5", // --blue-secondary
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Allergies",
          color: "#0d47a1", // --blue-text
          font: {
            family: "'Roboto', sans-serif",
            size: 14,
          },
        },
        ticks: {
          color: "#0d47a1", // --blue-text
        },
        grid: {
          color: "#90caf9", // --blue-accent
          borderColor: "#42a5f5", // --blue-secondary
        },
      },
      x: {
        title: {
          display: true,
          text: "Allergy Categories",
          color: "#0d47a1", // --blue-text
          font: {
            family: "'Roboto', sans-serif",
            size: 14,
          },
        },
        ticks: {
          color: "#0d47a1", // --blue-text
        },
        grid: {
          color: "#90caf9", // --blue-accent
          borderColor: "#42a5f5", // --blue-secondary
        },
      },
    },
    backgroundColor: "#e3f2fd", // --blue-light-bg
  });

  return (
    <motion.div
      className={`allergy-category-management ${
        isSidebarOpen ? "" : "sidebar-closed"
      }`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence>
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`nutrient-specialist-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link
            to="/nutrient-specialist"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Leaf icon for nutrient specialist panel"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--blue-secondary)"
                  stroke="var(--blue-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Nutrient Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--blue-white)"
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
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={handleHomepageNavigation}
                  title="Homepage"
                  aria-label="Navigate to homepage"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Home icon for homepage"
                  >
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12h6v10"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Homepage</span>}
                </button>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/blog-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Blog Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Blog icon for blog management"
                  >
                    <path
                      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Blog Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={
                    isFoodDropdownOpen
                      ? "Collapse food menu"
                      : "Expand food menu"
                  }
                  title="Food"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Food icon for food management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4l2 6-6 2 6 2 2-6-2-6z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Food</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isFoodDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--blue-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && !isFoodDropdownOpen ? "closed" : "open"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon for food category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--blue-secondary)"
                        stroke="var(--blue-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Food item icon for food management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--blue-accent)"
                        stroke="var(--blue-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={toggleNutrientDropdown}
                  className="nutrient-dropdown-toggle"
                  aria-label={
                    isNutrientDropdownOpen
                      ? "Collapse nutrient menu"
                      : "Expand nutrient menu"
                  }
                  title="Nutrient"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient icon for nutrient management"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isNutrientDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--blue-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isNutrientDropdownOpen
                            ? "M6 9l6 6 6-6"
                            : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="nutrient-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && !isNutrientDropdownOpen ? "closed" : "open"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/nutrient-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon for nutrient category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--blue-secondary)"
                        stroke="var(--blue-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/nutrient-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Nutrient item icon for nutrient management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--blue-accent)"
                        stroke="var(--blue-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-in-food-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient in Food Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient in food icon"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-3 2h6v2H9v-2zm0 4h6v2H9v-2z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/age-group-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Age Group Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Users icon for age group management"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-10a4 4 0 010-8m-6 4a4 4 0 11-8 0 4 4 0 018 0zm10 13v-2a4 4 0 00-3-3.87"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Age Group Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/dish-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Dish Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Plate icon for dish management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 8a4 4 0 014-4 4 4 0 014 4"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Dish Management</span>}
                </Link>
              </motion.div>
            </>
          )}
          {currentSidebarPage === 2 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/allergy-category-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Category Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Category icon for allergy category management"
                  >
                    <path
                      d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                      fill="var(--blue-secondary)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/allergy-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Allergy icon for allergy management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4m0 4v2"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Disease Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Medical icon for disease management"
                  >
                    <path
                      d="M19 7h-3V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H5a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h4a2 2 0 002-2v-3h3a2 2 0 002-2V9a2 2 0 00-2-2zm-7 10v3h-2v-3H7v-2h3V9h2v3h3v2h-3z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Disease Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/warning-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Warning Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for warning management"
                  >
                    <path
                      d="M12 2l10 20H2L12 2zm0 4v8m0 4v2"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Warning Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/meal-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Meal Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Meal icon for meal management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 4h8v2H8v-2zm0 4h8v2H8v-2z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Meal Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/energy-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Energy Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Energy icon for energy suggestion"
                  >
                    <path
                      d="M12 2l-6 9h4v7l6-9h-4V2zm-2 9h4m-4-7v3m4 3v3"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Energy Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient suggestion icon for nutrient suggestion"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4h4m-4 2v2"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/messenger-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Messenger Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Messenger icon for messenger management"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Messenger Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-policy"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Policy"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Document icon for nutrient policy"
                  >
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Policy</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-tutorial"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Tutorial"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Book icon for nutrient tutorial"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Tutorial</span>}
                </Link>
              </motion.div>
            </>
          )}
          <motion.div
            variants={navItemVariants}
            className="sidebar-nav-item page-switcher"
          >
            <button
              onClick={() => setCurrentSidebarPage(1)}
              className={currentSidebarPage === 1 ? "active" : ""}
              aria-label="Switch to sidebar page 1"
              title="<<"
            >
              {isSidebarOpen ? "<<" : "<<"}
            </button>
            <button
              onClick={() => setCurrentSidebarPage(2)}
              className={currentSidebarPage === 2 ? "active" : ""}
              aria-label="Switch to sidebar page 2"
              title=">>"
            >
              {isSidebarOpen ? ">>" : ">>"}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item nutrient-specialist-profile-section"
              >
                <Link
                  to="/profile"
                  className="nutrient-specialist-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--blue-white)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="nutrient-specialist-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--blue-logout)"
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
              className="sidebar-nav-item"
            >
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Login icon"
                >
                  <path
                    stroke="var(--blue-white)"
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

      {/* Main Content */}
      <motion.main
        className={`nutrient-specialist-content ${
          isSidebarOpen ? "" : "sidebar-closed"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <header className="management-header">
          <div>
            <h1>Allergy Category Management</h1>
            <p>Manage allergy categories for nutritional guidance.</p>
          </div>
        </header>
        <div className="management-container">
          <div className="form-chart-container">
            {/* Form Section */}
            <section className="form-section">
              <div className="section-header">
                <h2>
                  {isEditing
                    ? "Edit Allergy Category"
                    : "Create New Allergy Category"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="form-card">
                <div className="input-section">
                  <div className="form-group">
                    <label htmlFor="name">Category Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter category name"
                      className="input-field"
                      required
                      aria-label="Category name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter category description"
                      className="textarea-field"
                      rows="4"
                      aria-label="Category description"
                    />
                  </div>
                </div>
                <div className="button-section">
                  <motion.button
                    type="submit"
                    className="nutrient-specialist-button primary"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    aria-label={
                      isEditing
                        ? "Update allergy category"
                        : "Create allergy category"
                    }
                  >
                    {isLoading
                      ? "Loading..."
                      : isEditing
                      ? "Update Category"
                      : "Create Category"}
                  </motion.button>
                  {isEditing && (
                    <motion.button
                      type="button"
                      className="nutrient-specialist-button secondary"
                      onClick={resetForm}
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.05 }}
                      whileTap={{ scale: isLoading ? 1 : 0.95 }}
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </form>
            </section>

            {/* Chart Section */}
            <section className="chart-section">
              <div className="section-header">
                <h2>Allergies by Category</h2>
              </div>
              <div className="chart-container">
                {isLoading ? (
                  <div className="loading-state">
                    <LoaderIcon />
                    <p>Loading chart...</p>
                  </div>
                ) : allergies.length === 0 ? (
                  <div className="empty-chart-state">
                    <p>No allergy data available for chart</p>
                  </div>
                ) : chartData ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div className="loading-state">
                    <LoaderIcon />
                    <p>Loading chart...</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Allergy Category List Section */}
          <section className="category-list-section">
            <div className="section-header">
              <h2>All Allergy Categories</h2>
              <span className="category-count">
                {filteredAllergyCategories.length} Categories
              </span>
            </div>
            <div className="search-section">
              <SearchIcon />
              <input
                type="text"
                className="search-input"
                placeholder="Search all allergy categories..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search all allergy categories"
              />
            </div>
            {isLoading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading...</p>
              </div>
            ) : filteredAllergyCategories.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  role="img"
                  aria-label="Empty state icon"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                    stroke="var(--blue-text)"
                    strokeWidth="2"
                  />
                </svg>
                <h3>
                  {searchTerm
                    ? "No Matching Categories"
                    : "No Allergy Categories Found"}
                </h3>
                <p>
                  {searchTerm
                    ? "Try a different search term."
                    : "Add a new allergy category to get started."}
                </p>
              </div>
            ) : (
              <>
                <div className="category-grid">
                  {paginatedAllergyCategories.map((allergyCategory) => (
                    <motion.div
                      key={allergyCategory.id}
                      className="category-card"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                      whileHover={{ y: -5 }}
                    >
                      <div className="card-header">
                        <h3>{allergyCategory.name}</h3>
                      </div>
                      <div className="card-content">
                        <p className="card-description">
                          {allergyCategory.description ||
                            "No description available"}
                        </p>
                      </div>
                      <div className="card-divider"></div>
                      <div className="card-actions">
                        <motion.button
                          className="nutrient-specialist-button primary"
                          onClick={() => handleEdit(allergyCategory)}
                          disabled={loadingItems[allergyCategory.id]}
                          whileHover={{
                            scale: loadingItems[allergyCategory.id] ? 1 : 1.05,
                          }}
                          whileTap={{
                            scale: loadingItems[allergyCategory.id] ? 1 : 0.95,
                          }}
                          aria-label="Edit allergy category"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          className="nutrient-specialist-button secondary"
                          onClick={() => handleDelete(allergyCategory.id)}
                          disabled={loadingItems[allergyCategory.id]}
                          whileHover={{
                            scale: loadingItems[allergyCategory.id] ? 1 : 1.05,
                          }}
                          whileTap={{
                            scale: loadingItems[allergyCategory.id] ? 1 : 0.95,
                          }}
                          aria-label="Delete allergy category"
                        >
                          {loadingItems[allergyCategory.id]
                            ? "Deleting..."
                            : "Delete"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <motion.button
                    className="nutrient-specialist-button secondary"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                    whileHover={{
                      scale: currentPage === 1 || isLoading ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: currentPage === 1 || isLoading ? 1 : 0.95,
                    }}
                    aria-label="Previous page"
                  >
                    Previous
                  </motion.button>
                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  <motion.button
                    className="nutrient-specialist-button secondary"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || isLoading}
                    whileHover={{
                      scale: currentPage === totalPages || isLoading ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: currentPage === totalPages || isLoading ? 1 : 0.95,
                    }}
                    aria-label="Next page"
                  >
                    Next
                  </motion.button>
                </div>
              </>
            )}
          </section>
        </div>
      </motion.main>
    </motion.div>
  );
};

export default AllergyCategoryManagement;