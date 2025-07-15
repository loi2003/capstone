import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllBlogs } from '../apis/blog-api';
import apiClient from '../apis/url-api';
import '../styles/BlogPage.css';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks')) || []);
  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem('likes')) || []);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const postsPerPage = 6;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
    console.log(blogs);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [bookmarks, likes]);

  const categories = ['All', ...new Set(blogs.flatMap(blog => blog.tags || []))];

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterBlogs(term, selectedCategory, sortOption);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterBlogs(searchTerm, category, sortOption);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortOption(sort);
    filterBlogs(searchTerm, selectedCategory, sort);
    setCurrentPage(1);
  };

  const filterBlogs = (term, category, sort) => {
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
    if (sort === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'title') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    setFilteredBlogs(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    filterBlogs('', selectedCategory, sortOption);
    setCurrentPage(1);
  };

  const toggleBookmark = async (blogId) => {
    if (!token) {
      setShowAuthPopup(true);
      return;
    }
    try {
      const response = await apiClient.post(`/api/bookmark/toggle/${blogId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      });
      if (response.status === 200) {
        if (bookmarks.includes(blogId)) {
          setBookmarks(bookmarks.filter(id => id !== blogId));
        } else {
          setBookmarks([...bookmarks, blogId]);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error.response?.data?.message || error.message);
    }
  };

  const toggleLike = async (blogId) => {
    if (!token) {
      setShowAuthPopup(true);
      return;
    }
    try {
      const response = await apiClient.post(`/api/like/toggle/${blogId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      });
      if (response.status === 200) {
        if (likes.includes(blogId)) {
          setLikes(likes.filter(id => id !== blogId));
        } else {
          setLikes([...likes, blogId]);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error.response?.data?.message || error.message);
    }
  };

  const shareBlog = (platform, blog) => {
    const url = encodeURIComponent(window.location.href + `/blog/${blog.id}`);
    const text = encodeURIComponent(blog.title);
    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text ? text.split(/\s+/).length : 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getMockLikeCount = () => {
    return Math.floor(Math.random() * 100) + 1; // Mock like count
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const featured = blogs[0];

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

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

  // Category data
  const categoryData = [
    { name: 'DESIGN', count: 12, color: '#D53F8C' },
    { name: 'GRAPHIC', count: 6, color: '#6B46C1' },
    { name: 'ILLUSTRATOR', count: 15, color: '#3182CE' },
    { name: 'TYPOGRAPHY', count: 8, color: '#48BB78' },
  ];

  // Trending posts data
  const trendingPosts = [
    {
      id: 1,
      category: 'DESIGN',
      title: 'Designers In Residence Explores Mental Health In...',
      date: '02/11/2020',
      icon: '/assets/trending-icon1.jpg',
    },
    {
      id: 2,
      category: 'GRAPHIC',
      title: 'New Trends in Graphic Design for 2025',
      date: '01/15/2025',
      icon: '/assets/trending-icon2.jpg',
    },
    {
      id: 3,
      category: 'ILLUSTRATOR',
      title: 'Mastering Vector Art with Adobe Illustrator',
      date: '12/20/2024',
      icon: '/assets/trending-icon3.jpg',
    },
    {
      id: 4,
      category: 'TYPOGRAPHY',
      title: 'The Art of Modern Typography',
      date: '11/05/2024',
      icon: '/assets/trending-icon4.jpg',
    },
  ];

  return (
    <div className="blog-page">
      {showAuthPopup && (
        <div className="auth-popup">
          <div className="auth-popup-content">
            <h3>Please Log In</h3>
            <p>You need to be logged in to bookmark or like a post.</p>
            <div className="auth-popup-buttons">
              <button
                className="auth-popup-btn"
                onClick={() => navigate('/signin')}
              >
                Sign In
              </button>
              <button
                className="auth-popup-btn"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
              <button
                className="auth-popup-close"
                onClick={() => setShowAuthPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="main-content">
        {/* Trending Posts Carousel */}
        <div className="trending-posts-section">
          <h2>TRENDING POSTS</h2>
          <div className="trending-carousel">
            {trendingPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="trending-item"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <span className="trending-number">{index + 1}</span>
                <img src={post.icon} alt={post.title} className="trending-icon" />
                <div className="trending-info">
                  <span className="trending-category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <div className="trending-meta">
                    <span className="date">{post.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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

        {/* Filter + Search + Sort */}
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
            <select className="sort-select" value={sortOption} onChange={handleSortChange}>
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="title">Sort by: Title</option>
            </select>
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
          {currentPosts.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card-link">
              <motion.div
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
                    <span className="reading-time">{calculateReadingTime(blog.body)} min read</span>
                    <span className="like-count">{getMockLikeCount()} likes</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className={`bookmark-btn ${bookmarks.includes(blog.id) ? 'bookmarked' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookmark(blog.id);
                      }}
                    >
                      {bookmarks.includes(blog.id) ? '★' : '☆'}
                    </button>
                    <button
                      className={`like-btn ${likes.includes(blog.id) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLike(blog.id);
                      }}
                    >
                      {likes.includes(blog.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button
            className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
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