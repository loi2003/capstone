import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { createCategory, getAllCategories, updateCategory, deleteCategory } from '../../apis/blog-api';
import { getCurrentUser } from '../../apis/authentication-api';
import '../../styles/BlogCategoryManagement.css';

const BlogCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [chartChanges, setChartChanges] = useState([]);
  const categoriesPerPage = 6;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();
 const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await getCurrentUser(token);
        setUser(userResponse.data.data || userResponse.data);

        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
        setCategories(categoriesResponse.data.data || []);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message, err.response?.status);
        setError(err.response?.data?.message || 'Failed to fetch data. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && categories.length > 0 && chartRef.current) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Get the last 3 months (including current month)
      const months = [];
      const categoryCounts = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        months.push(monthName);

        // Filter categories for this month
        const filteredCategories = categories.filter((cat) => {
          const createdAt = new Date(cat.createdAt || Date.now());
          return createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
        });
        categoryCounts.push(filteredCategories.length);
      }

      // Calculate increase/decrease
      const changes = [];
      for (let i = 1; i < categoryCounts.length; i++) {
        const diff = categoryCounts[i] - categoryCounts[i - 1];
        const monthName = months[i];
        changes.push({
          month: monthName,
          diff: diff >= 0 ? `+${diff}` : `${diff}`,
        });
      }

      const ctx = chartRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
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
            y: { 
              beginAtZero: true, 
              title: { display: true, text: 'Number of Categories' },
              ticks: { stepSize: 1 },
            },
            x: { title: { display: true, text: 'Months' } },
          },
          plugins: {
            legend: { display: true, position: 'top' },
          },
        },
      });

      setChartChanges(changes);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [categories, loading]);

  // Reset currentPage to 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOption]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(categoryName)) {
      setError('Category name must be alphanumeric.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await createCategory(user.id, categoryName, token);
      setMessage(response.data.message || 'Category created successfully.');
      setCategoryName('');
      setCurrentPage(1);

      const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Create error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to create category.');
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
      setError('Category name must be alphanumeric.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await updateCategory(editingCategory.id, categoryName, editingCategory.isActive, token);
      setMessage(response.data.message || 'Category updated successfully.');
      setCategoryName('');
      setEditingCategory(null);

      const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId));

      const response = await deleteCategory(categoryId, token);
      setMessage(response.data.message || 'Category deleted successfully.');

      let categoriesResponse;
      let retryCount = 0;
      const maxRetries = 3;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
          setCategories(categoriesResponse.data.data || []);
          success = true;
        } catch (fetchErr) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to fetch updated categories after deletion.');
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      const totalPages = Math.ceil(categoriesResponse.data.data.length / categoriesPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      } else if (totalPages === 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message, err.response?.status);
      setError(err.response?.data?.message || 'Failed to delete category. Please try again.');

      try {
        const token = localStorage.getItem('token');
        if (token) {
          const categoriesResponse = await getAllCategories(token, { params: { t: Date.now() } });
          setCategories(categoriesResponse.data.data || []);
        }
      } catch (fetchErr) {
        setError('Failed to refresh categories. Please reload the page.');
      }
    }
  };

  const toggleActiveStatus = (category) => {
    setEditingCategory({ ...category, isActive: !category.isActive });
  };

  // Filter and sort categories
  const filteredCategories = categories.filter((category) => {
    const matchesName = category.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && category.isActive) ||
      (statusFilter === 'inactive' && !category.isActive);
    return matchesName && matchesStatus;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOption === 'name-asc') {
      return a.categoryName.localeCompare(b.categoryName);
    } else if (sortOption === 'name-desc') {
      return b.categoryName.localeCompare(a.categoryName);
    } else if (sortOption === 'active-first') {
      return b.isActive - a.isActive;
    } else if (sortOption === 'inactive-first') {
      return a.isActive - b.isActive;
    }
    return 0;
  });

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = sortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);
  const totalPages = Math.ceil(sortedCategories.length / categoriesPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    try {
      navigate(-1);
    } catch (navError) {
      console.error('Navigation error:', navError);
      setError('Unable to navigate back. Please try navigating manually.');
      navigate('/dashboard');
    }
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <header className="category-header">
        <motion.button
          className="category-back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back to previous page"
        />
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
            <div className={editingCategory ? 'form-group-inline' : 'form-group'}>
              <div className="input-group">
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
                  <label className="toggle-label" htmlFor="activeToggle">Active</label>
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
            </div>
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
        <section className="category-stats-section">
          <h2 className="category-stats-title">Category Statistics</h2>
          <motion.div
            className="category-stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="region"
            aria-label="Category statistics"
          >
            <div className="category-stat-item">
              <span className="stat-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/>
                </svg>
              </span>
              <span className="stat-label">Total Categories</span>
              <span className="stat-value">{categories.length}</span>
            </div>
            <div className="category-stat-item">
              <span className="stat-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span className="stat-label">Active Categories</span>
              <span className="stat-value">{categories.filter(cat => cat.isActive).length}</span>
            </div>
            <div className="category-stat-item">
              <span className="stat-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span className="stat-label">Inactive Categories</span>
              <span className="stat-value">{categories.filter(cat => !cat.isActive).length}</span>
            </div>
          </motion.div>
        </section>
        <section className="category-list-section">
          <h2 className="category-list-title">All Categories</h2>
          <motion.section
            className="category-controls-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="search"
            aria-label="Search and filter categories"
            aria-controls="category-table"
          >
            <div className="control-group">
              <label htmlFor="searchQuery">Search by Name</label>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter category name"
                aria-label="Search categories by name"
              />
            </div>
            <div className="control-group">
              <label htmlFor="statusFilter">Filter by Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter categories by active status"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="sortOption">Sort By</label>
              <select
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort categories"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="active-first">Active First</option>
                <option value="inactive-first">Inactive First</option>
              </select>
            </div>
          </motion.section>
          {currentCategories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <div className="category-table" id="category-table">
              <div className="category-table-header">
                <span>Name</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {currentCategories.map((category) => (
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
                      aria-label={`Edit category ${category.categoryName}`}
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
                      aria-label={`Delete category ${category.categoryName}`}
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
          {totalPages > 1 && (
            <div className="pagination">
              <motion.button
                className="pagination-button previous"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Go to previous page"
              />
              {Array.from({ length: totalPages }, (_, index) => (
                <motion.button
                  key={index + 1}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Go to page ${index + 1}`}
                >
                  {index + 1}
                </motion.button>
              ))}
              <motion.button
                className="pagination-button next"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Go to next page"
              />
            </div>
          )}
        </section>
        <section className="category-chart-section">
          <h2 className="category-chart-title">Categories Added (Last 3 Months)</h2>
          <div className="chart-container">
            <canvas ref={chartRef} />
          </div>
          {chartChanges.length > 0 && (
            <motion.div
              className="chart-changes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              role="region"
              aria-label="Category changes over the last three months"
            >
              <h3 className="chart-changes-title">Monthly Changes</h3>
              {chartChanges.map((change, index) => (
                <p key={index} className="chart-change-item">
                  {change.month}: {change.diff} {Math.abs(change.diff) === 1 ? 'category' : 'categories'}
                </p>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default BlogCategoryManagement;