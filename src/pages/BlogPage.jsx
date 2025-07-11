import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllBlogs } from '../apis/blog-api';
import '../styles/BlogPage.css';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getAllBlogs(token);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setBlogs(data);
        setFilteredBlogs(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [token]);

  const categories = ['All', ...new Set(blogs.flatMap(blog => blog.tags || []))];

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterBlogs(term, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterBlogs(searchTerm, category);
  };

  const filterBlogs = (term, category) => {
    let filtered = blogs;
    if (term) {
      filtered = filtered.filter(
        blog =>
          blog.title.toLowerCase().includes(term) ||
          blog.body?.toLowerCase().includes(term)
      );
    }
    if (category !== 'All') {
      filtered = filtered.filter(blog => blog.tags?.includes(category));
    }
    setFilteredBlogs(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    filterBlogs('', selectedCategory);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const featured = blogs[0];

  // Raw data for top authors
  const rawAuthors = [
    { author: 'John Doe', imageUrl: '/assets/author1.jpg', count: 15 },
    { author: 'Jane Smith', imageUrl: '/assets/author2.jpg', count: 12 },
    { author: 'Alex Brown', imageUrl: '/assets/author3.jpg', count: 10 },
    { author: 'Emily Davis', imageUrl: '/assets/author4.jpg', count: 8 },
    { author: 'Michael Lee', imageUrl: '/assets/author5.jpg', count: 6 },
    { author: 'Sarah Wilson', imageUrl: '/assets/author6.jpg', count: 5 },
  ];

  // Randomly select up to 5 authors
  const randomAuthors = [];
  while (randomAuthors.length < Math.min(5, rawAuthors.length)) {
    const randomIndex = Math.floor(Math.random() * rawAuthors.length);
    const author = rawAuthors[randomIndex];
    if (!randomAuthors.some(a => a.author === author.author)) {
      randomAuthors.push(author);
    }
  }

  // Category data from the image
  const categoryData = [
    { name: 'DESIGN', count: 12, color: '#D53F8C' },
    { name: 'GRAPHIC', count: 6, color: '#6B46C1' },
    { name: 'ILLUSTRATOR', count: 15, color: '#3182CE' },
    { name: 'TYPOGRAPHY', count: 8, color: '#48BB78' },
  ];

  return (
    <div className="blog-page">
      <div className="main-content">
        {/* Design Elements */}
        <div className="design-section">
          <div className="design-card">
            <img src="/assets/design-icon1.jpg" alt="Designers in Residence" className="card-icon" />
            <div className="card-info">
              <span className="card-category">DESIGN</span>
              <h3>Designers in Residence Explores Mental Health in Black British...</h3>
              <div className="card-meta">
                <span className="author">Minta Busson</span>
                <span className="date">02/11/2020</span>
              </div>
            </div>
          </div>
          <div className="design-card">
            <img src="/assets/design-icon2.jpg" alt="Government Seeks Expressions" className="card-icon" />
            <div className="card-info">
              <span className="card-category">DESIGN</span>
              <h3>Government Seeks Expressions Of Interest For Design Of £5m...</h3>
              <div className="card-meta">
                <span className="author">Minta Busson</span>
                <span className="date">10/09/2020</span>
              </div>
            </div>
          </div>
          <div className="design-card">
            <img src="/assets/trending-icon1.jpg" alt="Designers in Residence" className="card-icon" />
            <div className="card-info">
              <span className="card-category">DESIGN</span>
              <h3>Designers in Residence Explores Mental Health in...</h3>
              <div className="card-meta">
                <span className="date">02/11/2020</span>
              </div>
            </div>
          </div>
          <div className="design-card">
            <img src="/assets/trending-icon2.jpg" alt="Metus Sapien Ut Nunc" className="card-icon" />
            <div className="card-info">
              <span className="card-category">DESIGN</span>
              <h3>Metus Sapien Ut Nunc Vestibulum Ante Ipsum...</h3>
              <div className="card-meta">
                <span className="date">15/07/2020</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="filter-section">
          <div className="filter-search-container">
            <span className="filter-label">Filter by:</span>
            <div className="category-filters">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="search-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="search-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-btn" onClick={clearSearch}>
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banner */}
        {featured && (
          <div className="header-banner">
            <img
              src={featured.images?.[0]?.fileUrl || '/assets/placeholder.jpg'}
              alt={featured.title}
              className="banner-image"
            />
            <div className="banner-content">
              <span className="banner-tag">Latest</span>
              <h1>{featured.title}</h1>
              <p>Before you make your first purchase...</p>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="blog-grid">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              className="blog-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-image">
                <img
                  src={blog.images?.[0]?.fileUrl || '/assets/placeholder.jpg'}
                  alt={blog.title}
                  className="card-img"
                />
              </div>
              <div className="card-content">
                <h3>{blog.title}</h3>
                <p>{blog.body?.slice(0, 150)}...</p>
                <div className="card-tags">
                  {(blog.tags || []).map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="card-meta">
                  <span className="date">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="category">{blog.tags?.[0] || 'General'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Authors */}
        <div className="top-authors-section">
          <h2>Top Authors</h2>
          <div className="author-gallery">
            {randomAuthors.map((author, index) => (
              <div key={index} className="author-card">
                <div className="author-image" style={{ backgroundImage: `url(${author.imageUrl || '/assets/placeholder.jpg'})` }}></div>
                <div className="author-info">
                  <span className="author-name">{author.author}</span>
                  <span className="author-count">{author.count} blogs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sidebar">
        {/* Categories Section */}
        <div className="categories-section">
          <h2>CATEGORIES</h2>
          {categoryData.map((category, index) => (
            <div key={index} className="category-item" style={{ backgroundColor: category.color }}>
              <span>{category.name}</span>
              <span className="category-count">{category.count}</span>
            </div>
          ))}
        </div>
        {/* Trending Post Section */}
        <div className="trending-section">
          <h2>TRENDING POST</h2>
          <div className="trending-item">
            <span className="trending-number">1</span>
            <img src="/assets/trending-icon1.jpg" alt="Trending Post" className="trending-icon" />
            <div className="trending-info">
              <span className="trending-category">DESIGN</span>
              <h3>Designers In Residence Explores Mental Health In...</h3>
              <div className="trending-meta">
                <span className="date">02/11/2020</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;