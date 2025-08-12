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
  getAllFoodCategories
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
          <button className="modal-close-button" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
          {food.imageUrl && (
            <div className="modal-image">
              <img src={food.imageUrl} alt={food.name} />
            </div>
          )}
          <p><strong>Description:</strong> {food.description || "No description provided"}</p>
          <p><strong>Category:</strong> {category ? category.name : "Uncategorized"}</p>
          <p><strong>Pregnancy Safe:</strong> {food.pregnancySafe ? "Yes" : "No"}</p>
          {food.safetyNote && (
            <p><strong>Safety Note:</strong> {food.safetyNote}</p>
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
    image: null 
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const foodsPerPage = 6;
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
        getAllFoodCategories()
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
        throw new Error("No data received from server (possible food not found)");
      }

      const normalizedData = {
        id: foodData?.id || foodData?.Id || "",
        name: foodData?.name || "",
        description: foodData?.description || "",
        pregnancySafe: foodData?.pregnancySafe || false,
        foodCategoryId: foodData?.foodCategoryId || "",
        safetyNote: foodData?.safetyNote || "",
        imageUrl: foodData?.imageUrl || null
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
        image: normalizedData.imageUrl
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
    if (!newFood.name || typeof newFood.name !== "string" || !newFood.name.trim()) {
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
        image: newFood.image
      });
      setNewFood({ 
        name: "", 
        description: "", 
        pregnancySafe: false, 
        foodCategoryId: "", 
        safetyNote: "", 
        image: null 
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
        safetyNote: newFood.safetyNote?.trim() || ""
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
        image: null 
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
      [name]: type === 'checkbox' ? checked : value 
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
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = foods.filter((food) =>
      food.name?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredFoods(filtered);
    setCurrentPage(1);
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewFood({ 
      name: "", 
      description: "", 
      pregnancySafe: false, 
      foodCategoryId: "", 
      safetyNote: "", 
      image: null 
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
  const currentFoods = filteredFoods.slice(
    indexOfFirstFood,
    indexOfLastFood
  );
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
            category={foodCategories.find(cat => cat.id === selectedFoodForModal.foodCategoryId)}
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
          <div className="sidebar-nav-item">
            <Link
              to="/nutrient-specialist/food-category-management"
              title="Food Categories"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Food icon"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Categories</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
            <Link
              to="/nutrient-specialist/food-management"
              title="Food Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="List icon"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Management</span>}
            </Link>
          </div>
        </nav>
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
              Create, edit, and manage food items and their nutritional information
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
                  {foodCategories.map(category => (
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
                {filteredFoods.length === 1 ? "food" : "foods"}{" "}
                found
              </div>
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
                    const category = foodCategories.find(cat => cat.id === food.foodCategoryId);
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
                          <span className={`pregnancy-tag ${food.pregnancySafe ? 'safe' : 'unsafe'}`}>
                            {food.pregnancySafe ? 'Pregnancy Safe' : 'Not Pregnancy Safe'}
                          </span>
                        </div>
                        <p className="card-description">
                          {food.description || "No description provided"}
                        </p>
                        <p className="card-category">
                          Category: {category ? category.name : 'Uncategorized'}
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