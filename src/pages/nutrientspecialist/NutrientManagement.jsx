import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllNutrients, getNutrientWithDetailsById, createNutrient, getAllNutrientCategories } from '../../apis/nutriet-api';
import '../../styles/NutrientManagement.css';

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

const NutrientManagement = () => {
  const [nutrients, setNutrients] = useState([]);
  const [filteredNutrients, setFilteredNutrients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newNutrient, setNewNutrient] = useState({ name: '', description: '', imageUrl: '', unit: '', categoryId: '' });
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [currentNutrientIndex, setCurrentNutrientIndex] = useState(0);
  const nutrientsPerPage = 7;
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

  // Fetch all nutrients and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const [nutrientsData, categoriesData] = await Promise.all([
        getAllNutrients(),
        getAllNutrientCategories()
      ]);
      setNutrients(nutrientsData);
      setFilteredNutrients(nutrientsData);
      setCategories(categoriesData);
      setCurrentNutrientIndex(0); // Reset to first nutrient
    } catch (err) {
      showNotification('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nutrient by ID with details
  const fetchNutrientById = async (id) => {
    setLoading(true);
    try {
      const data = await getNutrientWithDetailsById(id);
      setSelectedNutrient(data);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false); // Auto-close sidebar on selection in mobile mode
      }
    } catch (err) {
      showNotification('Failed to fetch nutrient details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new nutrient
  const createNutrientHandler = async () => {
    if (!newNutrient.name.trim() || !newNutrient.unit.trim() || !newNutrient.categoryId) {
      showNotification('Name, unit, and category are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await createNutrient(newNutrient);
      setNewNutrient({ name: '', description: '', imageUrl: '', unit: '', categoryId: '' });
      await fetchData();
      showNotification('Nutrient created successfully', 'success');
    } catch (err) {
      showNotification('Failed to create nutrient', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNutrient({ ...newNutrient, [name]: value });
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = nutrients.filter(nutrient =>
      nutrient.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredNutrients(filtered);
    setCurrentNutrientIndex(0); // Reset to first nutrient on search
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigate to previous nutrient
  const handlePrevNutrient = () => {
    if (currentNutrientIndex > 0) {
      setCurrentNutrientIndex(currentNutrientIndex - 1);
    }
  };

  // Navigate to next nutrient
  const handleNextNutrient = () => {
    if (currentNutrientIndex < filteredNutrients.length - 1) {
      setCurrentNutrientIndex(currentNutrientIndex + 1);
    }
  };

  // Pagination for larger screens
  const currentPage = Math.floor(currentNutrientIndex / nutrientsPerPage) + 1;
  const indexOfLastNutrient = currentPage * nutrientsPerPage;
  const indexOfFirstNutrient = indexOfLastNutrient - nutrientsPerPage;
  const currentNutrients = filteredNutrients.slice(indexOfFirstNutrient, indexOfLastNutrient);
  const totalPages = Math.ceil(filteredNutrients.length / nutrientsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentNutrientIndex((currentPage - 2) * nutrientsPerPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentNutrientIndex(currentPage * nutrientsPerPage);
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
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    closed: {
      y: '-100%',
      height: '4rem',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
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
      <motion.aside
        className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}
        initial={{ 
          width: window.innerWidth > 768 ? (isSidebarOpen ? '20rem' : '4rem') : '100%', 
          y: window.innerWidth <= 768 && !isSidebarOpen ? '-100%' : 0,
          height: window.innerWidth <= 768 && !isSidebarOpen ? '4rem' : 'auto'
        }}
        animate={window.innerWidth > 768 ? 
          { width: isSidebarOpen ? '20rem' : '4rem' } : 
          { y: isSidebarOpen ? 0 : '-100%', height: isSidebarOpen ? 'auto' : '4rem' }
        }
        variants={window.innerWidth <= 768 ? sidebarVariants : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="sidebar-header">
          <h2>Baby Nutrients</h2>
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
              placeholder=""
              className="search-input"
              aria-label="Search nutrients"
            />
          </div>
        )}
        <div className="nutrient-list">
          {loading ? (
            <p className="loading-message">Loading...</p>
          ) : filteredNutrients.length === 0 ? (
            <p className="no-results">Add a nutrient to get started</p>
          ) : window.innerWidth <= 768 ? (
            <motion.div
              className="nutrient-item"
              onClick={() => fetchNutrientById(filteredNutrients[currentNutrientIndex].id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="nutrient-header">
                <h3>{filteredNutrients[currentNutrientIndex].name}</h3>
                <span className="nutrient-unit">{filteredNutrients[currentNutrientIndex].unit}</span>
              </div>
              <p>{filteredNutrients[currentNutrientIndex].description || 'No description'}</p>
              {filteredNutrients[currentNutrientIndex].imageUrl && (
                <img
                  src={filteredNutrients[currentNutrientIndex].imageUrl}
                  alt={filteredNutrients[currentNutrientIndex].name}
                  className="nutrient-image"
                />
              )}
            </motion.div>
          ) : (
            currentNutrients.map(nutrient => (
              <motion.div
                key={nutrient.id}
                className="nutrient-item"
                onClick={() => fetchNutrientById(nutrient.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="nutrient-header">
                  <h3>{isSidebarOpen ? nutrient.name : nutrient.name[0]}</h3>
                  {isSidebarOpen && <span className="nutrient-unit">{nutrient.unit}</span>}
                </div>
                {isSidebarOpen && <p>{nutrient.description || 'No description'}</p>}
                {isSidebarOpen && nutrient.imageUrl && (
                  <img
                    src={nutrient.imageUrl}
                    alt={nutrient.name}
                    className="nutrient-image"
                  />
                )}
              </motion.div>
            ))
          )}
        </div>
        {filteredNutrients.length > 1 && (
          <div className="pagination">
            {window.innerWidth <= 768 ? (
              <>
                <motion.button
                  onClick={handlePrevNutrient}
                  disabled={currentNutrientIndex === 0}
                  className="pagination-button"
                  whileHover={{ scale: currentNutrientIndex === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: currentNutrientIndex === 0 ? 1 : 0.95 }}
                  aria-label="Previous nutrient"
                >
                  <ChevronLeftIcon />
                </motion.button>
                <span className="pagination-info">{currentNutrientIndex + 1} of {filteredNutrients.length}</span>
                <motion.button
                  onClick={handleNextNutrient}
                  disabled={currentNutrientIndex === filteredNutrients.length - 1}
                  className="pagination-button"
                  whileHover={{ scale: currentNutrientIndex === filteredNutrients.length - 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentNutrientIndex === filteredNutrients.length - 1 ? 1 : 0.95 }}
                  aria-label="Next nutrient"
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
            <h1>Manage Nutrients</h1>
            <motion.button
              onClick={() => navigate('/nutrient-specialist')}
              className="back-button"
              whileHover={{ scale: 1.05, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Navigate back to nutrient specialist dashboard"
            >
              <BackIcon />
              Back
            </motion.button>
          </div>
          <div className="form-section">
            <h2>Add New Nutrient</h2>
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
              />
              <label htmlFor="nutrient-imageUrl">Image URL</label>
              <input
                id="nutrient-imageUrl"
                type="text"
                name="imageUrl"
                value={newNutrient.imageUrl}
                onChange={handleInputChange}
                placeholder="Image URL (optional)"
                className="input-field"
                aria-label="Nutrient image URL"
              />
              <label htmlFor="nutrient-unit">Unit</label>
              <input
                id="nutrient-unit"
                type="text"
                name="unit"
                value={newNutrient.unit}
                onChange={handleInputChange}
                placeholder="e.g., mg, IU"
                className="input-field"
                aria-label="Nutrient unit"
              />
              <label htmlFor="nutrient-categoryId">Category</label>
              <select
                id="nutrient-categoryId"
                name="categoryId"
                value={newNutrient.categoryId}
                onChange={handleInputChange}
                className="input-field"
                aria-label="Nutrient category"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <motion.button
                onClick={createNutrientHandler}
                disabled={loading}
                className="submit-button"
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? 'Creating...' : 'Create Nutrient'}
              </motion.button>
            </div>
          </div>
          {selectedNutrient && (
            <div className="details-section">
              <h2>Nutrient Details</h2>
              <div className="nutrient-details">
                <h3>{selectedNutrient.name}</h3>
                <p><strong>Unit:</strong> {selectedNutrient.unit}</p>
                <p><strong>Description:</strong> {selectedNutrient.description || 'No description'}</p>
                {selectedNutrient.imageUrl && (
                  <img
                    src={selectedNutrient.imageUrl}
                    alt={selectedNutrient.name}
                    className="nutrient-image"
                  />
                )}
                <p><strong>Category:</strong> {categories.find(cat => cat.id === selectedNutrient.categoryId)?.name || selectedNutrient.categoryId}</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
};

export default NutrientManagement;