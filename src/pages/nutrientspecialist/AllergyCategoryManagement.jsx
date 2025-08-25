import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllAllergyCategories, createAllergyCategory, updateAllergyCategory, deleteAllergyCategory } from "../../apis/nutriet-api";
import "../../styles/AllergyCategoryManagement.css";

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
  return input.replace(/[<>"'&]/g, (match) => ({
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '&': '&amp;'
  }[match]));
};

// Search Icon
const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={type === "success" ? "M20 6L9 17L4 12" : "M12 12V8M12 16V16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"}
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
  const [formData, setFormData] = useState({
    allergyCategoryId: "",
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // UUID validation regex
  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Fetch allergy categories
  const fetchAllergyCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAllergyCategories();
      console.log('Fetched allergy categories:', data);
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: Expected an array of allergy categories');
      }
      data.forEach((category, index) => {
        if (!category.id || !isValidUUID(category.id)) {
          console.warn(`Invalid or missing ID for category at index ${index}:`, category);
        }
      });
      setAllergyCategories(data || []);
    } catch (error) {
      showNotification(`Failed to fetch allergy categories: ${error.response?.data?.message || error.message}`, "error");
      console.error('Error fetching allergy categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          allergyCategoryId: formData.allergyCategoryId,
          name: formData.name,
          description: formData.description,
        };
        console.log('Updating allergy category with:', updateData);
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
    } catch (error) {
      showNotification(`Failed to ${isEditing ? "update" : "create"} allergy category: ${error.response?.data?.message || error.message}`, "error");
      console.error(`Error in ${isEditing ? "update" : "create"} allergy category:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (allergyCategory) => {
    console.log('Editing allergy category:', allergyCategory);
    if (!allergyCategory.id || !isValidUUID(allergyCategory.id)) {
      showNotification("Invalid category ID for editing", "error");
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
    if (!allergyCategoryId || !isValidUUID(allergyCategoryId)) {
      showNotification("Invalid or missing category ID", "error");
      console.error('Invalid or missing allergyCategoryId:', allergyCategoryId);
      return;
    }
    if (window.confirm("Are you sure you want to delete this allergy category?")) {
      setLoadingItems((prev) => ({ ...prev, [allergyCategoryId]: true }));
      try {
        console.log('Deleting allergy category with ID:', allergyCategoryId);
        await deleteAllergyCategory(allergyCategoryId);
        showNotification("Allergy category deleted successfully", "success");
        fetchAllergyCategories();
      } catch (error) {
        showNotification(`Failed to delete allergy category: ${error.response?.data?.message || error.message}`, "error");
        console.error('Error deleting allergy category:', error);
      } finally {
        setLoadingItems((prev) => ({ ...prev, [allergyCategoryId]: false }));
      }
    }
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

  return (
    <motion.div
      className={`allergy-category-management ${isSidebarOpen ? "" : "sidebar-closed"}`}
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
        className={`nutrient-specialist-sidebar ${isSidebarOpen ? "open" : "closed"}`}
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
                role="img"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--blue-secondary)"
                  stroke="var(--blue-primary)"
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
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist" title="Dashboard">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Dashboard icon"
                role="img"
              >
                <path
                  d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                  fill="var(--blue-accent)"
                  stroke="var(--blue-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className={`nutrient-specialist-content ${isSidebarOpen ? "" : "sidebar-closed"}`}
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
          {/* Form Section */}
          <section className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Allergy Category" : "Create New Allergy Category"}</h2>
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
                  aria-label={isEditing ? "Update allergy category" : "Create allergy category"}
                >
                  {isLoading ? "Loading..." : isEditing ? "Update Category" : "Create Category"}
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

          {/* Allergy Category List Section */}
          <section className="category-list-section">
            <div className="section-header">
              <h2>All Allergy Categories</h2>
              <span className="category-count">{filteredAllergyCategories.length} Categories</span>
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
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" role="img" aria-label="Empty state icon">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                    stroke="var(--blue-text)"
                    strokeWidth="2"
                  />
                </svg>
                <h3>{searchTerm ? "No Matching Categories" : "No Allergy Categories Found"}</h3>
                <p>{searchTerm ? "Try a different search term." : "Add a new allergy category to get started."}</p>
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
                        <p className="card-description">{allergyCategory.description || "No description available"}</p>
                      </div>
                      <div className="card-divider"></div>
                      <div className="card-actions">
                        <motion.button
                          className="nutrient-specialist-button primary"
                          onClick={() => handleEdit(allergyCategory)}
                          disabled={loadingItems[allergyCategory.id]}
                          whileHover={{ scale: loadingItems[allergyCategory.id] ? 1 : 1.05 }}
                          whileTap={{ scale: loadingItems[allergyCategory.id] ? 1 : 0.95 }}
                          aria-label="Edit allergy category"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          className="nutrient-specialist-button secondary"
                          onClick={() => handleDelete(allergyCategory.id)}
                          disabled={loadingItems[allergyCategory.id]}
                          whileHover={{ scale: loadingItems[allergyCategory.id] ? 1 : 1.05 }}
                          whileTap={{ scale: loadingItems[allergyCategory.id] ? 1 : 0.95 }}
                          aria-label="Delete allergy category"
                        >
                          {loadingItems[allergyCategory.id] ? "Deleting..." : "Delete"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <motion.button
                    className="nutrient-specialist-button secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    whileHover={{ scale: currentPage === 1 || isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 || isLoading ? 1 : 0.95 }}
                    aria-label="Previous page"
                  >
                    Previous
                  </motion.button>
                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  <motion.button
                    className="nutrient-specialist-button secondary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    whileHover={{ scale: currentPage === totalPages || isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === totalPages || isLoading ? 1 : 0.95 }}
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