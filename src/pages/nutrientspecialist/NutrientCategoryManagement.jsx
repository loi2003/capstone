import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'chart.js/auto';
import { getAllNutrientCategories, getNutrientCategoryById, createNutrientCategory, updateNutrientCategory, getAllNutrients } from '../../apis/nutriet-api';
import '../../styles/NutrientCategoryManagement.css';

// SVG Icons (unchanged)
const SearchIcon = () => (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const SuccessIcon = () => (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>);
const ErrorIcon = () => (<svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const LoaderIcon = () => (<svg className="icon loader" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414" /></svg>);

// Notification Component (unchanged)
const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
     document.dispatchEvent(new CustomEvent('closeNotification'));
    }, 5000);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const categoriesPerPage = 6;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener('closeNotification', closeListener);
    };
    document.addEventListener('closeNotification', closeListener);
  };

  // Fetch categories and nutrients
  const fetchCategoriesAndNutrients = async () => {
    setLoading(true);
    try {
      const [categoriesData, nutrientsData] = await Promise.all([
        getAllNutrientCategories(),
        getAllNutrients(),
      ]);
      const enrichedCategories = categoriesData.map(category => ({
        ...category,
        nutrientCount: nutrientsData.filter(nutrient => nutrient.categoryId === category.id).length,
      }));
      setCategories(enrichedCategories);
      setFilteredCategories(enrichedCategories);
      setNutrients(nutrientsData);
      setCurrentPage(1);
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, 'error');
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
      showNotification(`Failed to fetch category: ${err.message}`, 'error');
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
      showNotification(`Failed to create category: ${err.message}`, 'error');
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
        description: newCategory.description,
      });
      setNewCategory({ name: '', description: '' });
      setSelectedCategory(null);
      setIsEditing(false);
      await fetchCategoriesAndNutrients();
      showNotification('Category updated successfully', 'success');
    } catch (err) {
      showNotification(`Failed to update category: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await deleteNutrientCategory(id); // Assumes this function exists in nutrient-api
        await fetchCategoriesAndNutrients();
        showNotification('Category deleted successfully', 'success');
      } catch (err) {
        showNotification(`Failed to delete category: ${err.message}`, 'error');
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
    const filtered = categories.filter(category =>
      category.name?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setNewCategory({ name: '', description: '' });
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Initialize data
  useEffect(() => {
    fetchCategoriesAndNutrients();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (chartRef.current && !chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Nutrients per Category',
            data: [],
            backgroundColor: 'rgba(46, 125, 50, 0.6)',
            borderColor: 'rgba(46, 125, 50, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true, 
              title: { display: true, text: 'Number of Nutrients' },
              ticks: { stepSize: 1 },
            },
            x: { title: { display: true, text: 'Categories' } },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = categories.map(cat => cat.name || 'Unnamed');
      chartInstanceRef.current.data.datasets[0].data = categories.map(cat => cat.nutrientCount || 0);
      chartInstanceRef.current.update();
    }
  }, [categories]);

  // Sidebar animation variants
  const sidebarVariants = {
    open: { width: 'min(260px, 25vw)', transition: { duration: 0.3, ease: 'easeOut' } },
    closed: { width: 'min(60px, 15vw)', transition: { duration: 0.3, ease: 'easeIn' } },
  };

  // Handle window resize to toggle sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="nutrient-category-management">
      <AnimatePresence>
        {notification && (
          <Notification message={notification.message} type={notification.type} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`nutrient-specialist-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={window.innerWidth > 768 ? 'open' : 'closed'}
      >
        <div className="sidebar-header">
          <Link to="/nutrient-specialist" className="logo">
            <motion.div className="logo-svg-container">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-label="Leaf icon">
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
            aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--nutrient-specialist-white)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isSidebarOpen ? 'M13 18L7 12L13 6M18 18L12 12L18 6' : 'M6 18L12 12L6 6M11 18L17 12L11 6'}
              />
            </svg>
          </motion.button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist" title="Dashboard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Dashboard icon">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="var(--nutrient-specialist-accent)" stroke="var(--nutrient-specialist-white)" strokeWidth="1.5" />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
            <Link to="/nutrient-specialist/nutrient-category-management" title="Nutrient Categories">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Category icon">
                <path d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12 0h6v6h-6v-6zm0-12h6v6h-6V3z" fill="var(--nutrient-specialist-secondary)" stroke="var(--nutrient-specialist-white)" strokeWidth="1.5" />
              </svg>
              {isSidebarOpen && <span>Nutrient Categories</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist/nutrient-management" title="Nutrient Management">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="List icon">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="var(--nutrient-specialist-white)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isSidebarOpen && <span>Nutrient Management</span>}
            </Link>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className={`nutrient-specialist-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>
              Nutrient Category Management
            </h1>
            <p>Create, edit, and manage nutrient categories for better organization</p>
          </div>
        </div>

        <div className="management-container">
          {/* Chart Section */}
          <div className="chart-section">
            <div className="section-header">
              <h2>Category Overview</h2>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color"></div>
                  <span>Nutrients per Category</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? 'Edit Category' : 'Create New Category'}</h2>
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
                    aria-label={isEditing ? 'Update category' : 'Create category'}
                  >
                    {loading ? 'Loading...' : isEditing ? 'Update Category' : 'Create Category'}
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
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>No categories found</h3>
                <p>Create your first nutrient category to get started</p>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
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
                  {currentCategories.map(category => (
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
                        {category.description || 'No description provided'}
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
                      aria-label="Previous page!...page"
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
                      whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                      whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
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