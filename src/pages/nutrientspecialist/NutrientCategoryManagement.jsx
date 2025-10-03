import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllNutrientCategories,
  getNutrientCategoryById,
  createNutrientCategory,
  updateNutrientCategory,
  deleteNutrientCategory,
  getAllNutrients,
} from "../../apis/nutriet-api";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/NutrientCategoryManagement.css";

// SVG Icons
const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Notification Component
const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent("closeNotification"));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="notification-content">
        <h4>{type === "success" ? "Success" : "Error"}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const NutrientCategoryManagement = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(true);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const categoriesPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [currentSidebarPage, setCurrentSidebarPage] = useState(1);

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  // Validate inputs
  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z0-9\s.,'-]+$/; // Letters, numbers, spaces, basic punctuation
    const descRegex = /^[a-zA-Z0-9\s.,'-]*$/; // Same as name, but optional
    const spaceThenLetterRegex = /\s+[a-zA-Z]/; // Detects space followed by a letter

    // Category name validations
    if (!newCategory.name.trim()) {
      showNotification("Category name is required", "error");
      return false;
    }
    if (newCategory.name.trim().length <= 2) {
      showNotification("Category name must be more than 2 letters", "error");
      return false;
    }
    if (newCategory.name.length > 50) {
      showNotification("Category name must be 50 characters or less", "error");
      return false;
    }
    if (!nameRegex.test(newCategory.name.trim())) {
      showNotification("Category name contains invalid characters", "error");
      return false;
    }
   

    // Description validations
    if (!newCategory.description.trim()) {
      showNotification("Description is required when category name is provided", "error");
      return false;
    }
    if (newCategory.description.trim().split(/\s+/).filter(word => word.length > 0).length <= 1) {
      showNotification("Description must contain more than one word", "error");
      return false;
    }
    if (newCategory.description.length > 500) {
      showNotification("Description must be 500 characters or less", "error");
      return false;
    }
    if (newCategory.description && !descRegex.test(newCategory.description)) {
      showNotification("Description contains invalid characters", "error");
      return false;
    }
    
    return true;
  };

  // Fetch user, categories, and nutrients
  const fetchData = async () => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const [userResponse, categoriesData, nutrientsData] = await Promise.all([
        getCurrentUser(token),
        getAllNutrientCategories(),
        getAllNutrients(),
      ]);
      console.log("Categories:", categoriesData);
      console.log("Nutrients:", nutrientsData);
      const userData = userResponse.data?.data || userResponse.data;
      if (userData && Number(userData.roleId) === 4) {
        setUser(userData);
        setNutrients(nutrientsData);
        const enrichedCategories = categoriesData.map((category) => ({
          ...category,
          nutrientCount: nutrientsData.filter(
            (nutrient) => nutrient.nutrientCategoryId === category.id
          ).length,
        }));
        setCategories(enrichedCategories);
        setFilteredCategories(enrichedCategories);
        setCurrentPage(1);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch category by ID
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const data = await getNutrientCategoryById(id);
      setSelectedCategory(data);
      setNewCategory({ name: data.name, description: data.description });
      setIsEditing(true);
    } catch (err) {
      showNotification(`Failed to fetch category: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async () => {
    if (!validateInputs()) {
      return;
    }
    if (
      categories.some(
        (cat) =>
          cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
      )
    ) {
      showNotification("Duplicate category name", "error");
      return;
    }
    setLoading(true);
    try {
      await createNutrientCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
      });
      setNewCategory({ name: "", description: "" });
      await fetchData();
      showNotification("Category created successfully", "success");
    } catch (err) {
      showNotification(`Failed to create category: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async () => {
    if (!validateInputs()) {
      return;
    }
    if (
      categories.some(
        (cat) =>
          cat.name.toLowerCase() === newCategory.name.trim().toLowerCase() &&
          cat.id !== selectedCategory.id
      )
    ) {
      showNotification("Duplicate category name", "error");
      return;
    }
    setLoading(true);
    try {
      await updateNutrientCategory({
        nutrientCategoryId: selectedCategory.id,
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
      });
      setNewCategory({ name: "", description: "" });
      setSelectedCategory(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Category updated successfully", "success");
    } catch (err) {
      showNotification(`Failed to update category: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    const category = categories.find((cat) => cat.id === id);
    if (category.nutrientCount > 0) {
      showNotification(
        "Cannot delete category: It contains nutrients. Please reassign or delete the nutrients first.",
        "error"
      );
      return;
    }
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true);
      try {
        await deleteNutrientCategory(id);
        await fetchData();
        showNotification("Category deleted successfully", "success");
      } catch (err) {
        showNotification(`Failed to delete category: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = categories.filter((category) =>
      category.name?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setNewCategory({ name: "", description: "" });
  };

  // Pagination
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  // Handle homepage navigation
  const handleHomepageNavigation = () => {
    setIsSidebarOpen(true);
    navigate("/nutrient-specialist");
  };

  // Toggle dropdowns
  const toggleNutrientDropdown = () => {
    setIsNutrientDropdownOpen((prev) => !prev);
  };

  const toggleFoodDropdown = () => {
    setIsFoodDropdownOpen((prev) => !prev);
  };

  // Initialize data
  useEffect(() => {
    fetchData();
  }, []);

  // Sidebar animation variants
  const sidebarVariants = {
    open: {
      width: "min(280px, 25vw)",
      transition: { duration: 0.3, ease: "easeOut", when: "beforeChildren" },
    },
    closed: {
      width: "min(60px, 15vw)",
      transition: { duration: 0.3, ease: "easeIn", when: "beforeChildren" },
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

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      backgroundColor: "#2e7d32",
      transform: "translateY(-2px)",
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

  // Handle window resize to toggle sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="nutrient-category-management">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
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
        initial="open"
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
                  fill="var(--nutrient-specialist-highlight)"
                  stroke="var(--nutrient-specialist-primary)"
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
                stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12h6v10"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                        stroke="var(--nutrient-specialist-white)"
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
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
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
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                        stroke="var(--nutrient-specialist-white)"
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
                initial="open"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item active"
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
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
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
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Plate icon for dish management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 8a4 4 0 014-4 4 4 0 014 4"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-secondary)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      fill="var(--nutrient-specialist-white)"
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
                      stroke="var(--nutrient-specialist-logout)"
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
              whileHover="hover"
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
                    stroke="var(--nutrient-specialist-white)"
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
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>Nutrient Category Management</h1>
            <p>
              Create, edit, and manage nutrient categories for better
              organization
            </p>
          </div>
        </div>
        <div className="management-container">
          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Category" : "Create New Category"}</h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Vitamins"
                  className="input-field"
                  aria-label="Category name"
                />
                <label htmlFor="category-description">Description</label>
                <textarea
                  id="category-description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Essential nutrients for baby growth"
                  className="textarea-field"
                  rows="4"
                  aria-label="Category description"
                />
                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateCategory : createCategory}
                    disabled={loading}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    aria-label={
                      isEditing ? "Update category" : "Create category"
                    }
                  >
                    {loading
                      ? "Loading..."
                      : isEditing
                      ? "Update Category"
                      : "Create Category"}
                  </motion.button>
                  {isEditing && (
                    <motion.button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="cancel-button nutrient-specialist-button secondary"
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Category List Section */}
          <div className="category-list-section">
            <div className="section-header">
              <h2>All Nutrient Categories</h2>
              <div className="category-count">
                {filteredCategories.length}{" "}
                {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                found
              </div>
            </div>
            <div className="search-section">
              <SearchIcon />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search categories..."
                className="search-input"
                aria-label="Search categories"
              />
            </div>
            {loading ? (
              <div className="loading-state">
                <p>Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--nutrient-specialist-text)"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3>No categories found</h3>
                <p>Create your first nutrient category to get started</p>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm("")}
                    className="clear-search-button nutrient-specialist-button secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Clear search"
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="category-grid">
                  {currentCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      className="category-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="card-header">
                        <h3>{category.name}</h3>
                        <div className="nutrient-badge">
                          {category.nutrientCount || 0} nutrients
                        </div>
                      </div>
                      <p className="card-description">
                        {category.description || "No description provided"}
                      </p>
                      <div className="card-actions">
                        <motion.button
                          onClick={() => fetchCategoryById(category.id)}
                          className="edit-button nutrient-specialist-button primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Edit category"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => deleteCategory(category.id)}
                          className="delete-button nutrient-specialist-button secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Delete category"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {filteredCategories.length > categoriesPerPage && (
                  <div className="pagination-controls">
                    <motion.button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="pagination-button prev nutrient-specialist-button secondary"
                      whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                      whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                      aria-label="Previous page"
                    >
                      Previous
                    </motion.button>
                    <div className="page-indicator">
                      Page {currentPage} of {totalPages}
                    </div>
                    <motion.button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="pagination-button next nutrient-specialist-button secondary"
                      whileHover={{
                        scale: currentPage === totalPages ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: currentPage === totalPages ? 1 : 0.95,
                      }}
                      aria-label="Next page"
                    >
                      Next
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default NutrientCategoryManagement;