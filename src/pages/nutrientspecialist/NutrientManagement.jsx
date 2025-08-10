import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllNutrients, getNutrientWithDetailsById, createNutrient, updateNutrient, getAllNutrientCategories } from '../../apis/nutriet-api';
import '../../styles/NutrientManagement.css';


const LoaderIcon = () => (
  <svg className="icon loader" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414" />
  </svg>
);

// Notification Component
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
     
      <div className="notification-content">
        <h4>{type === 'success' ? 'Success' : 'Error'}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const NutrientManagement = () => {
  const [nutrients, setNutrients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newNutrient, setNewNutrient] = useState({ name: '', description: '', imageUrl: null, unit: '', categoryId: '' });
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
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
        getAllNutrientCategories(),
      ]);
      setNutrients(nutrientsData);
      setCategories(categoriesData);
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, 'error');
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
      setNewNutrient({
        name: data.name,
        description: data.description || '',
        imageUrl: null,
        unit: data.unit,
        categoryId: data.categoryId,
      });
      setIsEditing(true);
    } catch (err) {
      showNotification(`Failed to fetch nutrient details: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new nutrient
  const createNutrientHandler = async () => {
    if (!newNutrient.name.trim()) {
      showNotification('Nutrient name is required', 'error');
      return;
    }
    if (!newNutrient.unit.trim()) {
      showNotification('Unit is required', 'error');
      return;
    }
    if (!newNutrient.categoryId) {
      showNotification('Please select a category', 'error');
      return;
    }
    setLoading(true);
    try {
      await createNutrient(newNutrient);
      setNewNutrient({ name: '', description: '', imageUrl: null, unit: '', categoryId: '' });
      setIsEditing(false);
      await fetchData();
      showNotification('Nutrient created successfully', 'success');
    } catch (err) {
      showNotification(`Failed to create nutrient: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update nutrient
  const updateNutrientHandler = async () => {
    if (!newNutrient.name.trim()) {
      showNotification('Nutrient name is required', 'error');
      return;
    }
    if (!newNutrient.unit.trim()) {
      showNotification('Unit is required', 'error');
      return;
    }
    if (!newNutrient.categoryId) {
      showNotification('Please select a category', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateNutrient({ ...newNutrient, nutrientId: selectedNutrient.id });
      setNewNutrient({ name: '', description: '', imageUrl: null, unit: '', categoryId: '' });
      setSelectedNutrient(null);
      setIsEditing(false);
      await fetchData();
      showNotification('Nutrient updated successfully', 'success');
    } catch (err) {
      showNotification(`Failed to update nutrient: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete nutrient
  const deleteNutrientHandler = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nutrient?')) return;
    setLoading(true);
    try {
      await deleteNutrient(id);
      setSelectedNutrient(null);
      setIsEditing(false);
      setNewNutrient({ name: '', description: '', imageUrl: null, unit: '', categoryId: '' });
      await fetchData();
      showNotification('Nutrient deleted successfully', 'success');
    } catch (err) {
      showNotification(`Failed to delete nutrient: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setNewNutrient({ name: '', description: '', imageUrl: null, unit: '', categoryId: '' });
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
    setNewNutrient({ ...newNutrient, imageUrl: file || null });
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchData();
  }, []);

  // Sidebar animation variants
  const sidebarVariants = {
    open: { width: 'min(260px, 25vw)', transition: { duration: 0.3, ease: 'easeOut' } },
    closed: { width: 'min(60px, 15vw)', transition: { duration: 0.3, ease: 'easeIn' } },
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
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist/nutrient-category-management" title="Nutrient Categories">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-label="Category icon">
                <path d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12 0h6v6h-6v-6zm0-12h6v6h-6V3z" fill="var(--nutrient-specialist-secondary)" stroke="var(--nutrient-specialist-white)" strokeWidth="1.5" />
              </svg>
              {isSidebarOpen && <span>Nutrient Categories</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
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
            <h1>Manage Nutrients</h1>
            <p>Create, edit, and manage nutrients for your baby's nutrition</p>
          </div>
        </div>

        <div className="management-container">
          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? 'Edit Nutrient' : 'Add New Nutrient'}</h2>
            </div>
            {categories.length === 0 && (
              <p className="no-results">No categories available. Please add a category first.</p>
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
                  disabled={categories.length === 0}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateNutrientHandler : createNutrientHandler}
                    disabled={loading || categories.length === 0}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{ scale: (loading || categories.length === 0) ? 1 : 1.05 }}
                    whileTap={{ scale: (loading || categories.length === 0) ? 1 : 0.95 }}
                  >
                    {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Nutrient' : 'Create Nutrient')}
                  </motion.button>
                  {isEditing && (
                    <motion.button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="cancel-button nutrient-specialist-button secondary"
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
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
                {nutrients.length} {nutrients.length === 1 ? 'nutrient' : 'nutrients'} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading nutrients...</p>
              </div>
            ) : nutrients.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3>No nutrients found</h3>
                <p>Create your first nutrient to get started</p>
              </div>
            ) : (
              <div className="nutrient-grid">
                {nutrients.map(nutrient => (
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
                        {categories.find(cat => cat.id === nutrient.categoryId)?.name || 'Unknown'}
                      </div>
                    </div>
                    <p className="card-description">
                      {nutrient.description || 'No description provided'}
                    </p>
                    <div className="card-meta">
                      <span className="unit">{nutrient.unit}</span>
                      {nutrient.imageUrl && (
                        <div className="image-preview">
                          <img src={nutrient.imageUrl} alt={nutrient.name} />
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
                      >
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => deleteNutrientHandler(nutrient.id)}
                        className="delete-button nutrient-specialist-button secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Delete ${nutrient.name}`}
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