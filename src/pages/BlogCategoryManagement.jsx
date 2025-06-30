import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import { getCurrentUser } from '../apis/authentication-api';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../apis/blog-api';
import '../styles/BlogCategoryManagement.css';

const BlogCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await getCurrentUser();
        console.log('User response:', userResponse.data);
        setUser(userResponse.data.data || userResponse.data);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
        console.log('Initial categories:', categoriesResponse.data);
        setCategories(categoriesResponse.data.data || []);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message, err.response?.status);
        setError(err.message || 'Failed to fetch data. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && chartRef.current) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const filteredCategories = categories.filter((cat) => {
        const createdAt = new Date(cat.createdAt || Date.now());
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      });

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const categoryCounts = Array(daysInMonth).fill(0);
      filteredCategories.forEach((cat) => {
        const day = new Date(cat.createdAt || Date.now()).getDate() - 1;
        categoryCounts[day]++;
      });

      const labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
      const ctx = chartRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Categories Added',
            data: categoryCounts,
            backgroundColor: 'rgba(52, 199, 89, 0.6)',
            borderColor: 'rgba(52, 199, 89, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Number of Categories' } },
            x: { title: { display: true, text: `Days in ${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}` } },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [categories, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(categoryName)) {
      setError('Category name must be alphanumeric');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await createCategory(user.id, categoryName, token);
      console.log('Create response:', response.data);
      setMessage(response.data.message || 'Category created successfully');
      setCategoryName('');

      const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
      console.log('Categories after create:', categoriesResponse.data);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setMessage('');
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(categoryName)) {
      setError('Category name must be alphanumeric');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await updateCategory(editingCategory.id, categoryName, editingCategory.isActive, token);
      console.log('Update response:', response.data);
      setMessage(response.data.message || 'Category updated successfully');
      setCategoryName('');
      setEditingCategory(null);

      const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
      console.log('Categories after update:', categoriesResponse.data);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      // Optimistic update: Remove the category from the state immediately
      console.log('Attempting to delete category with ID:', categoryId);
      setCategories((prevCategories) => {
        const updatedCategories = prevCategories.filter((category) => category.id !== categoryId);
        console.log('Optimistic update - categories after removal:', updatedCategories);
        return updatedCategories;
      });

      // Perform the delete operation
      const response = await deleteCategory(categoryId, token);
      console.log('Delete API response:', response.data);

      // Set success message
      setMessage(response.data.message || 'Category deleted successfully');

      // Fetch the updated category list with a retry mechanism
      let categoriesResponse;
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
          console.log('Categories after delete (from API):', categoriesResponse.data);
          setCategories(categoriesResponse.data.data || []);
          success = true;
        } catch (fetchErr) {
          retryCount++;
          console.warn(`Retry ${retryCount}/${maxRetries} - Error fetching categories:`, fetchErr.response?.data || fetchErr.message);
          if (retryCount === maxRetries) {
            throw new Error('Failed to fetch updated categories after deletion.');
          }
          // Wait briefly before retrying
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Log the final state for debugging
      console.log('Final categories state:', categoriesResponse.data.data);
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to delete category. Please try again.');

      // Re-fetch categories to restore the correct state
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
          console.log('Categories after error recovery:', categoriesResponse.data);
          setCategories(categoriesResponse.data.data || []);
        }
      } catch (fetchErr) {
        console.error('Error fetching categories after delete failure:', fetchErr.response?.data || fetchErr.message);
        setError('Failed to refresh categories. Please reload>the page.');
      }
    }
  };

  const toggleActiveStatus = (category) => {
    setEditingCategory({ ...category, isActive: !category.isActive });
  };

  if (loading) {
    return (
      <motion.div
        className="category-management"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-spinner">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="category-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity:  1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <header className="category-header">
        <h1 className="category-management-title">Blog Category Management</h1>
      </header>
      <div className="category-content">
        <motion.section
          className="category-form-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={editingCategory ? handleUpdate : handleSubmit}>
            <div className="form-group">
              <label htmlFor="categoryName">Category Name</label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                placeholder="Enter category name"
              />
            </div>
            {editingCategory && (
              <div className="form-group toggle-group">
                <label className="toggle-label">Active</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="activeToggle"
                    checked={editingCategory.isActive}
                    onChange={() => toggleActiveStatus(editingCategory)}
                  />
                  <label htmlFor="activeToggle" className="toggle-slider" />
                </div>
              </div>
            )}
            <div className="form-actions">
              <motion.button
                type="submit"
                className="category-submit-button"
                disabled={!user}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </motion.button>
              {editingCategory && (
                <motion.button
                  type="button"
                  className="category-cancel-button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName('');
                    setMessage('');
                    setError('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.section>
        {message && (
          <motion.p
            className="success-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}
        {error && (
          <motion.p
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        <section className="category-list-section">
          <h2 className="category-list-title">All Categories</h2>
          {categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div className="category-table">
              <div className="category-table-header">
                <span>Name</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  className="category-table-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{category.categoryName}</span>
                  <span>
                    <motion.span
                      className="status-dot"
                      title={category.isActive ? 'Active' : 'Inactive'}
                      style={{
                        backgroundColor: category.isActive ? '#34C759' : '#FF3B30',
                      }}
                      whileHover={{ scale: 1.2, boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
                    />
                  </span>
                  <span className="category-actions">
                    <motion.button
                      className="category-action-button edit"
                      onClick={() => handleEdit(category)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
                    </motion.button>
                    <motion.button
                      className="category-action-button delete"
                      onClick={() => handleDelete(category.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                      </svg>
                    </motion.button>
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </section>
        <section className="category-chart-section">
          <h2 className="category-chart-title">Categories Added This Month</h2>
          <div className="chart-container">
            <canvas ref={chartRef} />
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default BlogCategoryManagement;