import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  getAllFoodCategories,
  getFoodCategoryById,
  createFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
  getAllFoods,
} from "../../apis/nutriet-api";
import { getCurrentUser } from "../../apis/authentication-api";
import "../../styles/FoodCategoryManagement.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const LoaderIcon = () => (
  <svg
    className="icon loader"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414"
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

const FoodCategoryManagement = () => {
  const [user, setUser] = useState(null);
  const [foodCategories, setFoodCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [foodCounts, setFoodCounts] = useState([]);
  const categoriesPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  // Fetch user, food categories, and food counts
  const fetchData = async () => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const [userResponse, categoriesData, foodsDataResponse] = await Promise.all([
        getCurrentUser(token),
        getAllFoodCategories(),
        getAllFoods(),
      ]);
      const userData = userResponse.data?.data || userResponse.data;
      if (userData && Number(userData.roleId) === 4) {
        setUser(userData);

        // Normalize categories data
        const normalizedCategories = categoriesData.map(category => ({
          id: category.id || category.Id,
          name: category.name,
          description: category.description,
        }));
        setFoodCategories(normalizedCategories);
        setFilteredCategories(normalizedCategories);
        setCurrentPage(1);

        // Normalize foods data
        const foodsData = foodsDataResponse.data || foodsDataResponse;
        console.log("Foods data:", foodsData);

        // Calculate food counts per category
        const counts = normalizedCategories.map((category) => {
          const count = foodsData.filter(
            (food) => {
              const matches = food.foodCategoryId === category.id;
              console.log(`Category: ${category.name}, Food ID: ${food.id}, Matches: ${matches}`);
              return matches;
            }
          ).length;
          return { categoryId: category.id, count };
        });
        console.log("Food counts:", counts);
        setFoodCounts(counts);
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

  const fetchCategoryById = async (id) => {
    if (!id) {
      showNotification("Invalid category ID", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await getFoodCategoryById(id);
      let categoryData = response.data || response;

      if (!categoryData) {
        throw new Error("No data received from server (possible category not found)");
      }

      const normalizedData = {
        id: categoryData.id || categoryData.Id || "",
        name: categoryData.name || "",
        description: categoryData.description || "",
      };

      if (!normalizedData.id || !normalizedData.name) {
        throw new Error("Invalid category data structure (missing id or name)");
      }

      setSelectedCategory(normalizedData);
      setNewCategory({
        name: normalizedData.name,
        description: normalizedData.description,
      });
      setIsEditing(true);
    } catch (err) {
      console.error("Error fetching category:", {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      showNotification(`Failed to fetch category details: ${err.message}`, "error");
      setSelectedCategory(null);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const createCategoryHandler = async () => {
    if (!newCategory.name?.trim()) {
      showNotification("Category name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const trimmedName = newCategory.name.trim();
      const isDuplicate = foodCategories.some(
        (category) =>
          category.name === trimmedName ||
          category.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        showNotification("Category name already exists", "error");
        return;
      }

      await createFoodCategory({
        name: trimmedName,
        description: newCategory.description?.trim() || "",
      });
      setNewCategory({ name: "", description: "" });
      setIsEditing(false);
      await fetchData();
      showNotification("Food category created successfully", "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create category";
      showNotification(`Failed to create category: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryHandler = async () => {
    if (!newCategory.name?.trim()) {
      showNotification("Category name is required", "error");
      return;
    }
    if (!selectedCategory?.id) {
      showNotification("No category selected for update", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await updateFoodCategory({
        id: selectedCategory.id,
        name: newCategory.name.trim(),
        description: newCategory.description?.trim() || "",
      });

      if (response && response.data) {
        showNotification("Food category updated successfully", "success");
        setNewCategory({ name: "", description: "" });
        setSelectedCategory(null);
        setIsEditing(false);
        await fetchData();
      } else {
        throw new Error("Update failed - no response data");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showNotification(`Failed to update category: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true);
      try {
        await deleteFoodCategory(id);
        await fetchData();
        showNotification("Food category deleted successfully", "success");
      } catch (err) {
        showNotification(`Failed to delete category: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = foodCategories.filter((category) =>
      category.name?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  const cancelEdit = () => {
    setNewCategory({ name: "", description: "" });
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Chart data
  const chartData = {
    labels: foodCategories.map((category) => category.name),
    datasets: [
      {
        label: "Number of Foods",
        data: foodCategories.map(
          (category) =>
            foodCounts.find((count) => count.categoryId === category.id)?.count || 0
        ),
        backgroundColor: "rgba(30, 136, 229, 0.6)",
        borderColor: "rgba(30, 136, 229, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains("dark-theme")
            ? "#ffffff"
            : "#0d47a1",
        },
      },
      title: {
        display: true,
        text: "Number of Foods per Category",
        color: document.documentElement.classList.contains("dark-theme")
          ? "#ffffff"
          : "#0d47a1",
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains("dark-theme")
          ? "#2a4b6e"
          : "#ffffff",
        titleColor: document.documentElement.classList.contains("dark-theme")
          ? "#ffffff"
          : "#0d47a1",
        bodyColor: document.documentElement.classList.contains("dark-theme")
          ? "#ffffff"
          : "#0d47a1",
      },
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains("dark-theme")
            ? "#ffffff"
            : "#0d47a1",
        },
        grid: {
          color: document.documentElement.classList.contains("dark-theme")
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: document.documentElement.classList.contains("dark-theme")
            ? "#ffffff"
            : "#0d47a1",
          stepSize: 1,
        },
        grid: {
          color: document.documentElement.classList.contains("dark-theme")
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        },
      },
    },
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

  return (
    <div className="food-category-management">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`nutrient-specialist-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link to="/nutrient-specialist" className="logo">
            <motion.div className="logo-svg-container">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Leaf icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--nutrient-specialist-secondary)"
                  stroke="var(--nutrient-specialist-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Nutrient Panel</span>}
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
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist" title="Dashboard">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Dashboard icon"
              >
                <path
                  d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
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
                aria-label="Folder icon for food category management"
              >
                <path
                  d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
                  fill="var(--nutrient-specialist-secondary)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Category Management</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item">
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
                aria-label="Apple icon for food management"
              >
                <path
                  d="M12 20c-4 0-7-4-7-8s3-8 7-8c1 0 2 .5 3 1.5 1-.5 2-1 3-1 4 0 7 4 7 8s-3 8-7 8c-1 0-2-.5-3-1.5-1 .5-2 1-3 1zm0-15c-2 0-3 2-3 4m6 0c0-2-1-4-3-4"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Management</span>}
            </Link>
          </div>
        </nav>
      </motion.aside>

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
            <h1>Food Category Management</h1>
            <p>Create, edit, and manage food categories for better organization</p>
          </div>
        </div>

        <div className="management-container">
          <div className="chart-section">
            <div className="chart-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Category" : "Create New Category"}</h2>
            </div>
            <div className="form-card">
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
              <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Fruits"
                  className="input-field"
                  aria-label="Category name"
                />
                <label htmlFor="category-description">Description</label>
                <textarea
                  id="category-description"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Includes apples, bananas, etc."
                  className="textarea-field"
                  rows="4"
                  aria-label="Category description"
                />
                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateCategoryHandler : createCategoryHandler}
                    disabled={loading}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    aria-label={isEditing ? "Update category" : "Create category"}
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

          <div className="category-list-section">
            <div className="section-header">
              <h2>All Food Categories</h2>
              <div className="category-count">
                {filteredCategories.length}{" "}
                {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3>No categories found</h3>
                <p>Create your first food category to get started</p>
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
                          onClick={() => deleteCategoryHandler(category.id)}
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

export default FoodCategoryManagement;