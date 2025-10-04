import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { createCategory, getAllCategories, updateCategory, deleteCategory, getAllBlogs } from '../../apis/blog-api';
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/BlogCategoryManagement.css';

const BlogCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('');
  const [blogCategoryTag, setBlogCategoryTag] = useState('Nutrient');
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const categoriesPerPage = 6;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await getCurrentUser(token);
        const userData = userResponse.data.data || userResponse.data;
        if (userData && userData.roleId === 1) {
          setUser(userData);
        } else {
          throw new Error('Unauthorized access');
        }

        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const [categoriesResponse, blogsResponse] = await Promise.all([
          getAllCategories(token, { params: { t: Date.now() } }),
          getAllBlogs(token),
        ]);
        setCategories(categoriesResponse.data.data || []);
        setBlogs(blogsResponse.data.data || []);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message, err.response?.status);
        setError(err.response?.data?.message || 'Failed to fetch data. Please log in again.');
        localStorage.removeItem('token');
        navigate('/signin', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  useEffect(() => {
    if (!loading && categories.length > 0 && chartRef.current) {
      const categoryCounts = categories
        .map((category) => ({
          name: category.categoryName,
          count: blogs.filter((blog) => blog.categoryName === category.categoryName).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const labels = categoryCounts.map((item) => item.name);
      const counts = categoryCounts.map((item) => item.count);

      const changes = categoryCounts.map((item) => ({
        category: item.name,
        count: item.count,
      }));

      const ctx = chartRef.current.getContext('2d');

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Blogs per Category (Top 6)',
            data: counts,
            backgroundColor: 'rgba(32, 218, 204, 0.6)',
            borderColor: 'rgba(32, 218, 204, 1)',
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 20,
              bottom: 20,
              left: 10,
              right: 10,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Blogs',
                font: {
                  size: Math.min(16, window.innerWidth / 30),
                  weight: '500',
                },
                padding: { top: 10, bottom: 10 },
              },
              ticks: {
                stepSize: 1,
                font: {
                  size: Math.min(14, window.innerWidth / 35),
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Categories',
                font: {
                  size: Math.min(16, window.innerWidth / 30),
                  weight: '500',
                },
                padding: { top: 10, bottom: 10 },
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 6,
                maxRotation: 45,
                minRotation: 0,
                font: {
                  size: Math.min(12, window.innerWidth / 40),
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: Math.min(14, window.innerWidth / 35),
                },
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw} ${context.raw === 1 ? 'blog' : 'blogs'}`,
              },
            },
            title: {
              display: true,
              text: 'Top 6 Categories by Blog Count',
              font: {
                size: Math.min(18, window.innerWidth / 25),
                weight: '600',
              },
              padding: {
                top: 10,
                bottom: 20,
              },
              color: '#124966',
            },
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
  }, [categories, blogs, loading]);

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

    if (!/^[\w\s\-!@#$%^&*()_+=[\]{}|;:,.<>?]+$/.test(categoryName.trim())) {
      setError('Category name must contain only letters, numbers, spaces, or common special characters.');
      return;
    }

    if (!['Nutrient', 'Health'].includes(blogCategoryTag)) {
      setError('Invalid Blog Category Tag. Choose either Nutrient or Health.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await createCategory(user.id, categoryName.trim(), blogCategoryTag, token);
      setMessage(response.data.message || 'Category created successfully.');
      setCategoryName('');
      setBlogCategoryTag('Nutrient');
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
    setBlogCategoryTag(category.blogCategoryTag || 'Nutrient');
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

    if (!/^[\w\s\-!@#$%^&*()_+=[\]{}|;:,.<>?]+$/.test(categoryName.trim())) {
      setError('Category name must contain only letters, numbers, spaces, or common special characters.');
      return;
    }

    if (!['Nutrient', 'Health'].includes(blogCategoryTag)) {
      setError('Invalid Blog Category Tag. Choose either Nutrient or Health.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');
      const response = await updateCategory(editingCategory.id, categoryName.trim(), editingCategory.isActive, blogCategoryTag, token);
      setMessage(response.data.message || 'Category updated successfully.');
      setCategoryName('');
      setBlogCategoryTag('Nutrient');
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

  const filteredCategories = categories.filter((category) => {
    const matchesName = category.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = category.blogCategoryTag?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && category.isActive) ||
      (statusFilter === 'inactive' && !category.isActive);
    return (matchesName || matchesTag) && matchesStatus;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOption === 'name-asc') {
      return a.categoryName.localeCompare(b.categoryName);
    } else if (sortOption === 'name-desc') {
      return b.categoryName.localeCompare(b.categoryName);
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    try {
      if (user?.id) await logout(user.id);
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsSidebarOpen(window.innerWidth > 768);
      navigate('/signin', { replace: true });
    }
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
    hover: {
      scale: 1.1,
      filter: 'brightness(1.15)',
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const sidebarVariants = {
    open: {
      width: '240px',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      width: '56px',
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const notificationVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  if (loading) {
    return (
      <div className="blog-category-management">
        <motion.aside
          className="blog-category-management__sidebar"
          variants={sidebarVariants}
          animate={isSidebarOpen ? 'open' : 'closed'}
          initial={window.innerWidth > 768 ? 'open' : 'closed'}
        >
          <div className="blog-category-management__sidebar-header">
            <Link to="/admin" className="blog-category-management__logo" onClick={() => setIsSidebarOpen(true)}>
              <motion.div
                variants={logoVariants}
                animate="animate"
                whileHover="hover"
                className="blog-category-management__logo-svg-container"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Admin icon for admin panel">
                  <path
                    d="M3 9h18M9 3v18M3 15h18M6 12h12M12 3v18"
                    fill="var(--admin-accent)"
                    stroke="var(--admin-primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              {isSidebarOpen && <span>Admin Panel</span>}
            </Link>
            <motion.button
              className="blog-category-management__sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isSidebarOpen ? 'M13 18L7 12L13 6M18 18L12 12L18 6' : 'M6 18L12 12L6 6M11 18L17 12L11 6'}
                />
              </svg>
            </motion.button>
          </div>
        </motion.aside>
        <main className={`blog-category-management__content ${isSidebarOpen ? '' : 'closed'}`}>
          <div className="blog-category-management__loading-spinner">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="blog-category-management">
      <motion.aside
        className="blog-category-management__sidebar"
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={window.innerWidth > 768 ? 'open' : 'closed'}
      >
        <div className="blog-category-management__sidebar-header">
          <Link to="/admin" className="blog-category-management__logo" onClick={() => setIsSidebarOpen(true)}>
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="blog-category-management__logo-svg-container"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Admin icon for admin panel">
                <path
                  d="M3 9h18M9 3v18M3 15h18M6 12h12M12 3v18"
                  fill="var(--admin-accent)"
                  stroke="var(--admin-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Admin Panel</span>}
          </Link>
          <motion.button
            className="blog-category-management__sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--admin-background)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isSidebarOpen ? 'M13 18L7 12L13 6M18 18L12 12L18 6' : 'M6 18L12 12L6 6M11 18L17 12L11 6'}
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="blog-category-management__sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin" onClick={() => setIsSidebarOpen(true)} title="Dashboard">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/categories" onClick={() => setIsSidebarOpen(true)} title="Blog Categories">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10m-10 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Blog Categories</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/tutorial" onClick={() => setIsSidebarOpen(true)} title="Tutorial Management">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-6-6h12"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial Management</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/policy" onClick={() => setIsSidebarOpen(true)} title="Admin Policy">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v20m-8-4h16M4 6h16"
                />
              </svg>
              {isSidebarOpen && <span>Admin Policy</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/account-management" onClick={() => setIsSidebarOpen(true)} title="Account Management">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                />
              </svg>
              {isSidebarOpen && <span>Account Management</span>}
            </Link>
          </motion.div>
          {/* <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/system-configuration" onClick={() => setIsSidebarOpen(true)} title="System Configuration">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 0v-6m0 18v-6m6 0h6m-18 0H3"
                />
              </svg>
              {isSidebarOpen && <span>System Configuration</span>}
            </Link>
          </motion.div> */}
          <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
            <Link to="/admin/payment-management" onClick={() => setIsSidebarOpen(true)} title="Payment Management">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18v12H3zm4 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Payment Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item blog-category-management__admin-profile-section">
                <Link to="/profile" className="blog-category-management__admin-profile-info" title={isSidebarOpen ? user.email : ''}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="User icon for profile">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--admin-background)"
                    />
                  </svg>
                  {isSidebarOpen && <span className="blog-category-management__admin-profile-email">{user.email}</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
                <button className="blog-category-management__logout-button" onClick={handleLogout} aria-label="Sign out" title="Sign Out">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="var(--admin-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div variants={navItemVariants} className="blog-category-management__sidebar-nav-item">
              <Link to="/signin" onClick={() => setIsSidebarOpen(true)} title="Sign In">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <main className={`blog-category-management__content ${isSidebarOpen ? '' : 'closed'}`}>
        <AnimatePresence>
          {(message || error) && (
            <motion.div
              className={`blog-category-management__notification ${error ? 'error' : 'success'}`}
              variants={notificationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {message || error}
             
            </motion.div>
          )}
        </AnimatePresence>
        <motion.section
          className="blog-category-management__banner"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="blog-category-management__banner-content">
            <h1 className="blog-category-management__banner-title">Blog Category Management</h1>
            <p className="blog-category-management__banner-subtitle">
              Create, edit, and organize blog categories to streamline content management and enhance user experience.
            </p>
           
          </div>
          <motion.div
            className="blog-category-management__banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Blog category icon">
              <path
                d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10m-10 4h10m-10 4h10"
                fill="var(--admin-accent)"
                stroke="var(--admin-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.section>
        <motion.section
          className="blog-category-management__features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="blog-category-management__features-left">
            <motion.div variants={cardVariants} className="blog-category-management__feature-card">
              <form onSubmit={editingCategory ? handleUpdate : handleSubmit}>
                <div className="blog-category-management__form-group">
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
                <div className="blog-category-management__form-group">
                  <label htmlFor="blogCategoryTag">Blog Category Tag</label>
                  <select
                    id="blogCategoryTag"
                    value={blogCategoryTag}
                    onChange={(e) => setBlogCategoryTag(e.target.value)}
                    required
                  >
                    <option value="Nutrient">Nutrient</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                {editingCategory && (
                  <div className="blog-category-management__form-group blog-category-management__toggle-group">
                    <label className="blog-category-management__toggle-label" htmlFor="activeToggle">Active</label>
                    <div className="blog-category-management__toggle-switch">
                      <input
                        type="checkbox"
                        id="activeToggle"
                        checked={editingCategory.isActive}
                        onChange={() => toggleActiveStatus(editingCategory)}
                      />
                      <label htmlFor="activeToggle" className="blog-category-management__toggle-slider" />
                    </div>
                  </div>
                )}
                <div className="blog-category-management__form-actions">
                  <motion.button
                    type="submit"
                    className="blog-category-management__feature-link"
                    disabled={!user}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </motion.button>
                  {editingCategory && (
                    <motion.button
                      type="button"
                      className="blog-category-management__feature-link secondary"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryName('');
                        setBlogCategoryTag('Nutrient');
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
            </motion.div>
            <motion.div variants={cardVariants} className="blog-category-management__feature-card">
              <h3>Category Statistics</h3>
              <div className="blog-category-management__category-stats">
                <div className="blog-category-management__category-stat-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="var(--admin-accent)"/>
                  </svg>
                  <span className="blog-category-management__stat-label">Total Categories</span>
                  <span className="blog-category-management__stat-value">{categories.length}</span>
                </div>
                <div className="blog-category-management__category-stat-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="var(--admin-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="blog-category-management__stat-label">Active Categories</span>
                  <span className="blog-category-management__stat-value">{categories.filter(cat => cat.isActive).length}</span>
                </div>
                <div className="blog-category-management__category-stat-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="var(--admin-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="blog-category-management__stat-label">Inactive Categories</span>
                  <span className="blog-category-management__stat-value">{categories.filter(cat => !cat.isActive).length}</span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} className="blog-category-management__feature-card">
              <h3>All Categories</h3>
              <div className="blog-category-management__category-controls">
                <div className="blog-category-management__control-group">
                  <label htmlFor="searchQuery">Search by Name or Tag</label>
                  <input
                    type="text"
                    id="searchQuery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter category name or tag"
                  />
                </div>
                <div className="blog-category-management__control-group">
                  <label htmlFor="statusFilter">Filter by Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="blog-category-management__control-group">
                  <label htmlFor="sortOption">Sort By</label>
                  <select
                    id="sortOption"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="active-first">Active First</option>
                    <option value="inactive-first">Inactive First</option>
                  </select>
                </div>
              </div>
              {currentCategories.length === 0 ? (
                <p>No categories found.</p>
              ) : (
                <div className="blog-category-management__category-table">
                  <div className="blog-category-management__category-table-header">
                    <span>Name</span>
                    <span>Tag</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {currentCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      className="blog-category-management__category-table-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>{category.categoryName}</span>
                      <span>{category.blogCategoryTag || 'N/A'}</span>
                      <span>
                        <span
                          className="blog-category-management__status-dot"
                          style={{
                            backgroundColor: category.isActive ? '#20dacc' : '#e53e3e',
                          }}
                        />
                      </span>
                      <span className="blog-category-management__category-actions">
                        <motion.button
                          className="blog-category-management__category-action-button edit"
                          onClick={() => handleEdit(category)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="var(--admin-accent)"/>
                        </svg>
                        </motion.button>
                        <motion.button
                          className="blog-category-management__category-action-button delete"
                          onClick={() => handleDelete(category.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="var(--admin-logout)"/>
                          </svg>
                        </motion.button>
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="blog-category-management__pagination">
                  <motion.button
                    className="blog-category-management__pagination-button previous"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <motion.button
                      key={index + 1}
                      className={`blog-category-management__pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                  <motion.button
                    className="blog-category-management__pagination-button next"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </div>
              )}
            </motion.div>
          </div>
          <div className="blog-category-management__features-right">
            <motion.div variants={cardVariants} className="blog-category-management__feature-card">
              <h3>Top 6 Categories by Blog Count</h3>
              <div className="blog-category-management__chart-container">
                <canvas ref={chartRef} />
              </div>
              {chartChanges.length > 0 && (
                <div className="blog-category-management__chart-changes">
                  <h4>Top Category Blog Counts</h4>
                  {chartChanges.map((change, index) => (
                    <p key={index} className="blog-category-management__chart-change-item">
                      {change.category}: {change.count} {change.count === 1 ? 'blog' : 'blogs'}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default BlogCategoryManagement;