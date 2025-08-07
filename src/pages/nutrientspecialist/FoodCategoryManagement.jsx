import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllFoodCategories, getFoodCategoryById, createFoodCategory, updateFoodCategory } from '../../apis/nutriet-api';
import { getCurrentUser } from '../../apis/authentication-api';
import '../../styles/FoodCategoryManagement.css';

// SVG Icons (reused from NutrientManagement)
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

// Notification Component (reused from NutrientManagement)
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

const FoodCategoryManagement = () => {
  const [user, setUser] = useState(null);
  const [foodCategories, setFoodCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoriesPerPage = 7;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener('closeNotification', closeListener);
    };
    document.addEventListener('closeNotification', closeListener);
  };

  // Fetch user and food categories
  const fetchData = async () => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    setLoading(true);
    try {
      const [userResponse, categoriesData] = await Promise.all([
        getCurrentUser(token),
        getAllFoodCategories(),
      ]);
      const userData = userResponse.data?.data || userResponse.data;
      if (userData && Number(userData.roleId) === 4) {
        setUser(userData);
        console.log('Food Categories Data:', categoriesData);
        setFoodCategories(categoriesData);
        setFilteredCategories(categoriesData);
        setCurrentCategoryIndex(0);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err.response?.data || err.message);
      showNotification(`Failed to fetch data: ${err.message}`, 'error');
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Fetch food category by ID
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const data = await getFoodCategoryById(id);
      console.log('Selected Category:', data);
      setSelectedCategory(data);
      setNewCategory({
        name: data.name,
        description: data.description || '',
      });
      setIsEditing(true);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to fetch category details:', err.response?.data || err.message);
      showNotification(`Failed to fetch category details: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new food category
  const createCategoryHandler = async () => {
    if (!newCategory.name.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      console.log('Creating category with data:', newCategory);
      await createFoodCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      setIsEditing(false);
      await fetchData();
      showNotification('Food category created successfully', 'success');
    } catch (err) {
      console.error('Failed to create category:', err.response?.data || err.message);
      showNotification(`Failed to create category: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update food category
  const updateCategoryHandler = async () => {
    if (!newCategory.name.trim()) {
      showNotification('Category name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      console.log('Updating category with data:', { ...newCategory, id: selectedCategory.id });
      await updateFoodCategory({ ...newCategory, id: selectedCategory.id });
      setNewCategory({ name: '', description: '' });
      setSelectedCategory(null);
      setIsEditing(false);
      await fetchData();
      showNotification('Food category updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update category:', err.response?.data || err.message);
      showNotification(`Failed to update category: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewCategory({ name: '', description: '' });
    setSelectedCategory(null);
    setIsEditing(false);
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
    const filtered = foodCategories.filter(category =>
      category.name?.toLowerCase().includes(term.toLowerCase())
    );
    console.log('Filtered Categories:', filtered);
    setFilteredCategories(filtered);
    setCurrentCategoryIndex(0);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigate to previous category
  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  // Navigate to next category
  const handleNextCategory = () => {
    if (currentCategoryIndex < filteredCategories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  // Pagination for larger screens
  const currentPage = Math.floor(currentCategoryIndex / categoriesPerPage) + 1;
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentCategoryIndex((currentPage - 2) * categoriesPerPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentCategoryIndex(currentPage * categoriesPerPage);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchData();
  }, []);

  // Sidebar animation variants
  const sidebarVariants = {
    open: {
      y: 0,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      y: '-100%',
      height: '4rem',
      transition: { duration: 0.3, ease: 'easeOut' },
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
        className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}
        initial={{
          width: window.innerWidth > 768 ? (isSidebarOpen ? '20rem' : '4rem') : '100%',
          y: window.innerWidth <= 768 && !isSidebarOpen ? '-100%' : 0,
          height: window.innerWidth <= 768 && !isSidebarOpen ? '4rem' : 'auto',
        }}
        animate={window.innerWidth > 768 ?
          { width: isSidebarOpen ? '20rem' : '4rem' } :
          { y: isSidebarOpen ? 0 : '-100%', height: isSidebarOpen ? 'auto' : '4rem' }
        }
        variants={window.innerWidth <= 768 ? sidebarVariants : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="sidebar-header">
          <h2>Food Categories</h2>
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
        {(window.innerWidth > 768 || isSidebarOpen) && (
          <div className="search-section">
            <SearchIcon />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search categories..."
              className="search-input"
              aria-label="Search food categories"
            />
          </div>
        )}
        <div className="category-list">
          {loading ? (
            <p className="loading-message">Loading...</p>
          ) : filteredCategories.length === 0 ? (
            <p className="no-results">Add a category to get started</p>
          ) : window.innerWidth <= 768 ? (
            <motion.div
              className="category-item"
              onClick={() => fetchCategoryById(filteredCategories[currentCategoryIndex].id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="category-header">
                <h3>{filteredCategories[currentCategoryIndex].name}</h3>
              </div>
              <p>{filteredCategories[currentCategoryIndex].description || 'No description'}</p>
            </motion.div>
          ) : (
            currentCategories.map(category => (
              <motion.div
                key={category.id}
                className="category-item"
                onClick={() => fetchCategoryById(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="category-header">
                  <h3>{isSidebarOpen ? category.name : category.name[0]}</h3>
                </div>
                {isSidebarOpen && <p>{category.description || 'No description'}</p>}
              </motion.div>
            ))
          )}
        </div>
        {filteredCategories.length > 1 && (
          <div className="pagination">
            {window.innerWidth <= 768 ? (
              <>
                <motion.button
                  onClick={handlePrevCategory}
                  disabled={currentCategoryIndex === 0}
                  className="pagination-button"
                  whileHover={{ scale: currentCategoryIndex === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: currentCategoryIndex === 0 ? 1 : 0.95 }}
                  aria-label="Previous category"
                >
                  <ChevronLeftIcon />
                </motion.button>
                <span className="pagination-info">{currentCategoryIndex + 1} of {filteredCategories.length}</span>
                <motion.button
                  onClick={handleNextCategory}
                  disabled={currentCategoryIndex === filteredCategories.length - 1}
                  className="pagination-button"
                  whileHover={{ scale: currentCategoryIndex === filteredCategories.length - 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentCategoryIndex === filteredCategories.length - 1 ? 1 : 0.95 }}
                  aria-label="Next category"
                >
                  <ChevronRightIcon />
                </motion.button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </motion.aside>
      <motion.main
        className="main-content"
        animate={{ marginTop: window.innerWidth <= 768 ? (isSidebarOpen ? 'auto' : '4rem') : 0, marginLeft: window.innerWidth > 768 ? (isSidebarOpen ? '20rem' : '4rem') : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.div
          className="main-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="panel-header">
            <h1>Manage Food Categories</h1>
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
          <div className="form-section">
            <h2>{isEditing ? 'Edit Food Category' : 'Add New Food Category'}</h2>
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
          {selectedCategory && (
            <div className="details-section">
              <h2>Category Details</h2>
              <div className="category-details">
                <h3>{selectedCategory.name}</h3>
                <p><strong>Description:</strong> {selectedCategory.description || 'No description'}</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

export default FoodCategoryManagement;