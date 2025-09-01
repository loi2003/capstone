import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  updateFoodImage,
  deleteFood,
  getAllFoodCategories,
} from "../../apis/nutriet-api";
import { getCurrentUser } from "../../apis/authentication-api";
import "../../styles/FoodManagement.css";

// Reuse the same icons from FoodCategoryManagement
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

// Notification component
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

// Food Details Modal Component
const FoodDetailsModal = ({ food, category, onClose }) => {
  return (
    <motion.div
      className="food-details-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <div className="modal-header">
          <h2>{food.name}</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-details">
            <p>
              <strong>Description:</strong>{" "}
              {food.description || "No description provided"}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {category ? category.name : "Uncategorized"}
            </p>
            <p>
              <strong>Pregnancy Safe:</strong>{" "}
              {food.pregnancySafe ? "Yes" : "No"}
            </p>
            {food.safetyNote && (
              <p>
                <strong>Safety Note:</strong> {food.safetyNote}
              </p>
            )}
          </div>
          {food.imageUrl && (
            <div className="modal-image">
              <img src={food.imageUrl} alt={food.name} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const FoodManagement = () => {
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [newFood, setNewFood] = useState({
    name: "",
    description: "",
    pregnancySafe: false,
    foodCategoryId: "",
    safetyNote: "",
    image: null,
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pregnancyFilter, setPregnancyFilter] = useState("All");
  const [alphaFilter, setAlphaFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const foodsPerPage = 6;
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

  // Fetch user, foods, and food categories
  const fetchData = async () => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const [userResponse, foodsData, categoriesData] = await Promise.all([
        getCurrentUser(token),
        getAllFoods(),
        getAllFoodCategories(),
      ]);
      const userData = userResponse.data?.data || userResponse.data;
      if (userData && Number(userData.roleId) === 4) {
        setUser(userData);
        setFoods(foodsData);
        setFilteredFoods(foodsData);
        setFoodCategories(categoriesData);
        setCurrentPage(1);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodById = async (id) => {
    if (!id) {
      showNotification("Invalid food ID", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await getFoodById(id);

      let foodData = response;

      if (response && response.data) {
        foodData = response.data;
        if (response.data.data) {
          foodData = response.data.data;
        }
      }

      if (!foodData) {
        throw new Error(
          "No data received from server (possible food not found)"
        );
      }

      const normalizedData = {
        id: foodData?.id || foodData?.Id || "",
        name: foodData?.name || "",
        description: foodData?.description || "",
        pregnancySafe: foodData?.pregnancySafe || false,
        foodCategoryId: foodData?.foodCategoryId || "",
        safetyNote: foodData?.safetyNote || "",
        imageUrl: foodData?.imageUrl || null,
      };

      if (!normalizedData.id || !normalizedData.name) {
        throw new Error("Invalid food data structure (missing id or name)");
      }

      setSelectedFood(normalizedData);
      setNewFood({
        name: normalizedData.name,
        description: normalizedData.description,
        pregnancySafe: normalizedData.pregnancySafe,
        foodCategoryId: normalizedData.foodCategoryId,
        safetyNote: normalizedData.safetyNote,
        image: normalizedData.imageUrl,
      });
      setIsEditing(true);
    } catch (err) {
      console.error("Error fetching food:", {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch food details";
      showNotification(errorMessage, "error");
      setSelectedFood(null);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle View All click
  const handleViewAll = (food) => {
    setSelectedFoodForModal(food);
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedFoodForModal(null);
  };

  const createFoodHandler = async () => {
    if (
      !newFood.name ||
      typeof newFood.name !== "string" ||
      !newFood.name.trim()
    ) {
      showNotification("Food name is required", "error");
      return;
    }

    if (!newFood.foodCategoryId) {
      showNotification("Food category is required", "error");
      return;
    }

    setLoading(true);
    try {
      // Refresh foods to ensure no duplicates
      await fetchData();
      const trimmedName = newFood.name.trim();
      const isDuplicate = foods.some(
        (food) =>
          food.name === trimmedName ||
          food.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        showNotification("Food name already exists", "error");
        return;
      }

      await createFood({
        name: trimmedName,
        description: newFood.description?.trim() || "",
        pregnancySafe: newFood.pregnancySafe,
        foodCategoryId: newFood.foodCategoryId,
        safetyNote: newFood.safetyNote?.trim() || "",
        image: newFood.image,
      });
      setNewFood({
        name: "",
        description: "",
        pregnancySafe: false,
        foodCategoryId: "",
        safetyNote: "",
        image: null,
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Food created successfully", "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create food";
      showNotification(`Failed to create food: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateFoodHandler = async () => {
    if (!newFood.name?.trim()) {
      showNotification("Food name is required", "error");
      return;
    }
    if (!selectedFood?.id) {
      showNotification("No food selected for update", "error");
      return;
    }

    setLoading(true);
    try {
      // Update food details (excluding foodCategoryId as per API spec)
      const foodUpdateResponse = await updateFood({
        id: selectedFood.id,
        name: newFood.name.trim(),
        description: newFood.description?.trim() || "",
        pregnancySafe: newFood.pregnancySafe,
        safetyNote: newFood.safetyNote?.trim() || "",
      });

      if (!foodUpdateResponse) {
        throw new Error("Update failed - no response data from food update");
      }

      // Update image if provided
      let imageUpdated = false;
      if (newFood.image && newFood.image instanceof File) {
        await updateFoodImage(selectedFood.id, newFood.image);
        imageUpdated = true;
      }

      showNotification(
        `Food ${imageUpdated ? "and image " : ""}updated successfully`,
        "success"
      );
      setNewFood({
        name: "",
        description: "",
        pregnancySafe: false,
        foodCategoryId: "",
        safetyNote: "",
        image: null,
      });
      setSelectedFood(null);
      setIsEditing(false);
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update food";
      showNotification(`Failed to update food: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete food
  const deleteFoodHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this food?")) {
      setLoading(true);
      try {
        await deleteFood(id);
        await fetchData();
        showNotification("Food deleted successfully", "success");
      } catch (err) {
        showNotification(`Failed to delete food: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewFood({
      ...newFood,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFood({ ...newFood, image: file });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePregnancyFilter = (e) => {
    setPregnancyFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filter foods
  useEffect(() => {
    let filtered = foods;
    if (searchTerm) {
      filtered = filtered.filter((food) =>
        food.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (pregnancyFilter !== "All") {
      const isSafe = pregnancyFilter === "Safe";
      filtered = filtered.filter((food) => food.pregnancySafe === isSafe);
    }
    if (alphaFilter !== "All") {
      filtered = filtered.filter((food) =>
        food.name?.toUpperCase().startsWith(alphaFilter)
      );
    }
    setFilteredFoods(filtered);
  }, [foods, searchTerm, pregnancyFilter, alphaFilter]);

  // Cancel edit
  const cancelEdit = () => {
    setNewFood({
      name: "",
      description: "",
      pregnancySafe: false,
      foodCategoryId: "",
      safetyNote: "",
      image: null,
    });
    setSelectedFood(null);
    setIsEditing(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Pagination
  const indexOfLastFood = currentPage * foodsPerPage;
  const indexOfFirstFood = indexOfLastFood - foodsPerPage;
  const currentFoods = filteredFoods.slice(indexOfFirstFood, indexOfLastFood);
  const totalPages = Math.ceil(filteredFoods.length / foodsPerPage);

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

  // Handle window resize to toggle sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchData();
  }, []);

  // Sidebar animation variants
  const sidebarVariants = {
    open: { width: "280px", transition: { duration: 0.3, ease: "easeOut" } },
    closed: { width: "60px", transition: { duration: 0.3, ease: "easeIn" } },
  };

  // Additional sidebar animation variants
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

  // Toggle dropdowns
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(true); // Open by default since we're in FoodManagement

  const toggleNutrientDropdown = () => {
    setIsNutrientDropdownOpen((prev) => !prev);
  };

  const toggleFoodDropdown = () => {
    setIsFoodDropdownOpen((prev) => !prev);
  };

  return (
    <div className="food-management">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
        {showModal && selectedFoodForModal && (
          <FoodDetailsModal
            food={selectedFoodForModal}
            category={foodCategories.find(
              (cat) => cat.id === selectedFoodForModal.foodCategoryId
            )}
            onClose={closeModal}
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Edit icon for blog management"
                  >
                    <path
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4L18.5 2.5z"
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={
                    isFoodDropdownOpen ? "Collapse food menu" : "Expand food menu"
                  }
                  title="Food"
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
                        d={isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"}
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={isSidebarOpen && !isFoodDropdownOpen ? "closed" : "open"}
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
                </motion.div>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                      d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                      stroke="var(--nutrient-specialist-white)"
                      fill="var(--nutrient-specialist-accent)"
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
                          isNutrientDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"
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
                      aria-label="Folder icon for nutrient category management"
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
                      aria-label="Sprout icon for nutrient management"
                    >
                      <path
                        d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                        stroke="var(--nutrient-specialist-white)"
                        fill="var(--nutrient-specialist-accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item ">
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
                      d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                      stroke="var(--nutrient-specialist-white)"
                      fill="var(--nutrient-specialist-accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Warning icon for allergy category management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Warning icon for allergy management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Warning icon for disease management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
          <motion.div variants={navItemVariants} className="sidebar-nav-item page-switcher">
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
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10
        10 10 10-4.48 10-10S17.52 2 12 2zm0
        3c1.66 0 3 1.34 3 3s-1.34
        3-3 3-3-1.34-3-3 1.34-3
        3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99
        4-3.08 6-3.08 1.99 0 5.97 1.09
        6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
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
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
            <h1>Food Management</h1>
            <p>
              Create, edit, and manage food items and their nutritional
              information
            </p>
          </div>
        </div>

        <div className="management-container">
          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Food" : "Create New Food"}</h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="food-name">Food Name</label>
                <input
                  id="food-name"
                  type="text"
                  name="name"
                  value={newFood.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple"
                  className="input-field"
                  aria-label="Food name"
                />

                <label htmlFor="food-description">Description</label>
                <textarea
                  id="food-description"
                  name="description"
                  value={newFood.description}
                  onChange={handleInputChange}
                  placeholder="e.g., A sweet, crunchy fruit"
                  className="textarea-field"
                  rows="4"
                  aria-label="Food description"
                />

                <label htmlFor="food-category">Food Category</label>
                <select
                  id="food-category"
                  name="foodCategoryId"
                  value={newFood.foodCategoryId}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Food category"
                  disabled={isEditing}
                >
                  <option value="">Select a category</option>
                  {foodCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="checkbox-group">
                  <input
                    id="pregnancy-safe"
                    type="checkbox"
                    name="pregnancySafe"
                    checked={newFood.pregnancySafe}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <label htmlFor="pregnancy-safe">Pregnancy Safe</label>
                </div>

                <label htmlFor="safety-note">Safety Note</label>
                <textarea
                  id="safety-note"
                  name="safetyNote"
                  value={newFood.safetyNote}
                  onChange={handleInputChange}
                  placeholder="e.g., Wash thoroughly before consumption"
                  className="textarea-field"
                  rows="2"
                  aria-label="Safety note"
                />

                <label htmlFor="food-image">Image</label>
                <input
                  id="food-image"
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="input-field"
                  accept="image/*"
                  aria-label="Food image"
                />

                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateFoodHandler : createFoodHandler}
                    disabled={loading}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    aria-label={isEditing ? "Update food" : "Create food"}
                  >
                    {loading
                      ? "Loading..."
                      : isEditing
                      ? "Update Food"
                      : "Create Food"}
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

          {/* Food List Section */}
          <div className="category-list-section">
            <div className="section-header">
              <h2>All Foods</h2>
              <div className="category-count">
                {filteredFoods.length}{" "}
                {filteredFoods.length === 1 ? "food" : "foods"} found
              </div>
            </div>
            <div className="filter-section">
              <div className="search-section">
                <SearchIcon />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search foods..."
                  className="search-input"
                  aria-label="Search foods"
                />
              </div>
              <select
                value={pregnancyFilter}
                onChange={handlePregnancyFilter}
                className="filter-select"
                aria-label="Filter by pregnancy safe"
              >
                <option value="All">All Pregnancy Safe</option>
                <option value="Safe">Pregnancy Safe</option>
                <option value="Unsafe">Not Pregnancy Safe</option>
              </select>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading foods...</p>
              </div>
            ) : filteredFoods.length === 0 ? (
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
                <h3>No foods found</h3>
                <p>Create your first food item to get started</p>
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
                  {currentFoods.map((food) => {
                    const category = foodCategories.find(
                      (cat) => cat.id === food.foodCategoryId
                    );
                    return (
                      <motion.div
                        key={food.id}
                        className="category-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="card-header">
                          <h3>{food.name}</h3>
                          <span
                            className={`pregnancy-tag ${
                              food.pregnancySafe ? "safe" : "unsafe"
                            }`}
                          >
                            {food.pregnancySafe
                              ? "Pregnancy Safe"
                              : "Not Pregnancy Safe"}
                          </span>
                        </div>
                        <p className="card-description">
                          {food.description || "No description provided"}
                        </p>
                        <p className="card-category">
                          Category: {category ? category.name : "Uncategorized"}
                        </p>
                        {food.safetyNote && (
                          <p className="card-safety">
                            <strong>Safety Note:</strong> {food.safetyNote}
                          </p>
                        )}
                        <div className="card-actions">
                          <motion.button
                            onClick={() => handleViewAll(food)}
                            className="view-button nutrient-specialist-button tertiary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="View food details"
                          >
                            View All
                          </motion.button>
                          <motion.button
                            onClick={() => fetchFoodById(food.id)}
                            className="edit-button nutrient-specialist-button primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Edit food"
                          >
                            Edit
                          </motion.button>
                          <motion.button
                            onClick={() => deleteFoodHandler(food.id)}
                            className="delete-button nutrient-specialist-button secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Delete food"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {filteredFoods.length > foodsPerPage && (
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

export default FoodManagement;