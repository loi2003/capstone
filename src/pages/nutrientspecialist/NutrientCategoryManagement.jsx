import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'chart.js/auto';
import { getAllNutrientCategories, getNutrientCategoryById, createNutrientCategory, updateNutrientCategory, getAllNutrients } from '../../apis/nutriet-api';
import '../../styles/NutrientCategoryManagement.css';

// SVG Icons
const BackIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SidebarToggleIcon = ({ isOpen }) => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L12 12L6 6" : "M6 6L12 12L6 18"} />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Notification Component
const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent('closeNotification'));
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="notification-icon">
        {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
      </div>
      <div className="notification-content">
        <h4>{type === 'success' ? 'Success' : 'Error'}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const NutrientCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 7;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    // Listen for close event
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener('closeNotification', closeListener);
    };
    document.addEventListener('closeNotification', closeListener);
  };

  // Fetch all categories and nutrients
  const fetchCategoriesAndNutrients = async () => {
    setLoading(true);
    try {
      const [categoriesData, nutrientsData] = await Promise.all([
        getAllNutrientCategories(),
        getAllNutrients()
      ]);
      // Map nutrients to categories to count nutrients per category
      const enrichedCategories = categoriesData.map(category => ({
        ...category,
        nutrientCount: nutrientsData.filter(nutrient => nutrient.categoryId === category.id).length
      }));
      setCategories(enrichedCategories);
      setFilteredCategories(enrichedCategories);
      setNutrients(nutrientsData);
      setCurrentPage(1); // Reset to first page
    } catch (err) {
      showNotification('Failed to fetch data', 'error');
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
      showNotification('Failed to fetch category', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await createNutrientCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      await fetchCategoriesAndNutrients();
      showNotification('Category created successfully', 'success');
    } catch (err) {
      showNotification('Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async () => {
    if (!newCategory.name.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateNutrientCategory({
        nutrientCategoryId: selectedCategory.id,
        name: newCategory.name,
        description: newCategory.description
      });
      setNewCategory({ name: '', description: '' });
      setSelectedCategory(null);
      setIsEditing(false);
      await fetchCategoriesAndNutrients();
      showNotification('Category updated successfully', 'success');
    } catch (err) {
      showNotification('Failed to update category', 'error');
    } finally {
      setLoading(false);
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
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setNewCategory({ name: '', description: '' });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Pagination
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
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

  // Initialize data
  useEffect(() => {
    fetchCategoriesAndNutrients();
  }, []);

  // Update chart
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: categories.map(cat => cat.name),
          datasets: [{
            label: 'Nutrients per Category',
            data: categories.map(cat => cat.nutrientCount || 0),
            backgroundColor: 'rgba(46, 125, 50, 0.6)',
            borderColor: 'rgba(46, 125, 50, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { 
              beginAtZero: true, 
              title: { display: true, text: 'Number of Nutrients' },
              ticks: { stepSize: 1 } // Ensure integer ticks
            },
            x: { title: { display: true, text: 'Categories' } },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          animation: {
            duration: 1000, // Smooth initial render
            easing: 'easeOutQuart'
          }
        },
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [categories]);

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
      <motion.aside
        className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}
        initial={{ width: isSidebarOpen ? '20rem' : '4rem' }}
        animate={{ width: isSidebarOpen ? '20rem' : '4rem' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="sidebar-header">
          {isSidebarOpen && <h2>Baby Nutrient Categories</h2>}
          <motion.button
            onClick={toggleSidebar}
            className="sidebar-toggle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <SidebarToggleIcon isOpen={isSidebarOpen} />
          </motion.button>
        </div>
        {isSidebarOpen && (
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
        )}
        <div className="category-list">
          {loading ? (
            <p className="loading-message">Loading...</p>
          ) : currentCategories.length === 0 ? (
            <p className="no-results">No categories found</p>
          ) : (
            currentCategories.map(category => (
              <motion.div
                key={category.id}
                className="category-item"
                onClick={() => fetchCategoryById(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{isSidebarOpen ? category.name : category.name[0]}</h3>
                {isSidebarOpen && <p>{category.description || 'No description'}</p>}
              </motion.div>
            ))
          )}
        </div>
        {filteredCategories.length > categoriesPerPage && (
          <div className="pagination">
            <motion.button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="pagination-button"
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </motion.button>
            <span className="pagination-info">{currentPage} of {totalPages}</span>
            <motion.button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </motion.button>
          </div>
        )}
      </motion.aside>
      <main className="main-content">
        <motion.div
          className="main-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-header">
            <h1>Manage Nutrient Categories</h1>
            <motion.button
              onClick={() => navigate('/nutrient-specialist')}
              className="back-button"
              whileHover={{ scale: 1.05, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Navigate back to nutrient specialist dashboard"
            >
              <BackIcon />
            </motion.button>
          </div>
          <div className="chart-section">
            <h2>Category Overview</h2>
            <div className="chart-container">
              {loading ? (
                <p className="loading-message">Loading chart...</p>
              ) : (
                <canvas ref={chartRef}></canvas>
              )}
            </div>
          </div>
          <div className="form-section">
            <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
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
                placeholder="e.g., Essential for baby growth"
                className="textarea-field"
                rows="4"
                aria-label="Category description"
              />
              <div className="button-group">
                <motion.button
                  onClick={isEditing ? updateCategory : createCategory}
                  disabled={loading}
                  className="submit-button"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Category' : 'Create Category')}
                </motion.button>
                {isEditing && (
                  <motion.button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="cancel-button"
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NutrientCategoryManagement;