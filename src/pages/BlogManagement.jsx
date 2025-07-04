  import React, { useState, useEffect, useRef } from 'react';
  import { motion } from 'framer-motion';
  import { useNavigate, useLocation } from 'react-router-dom';
  import Chart from 'chart.js/auto';
  import { getAllBlogs, getAllCategories } from '../apis/blog-api';
  import { getCurrentUser } from '../apis/authentication-api';
  import '../styles/BlogManagement.css';

  const BlogManagement = () => {
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOption, setSortOption] = useState('title-asc');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found. Please log in.');
          }

          const userResponse = await getCurrentUser();
          const userData = userResponse.data?.data || userResponse.data;
          if (userData?.id && [3, 4, 5].includes(Number(userData.roleId))) {
            setUser(userData);
          } else {
            throw new Error('Only Clinic, Health Expert, or Nutrient Specialist users can access this page.');
          }

          const [categoriesResponse, blogsResponse] = await Promise.all([
            getAllCategories(token),
            getAllBlogs(token),
          ]);

          const categoriesData = Array.isArray(categoriesResponse.data?.data)
            ? categoriesResponse.data.data
            : [];
          setCategories(categoriesData);
          if (categoriesData.length === 0) {
            setError('No categories available. Please create a category first.');
          }

          const blogsData = Array.isArray(blogsResponse.data?.data)
            ? blogsResponse.data.data
            : [];
          console.log('Blogs data:', blogsData);
          setBlogs(blogsData);
        } catch (err) {
          console.error('Fetch error:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Failed to fetch data. Please log in again.');
          localStorage.removeItem('token');
          navigate('/signin', { replace: true });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [navigate, location]);

    useEffect(() => {
      if (!loading && blogs.length > 0 && categories.length > 0 && chartRef.current) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const categoryCounts = categories.reduce((acc, category) => {
          acc[category.categoryName] = blogs.filter(
            (blog) => blog.categoryName === category.categoryName
          ).length;
          return acc;
        }, {});

        const labels = Object.keys(categoryCounts).filter((key) => categoryCounts[key] > 0);
        const data = labels.map((key) => categoryCounts[key]);
        const colors = labels.map((_, index) => `hsl(${(index * 137.5) % 360}, 70%, 60%)`);

        chartInstanceRef.current = new Chart(chartRef.current, {
          type: 'pie',
          data: {
            labels,
            datasets: [{ data, backgroundColor: colors, borderColor: '#ffffff', borderWidth: 2 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { font: { family: "'Inter', sans-serif", size: 14 }, color: '#124966', padding: 20 },
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { family: "'Inter', sans-serif", size: 14 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
              },
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
    }, [blogs, categories, loading]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, statusFilter, sortOption]);

    const openImageModal = (image, index, images) => {
      setSelectedImage({ image, images });
      setCurrentImageIndex(index);
    };

    const closeImageModal = () => {
      setSelectedImage(null);
      setCurrentImageIndex(0);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedImage.images.length - 1 : prev - 1));
    };

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev === selectedImage.images.length - 1 ? 0 : prev + 1));
    };

    const filteredBlogs = blogs.filter((blog) => {
      const matchesTitle = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && blog.status?.toLowerCase() === 'approved') ||
        (statusFilter === 'pending' && blog.status?.toLowerCase() === 'pending') ||
        (statusFilter === 'denied' && blog.status?.toLowerCase() === 'denied');
      return matchesTitle && matchesStatus;
    });

    const sortedBlogs = [...filteredBlogs].sort((a, b) => {
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      } else if (sortOption === 'approved-first') {
        return (b.status?.toLowerCase() === 'approved' ? 1 : 0) - (a.status?.toLowerCase() === 'approved' ? 1 : 0);
      } else if (sortOption === 'pending-first') {
        return (b.status?.toLowerCase() === 'pending' ? 1 : 0) - (a.status?.toLowerCase() === 'pending' ? 1 : 0);
      }
      return 0;
    });

    const indexOfLastBlog = currentPage * blogsPerPage;
    const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
    const currentBlogs = sortedBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
    const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);

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
      navigate('/clinic');
    };

    const handleAddBlog = () => {
      navigate('/blog-management/add');
    };

    if (loading) {
      return (
        <motion.div
          className="blog-management"
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
        className="blog-management"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <header className="blog-header">
          <motion.button
            className="blog-back-button"
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back to previous page"
          />
          <h1 className="blog-management-title">Blog Management</h1>
        </header>
        <div className="blog-content">
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
          <section className="blog-stats-section">
            <h2 className="blog-stats-title">Blog Statistics</h2>
            <motion.div
              className="blog-stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              role="region"
              aria-label="Blog statistics"
            >
              <div className="blog-stat-item">
                <span className="stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/>
                  </svg>
                </span>
                <span className="stat-label">Total Blogs</span>
                <span className="stat-value">{blogs.length}</span>
              </div>
              <div className="blog-stat-item">
                <span className="stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="stat-label">Approved Blogs</span>
                <span className="stat-value">{blogs.filter(blog => blog.status?.toLowerCase() === 'approved').length}</span>
              </div>
              <div className="blog-stat-item">
                <span className="stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="stat-label">Pending Blogs</span>
                <span className="stat-value">{blogs.filter(blog => blog.status?.toLowerCase() === 'pending').length}</span>
              </div>
            </motion.div>
          </section>
          <section className="blog-add-section">
            <motion.button
              className="blog-add-button"
              onClick={handleAddBlog}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Add new blog"
            >
              Add Blog
            </motion.button>
          </section>
          <section className="blog-list-section">
            <h2 className="blog-list-title">All Blogs</h2>
            <motion.section
              className="blog-controls-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              role="search"
              aria-label="Search and filter blogs"
              aria-controls="blog-table"
            >
              <div className="control-group">
                <label htmlFor="searchQuery">Search by Title</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter blog title"
                  aria-label="Search blogs by title"
                />
              </div>
              <div className="control-group">
                <label htmlFor="statusFilter">Filter by Status</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter blogs by status"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
              <div className="control-group">
                <label htmlFor="sortOption">Sort By</label>
                <select
                  id="sortOption"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Sort blogs"
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="approved-first">Approved First</option>
                  <option value="pending-first">Pending First</option>
                </select>
              </div>
            </motion.section>
            {currentBlogs.length === 0 ? (
              <p>No blogs found.</p>
            ) : (
              <div className="blog-table" id="blog-table">
                <div className="blog-table-header">
                  <span>Title</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Images</span>
                </div>
                {currentBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    className="blog-table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>{blog.title}</span>
                    <span>{blog.categoryName || 'Uncategorized'}</span>
                    <span>
                      <motion.span
                        className="status-dot"
                        title={blog.status || 'Pending'}
                        style={{
                          backgroundColor:
                            blog.status?.toLowerCase() === 'approved'
                              ? '#34C759'
                              : blog.status?.toLowerCase() === 'denied'
                              ? '#FF3B30'
                              : '#FBC107',
                        }}
                        whileHover={{ scale: 1.2, boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
                      />
                    </span>
                    <span className="blog-images">
                      {blog.images?.length > 0 ? (
                        blog.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.fileUrl || ''}
                            alt={image.fileName || 'Blog image'}
                            className="blog-image"
                            onClick={() => openImageModal(image, index, blog.images)}
                            onError={() => console.error(`Failed to load image: ${image.fileUrl}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                openImageModal(image, index, blog.images);
                              }
                            }}
                          />
                        ))
                      ) : (
                        <span className="text-gray-500">No images</span>
                      )}
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
          <section className="blog-chart-section">
            <h2 className="blog-chart-title">Blog Distribution by Category</h2>
            <div className="chart-container">
              <canvas ref={chartRef} />
            </div>
          </section>
        </div>
        {selectedImage && (
          <div className="blog-image-modal">
            <motion.div
              className="blog-image-modal-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="blog-image-modal-close"
                onClick={closeImageModal}
                aria-label="Close image modal"
              >
                ×
              </button>
              {selectedImage.images.length > 1 && (
                <>
                  <button
                    className="blog-image-modal-nav prev"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    className="blog-image-modal-nav next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
              <img
                src={selectedImage.images[currentImageIndex].fileUrl || ''}
                alt={selectedImage.images[currentImageIndex].fileName || 'Blog image'}
                onError={() => console.error(`Failed to load modal image: ${selectedImage.images[currentImageIndex].fileUrl}`)}
              />
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  };

  export default BlogManagement;