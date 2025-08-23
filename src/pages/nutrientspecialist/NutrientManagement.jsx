import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import {
  getAllNutrients,
  getNutrientWithDetailsById,
  createNutrient,
  deleteNutrient,
  updateNutrient,
  updateNutrientImage,
  getAllNutrientCategories,
} from "../../apis/nutriet-api";
import "../../styles/NutrientManagement.css";

const LoaderIcon = () => (
  <svg
    className="icon loader"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414"
    />
  </svg>
);

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

const NutrientManagement = () => {
  const [nutrients, setNutrients] = useState([]);
  const [filteredNutrients, setFilteredNutrients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newNutrient, setNewNutrient] = useState({
    name: "",
    description: "",
    imageUrl: null,
    categoryId: "",
  });
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  // Validate nutrient name for duplicates
  const validateNutrientName = (name, nutrientId = null) => {
    const trimmedName = name.trim().toLowerCase();
    return nutrients.some(
      (nutrient) =>
        nutrient.name?.toLowerCase() === trimmedName &&
        (nutrientId ? nutrient.id !== nutrientId : true)
    );
  };

  // Validate nutrient data
  const validateNutrient = (nutrient, isUpdate = false) => {
    if (!nutrient.name.trim()) {
      return "Nutrient name is required";
    }
    if (!/^[a-zA-Z0-9\s-_]{3,100}$/.test(nutrient.name.trim())) {
      return "Nutrient name must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, or underscores";
    }
    if (validateNutrientName(nutrient.name, isUpdate ? nutrient.id : null)) {
      return "Nutrient name already exists";
    }
    if (
      !nutrient.categoryId ||
      !categories.some((cat) => cat.id === nutrient.categoryId)
    ) {
      return "Please select a valid category";
    }
    return null;
  };

  // Fetch all nutrients and categories
  const fetchData = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const [nutrientsData, categoriesData] = await Promise.all([
        getAllNutrients(),
        getAllNutrientCategories(),
      ]);
      console.log("Fetched nutrients:", nutrientsData);
      console.log("Fetched categories:", categoriesData);
      setNutrients(nutrientsData);
      setFilteredNutrients(nutrientsData);
      setCategories(categoriesData);
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      } else {
        showNotification(
          `Failed to fetch data: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Fetch nutrient by ID with details
  const fetchNutrientById = async (id) => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const data = await getNutrientWithDetailsById(id);
      console.log("Fetched nutrient data:", data);
      setSelectedNutrient(data);
      setNewNutrient({
        name: data.name,
        description: data.description || "",
        imageUrl: null,
        categoryId: data.categoryId,
      });
      setIsEditing(true);
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      } else {
        showNotification(
          `Failed to fetch nutrient details: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Create new nutrient
  const createNutrientHandler = async () => {
    const validationError = validateNutrient(newNutrient);
    if (validationError) {
      showNotification(validationError, "error");
      return;
    }
    setLoading((prev) => ({ ...prev, create: true }));
    try {
      console.log("Creating nutrient with data:", newNutrient);
      const newNutrientData = await createNutrient(newNutrient);
      setNutrients((prev) => [...prev, newNutrientData]);
      setFilteredNutrients((prev) => [...prev, newNutrientData]);
      setNewNutrient({
        name: "",
        description: "",
        imageUrl: null,
        categoryId: "",
      });
      setIsEditing(false);
      showNotification("Nutrient created successfully", "success");
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      } else {
        showNotification(
          `Failed to create nutrient: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };

  // Update nutrient
  const updateNutrientHandler = async () => {
    const validationError = validateNutrient(
      { ...newNutrient, id: selectedNutrient.id },
      true
    );
    if (validationError) {
      showNotification(validationError, "error");
      return;
    }
    setLoading((prev) => ({ ...prev, update: true }));
    try {
      console.log(
        "Updating nutrient with ID:",
        selectedNutrient.id,
        "and data:",
        newNutrient
      );
      const updatedNutrient = await updateNutrient({
        nutrientId: selectedNutrient.id,
        name: newNutrient.name,
        description: newNutrient.description,
      });
      if (newNutrient.imageUrl) {
        console.log("Updating nutrient image for ID:", selectedNutrient.id);
        await updateNutrientImage(selectedNutrient.id, newNutrient.imageUrl);
      }
      setNutrients((prev) =>
        prev.map((nutrient) =>
          nutrient.id === selectedNutrient.id
            ? { ...nutrient, ...updatedNutrient, categoryId: newNutrient.categoryId }
            : nutrient
        )
      );
      setFilteredNutrients((prev) =>
        prev.map((nutrient) =>
          nutrient.id === selectedNutrient.id
            ? { ...nutrient, ...updatedNutrient, categoryId: newNutrient.categoryId }
            : nutrient
        )
      );
      setNewNutrient({
        name: "",
        description: "",
        imageUrl: null,
        categoryId: "",
      });
      setSelectedNutrient(null);
      setIsEditing(false);
      showNotification("Nutrient updated successfully", "success");
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      } else {
        showNotification(
          `Failed to update nutrient: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  // Delete nutrient
  const deleteNutrientHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nutrient?")) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log("Deleting nutrient with ID:", id);
      await deleteNutrient(id);
      setNutrients((prev) => prev.filter((nutrient) => nutrient.id !== id));
      setFilteredNutrients((prev) => prev.filter((nutrient) => nutrient.id !== id));
      setSelectedNutrient(null);
      setIsEditing(false);
      setNewNutrient({
        name: "",
        description: "",
        imageUrl: null,
        categoryId: "",
      });
      showNotification("Nutrient deleted successfully", "success");
    } catch (err) {
      if (err.response?.status === 401) {
        showNotification("Session expired. Please log in again.", "error");
        navigate("/login");
      } else {
        showNotification(
          `Failed to delete nutrient: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // Handle search
  const handleSearch = debounce((term) => {
    setSearchTerm(term);
    const filtered = nutrients.filter(
      (nutrient) =>
        nutrient.name?.toLowerCase().includes(term.toLowerCase()) || false
    );
    setFilteredNutrients(filtered);
  }, 300);

  const handleSearchInput = (e) => {
    handleSearch(e.target.value);
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewNutrient({
      name: "",
      description: "",
      imageUrl: null,
      categoryId: "",
    });
    setSelectedNutrient(null);
    setIsEditing(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNutrient({ ...newNutrient, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showNotification("Only image files are allowed", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showNotification("Image size must be less than 5MB", "error");
        return;
      }
      setNewNutrient({ ...newNutrient, imageUrl: file });
    } else {
      setNewNutrient({ ...newNutrient, imageUrl: null });
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <div className="nutrient-management">
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
                aria-hidden="true"
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
                aria-hidden="true"
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
                aria-hidden="true"
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
          </div>
          <div className="sidebar-nav-item active">
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
                aria-hidden="true"
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
          </div>
          <div className="sidebar-nav-item">
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
                aria-label="Link icon for nutrient in food management"
                aria-hidden="true"
              >
                <path
                  d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  stroke="var(--nutrient-specialist-white)"
                  fill="var(--nutrient-specialist-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Nutrient in Food Management</span>}
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
            <h1>Manage Nutrients</h1>
            <p>Create, edit, and manage nutrients for your baby's nutrition</p>
          </div>
        </div>

        <div className="management-container">
          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Nutrient" : "Add New Nutrient"}</h2>
            </div>
            {categories.length === 0 && (
              <p className="no-results">
                No categories available. Please add a category first.
              </p>
            )}
            {notification?.type === "error" && (
              <span id="nutrient-error" className="error-message">
                {notification.message}
              </span>
            )}
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="nutrient-name">Nutrient Name</label>
                <input
                  id="nutrient-name"
                  type="text"
                  name="name"
                  value={newNutrient.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Vitamin D"
                  className="input-field"
                  aria-label="Nutrient name"
                  aria-describedby={
                    notification?.type === "error" ? "nutrient-error" : undefined
                  }
                />
                <label htmlFor="nutrient-description">Description</label>
                <textarea
                  id="nutrient-description"
                  name="description"
                  value={newNutrient.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Supports bone growth"
                  className="textarea-field"
                  rows="4"
                  aria-label="Nutrient description"
                  aria-describedby={
                    notification?.type === "error" ? "nutrient-error" : undefined
                  }
                />
                <label htmlFor="nutrient-imageUrl">Image File</label>
                <input
                  id="nutrient-imageUrl"
                  type="file"
                  name="imageUrl"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-field"
                  aria-label="Nutrient image file"
                />
                <label htmlFor="nutrient-categoryId">Category</label>
                <select
                  id="nutrient-categoryId"
                  name="categoryId"
                  value={newNutrient.categoryId}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Nutrient category"
                  disabled={categories.length === 0}
                  aria-describedby={
                    notification?.type === "error" ? "nutrient-error" : undefined
                  }
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="button-group">
                  <motion.button
                    onClick={
                      isEditing ? updateNutrientHandler : createNutrientHandler
                    }
                    disabled={
                      loading.create || loading.update || categories.length === 0
                    }
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{
                      scale:
                        loading.create || loading.update || categories.length === 0
                          ? 1
                          : 1.05,
                    }}
                    whileTap={{
                      scale:
                        loading.create || loading.update || categories.length === 0
                          ? 1
                          : 0.95,
                    }}
                  >
                    {loading.create || loading.update
                      ? isEditing
                        ? "Updating..."
                        : "Creating..."
                      : isEditing
                      ? "Update Nutrient"
                      : "Create Nutrient"}
                  </motion.button>
                  {isEditing && (
                    <motion.button
                      onClick={cancelEdit}
                      disabled={loading.create || loading.update}
                      className="cancel-button nutrient-specialist-button secondary"
                      whileHover={{
                        scale: loading.create || loading.update ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: loading.create || loading.update ? 1 : 0.95,
                      }}
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nutrient List Section */}
          <div className="nutrient-list-section">
            <div className="section-header">
              <h2>Nutrient List</h2>
              <div className="nutrient-count">
                {filteredNutrients.length}{" "}
                {filteredNutrients.length === 1 ? "nutrient" : "nutrients"} found
              </div>
            </div>
            <div className="search-section">
              <SearchIcon />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInput}
                placeholder="Search nutrients..."
                className="search-input"
                aria-label="Search nutrients"
              />
            </div>
            {loading.fetch ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading nutrients...</p>
              </div>
            ) : filteredNutrients.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3>No nutrients found</h3>
                <p>Create your first nutrient to get started</p>
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
              <div className="nutrient-grid">
                {filteredNutrients.map((nutrient) => (
                  <motion.div
                    key={nutrient.id}
                    className="nutrient-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <h3>{nutrient.name}</h3>
                      <div className="category-badge">
                        {categories.find(
                          (cat) => cat.id === nutrient.categoryId
                        )?.name || "Unknown"}
                      </div>
                    </div>
                    <p className="card-description">
                      {nutrient.description || "No description provided"}
                    </p>
                    <div className="card-meta">
                      {nutrient.imageUrl && (
                        <div className="image-preview">
                          <img
                            src={nutrient.imageUrl}
                            alt={nutrient.name}
                            onError={(e) => {
                              console.error(
                                `Failed to load image for ${nutrient.name}: ${nutrient.imageUrl}`
                              );
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      <motion.button
                        onClick={() => fetchNutrientById(nutrient.id)}
                        className="edit-button nutrient-specialist-button primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Edit ${nutrient.name}`}
                        disabled={loading.delete}
                      >
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => deleteNutrientHandler(nutrient.id)}
                        className="delete-button nutrient-specialist-button secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Delete ${nutrient.name}`}
                        disabled={loading.delete}
                      >
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default NutrientManagement;