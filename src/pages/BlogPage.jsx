import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllBlogs, getAllLikedBlogs, getAllBookmarkedBlogs, deleteLike, deleteBookmark } from '../apis/blog-api';
import apiClient from '../apis/url-api';
import '../styles/BlogPage.css';
import ChatBoxPage from '../components/chatbox/ChatBoxPage';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const postsPerPage = 6;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const placeholderImages = [
    'src/assets/parenting-in-pictures.svg',
    'src/assets/due-date-calculator.svg',
    'src/assets/find-a-health-service.svg',
    'src/assets/parenting-in-pictures.svg',
  ];

  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  const aboutpageData = {
    hero: {
      image: 'src/assets/tpm_nov24_feature_pregnancy_1-intro.jpg' || getRandomPlaceholder(),
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blogResponse = await getAllBlogs(token);
        const approvedBlogs = Array.isArray(blogResponse.data?.data)
          ? blogResponse.data.data
              .filter(blog => blog.status?.toLowerCase() === 'approved')
              .map(blog => ({
                ...blog,
                id: blog.blogId || blog.id,
                createdAt: blog.creationDate || blog.createdAt
              }))
          : [];
        setBlogs(approvedBlogs);
        setFilteredBlogs(approvedBlogs);
        console.log('Approved blogs:', approvedBlogs);

        if (token) {
          const likedResponse = await getAllLikedBlogs(token);
          const likedBlogIds = Array.isArray(likedResponse.data?.data)
            ? likedResponse.data.data.map(blog => String(blog.blogId || blog.id))
            : [];
          setLikes(likedBlogIds);
          console.log('Liked blog IDs:', likedBlogIds);

          const bookmarkedResponse = await getAllBookmarkedBlogs(token);
          const bookmarkedBlogIds = Array.isArray(bookmarkedResponse.data?.data)
            ? bookmarkedResponse.data.data.map(blog => String(blog.blogId || blog.id))
            : [];
          setBookmarks(bookmarkedBlogIds);
          console.log('Bookmarked blog IDs:', bookmarkedBlogIds);
        } else {
          setLikes([]);
          setBookmarks([]);
          localStorage.removeItem('bookmarks');
          localStorage.removeItem('likes');
          console.log('No token, cleared bookmarks and likes');
        }

        if (approvedBlogs.length === 0) {
          setError('No approved blogs available.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err.response?.status, err.response?.data, err.message);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      localStorage.setItem('likes', JSON.stringify(likes));
    } else {
      localStorage.removeItem('bookmarks');
      localStorage.removeItem('likes');
    }
    console.log('Updated localStorage - Bookmarks:', bookmarks, 'Likes:', likes);
  }, [bookmarks, likes, token]);

  const colors = ['#D53F8C', '#6B46C1', '#3182CE', '#48BB78', '#ED8936'];
  const tagCounts = blogs
    .flatMap(blog => blog.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
  const categoryData = Object.entries(tagCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([name, count], index) => ({
      name: name.toUpperCase(),
      count,
      color: colors[index % colors.length],
    }));

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
    } else if (sort === 'most-liked') {
      filtered = filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }
    setFilteredBlogs(filtered);
    console.log('Filtered blogs:', filtered);
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
      if (bookmarks.includes(String(blogId))) {
        const response = await deleteBookmark(blogId, token);
        if (response.status === 200) {
          setBookmarks(prevBookmarks => prevBookmarks.filter(id => id !== String(blogId)));
          setActionError(null);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } else {
        const response = await apiClient.post(`/api/bookmark/toggle/${blogId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/plain',
          },
        });
        if (response.status === 200) {
          setBookmarks(prevBookmarks => [...prevBookmarks, String(blogId)]);
          setActionError(null);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error.response?.status, error.response?.data, error.message);
      setActionError('Failed to toggle bookmark. Please try again.');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const toggleLike = async (blogId) => {
    if (!token) {
      setShowAuthPopup(true);
      return;
    }
    try {
      if (likes.includes(String(blogId))) {
        const response = await deleteLike(blogId, token);
        if (response.status === 200) {
          setLikes(prevLikes => prevLikes.filter(id => id !== String(blogId)));
          setBlogs(prevBlogs =>
            prevBlogs.map(blog =>
              String(blog.id) === String(blogId)
                ? { ...blog, likeCount: (blog.likeCount || 0) - 1 }
                : blog
            )
          );
          setFilteredBlogs(prevFiltered =>
            prevFiltered.map(blog =>
              String(blog.id) === String(blogId)
                ? { ...blog, likeCount: (blog.likeCount || 0) - 1 }
                : blog
            )
          );
          setActionError(null);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } else {
        const response = await apiClient.post(`/api/like/toggle/${blogId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/plain',
          },
        });
        if (response.status === 200) {
          setLikes(prevLikes => [...prevLikes, String(blogId)]);
          setBlogs(prevBlogs =>
            prevBlogs.map(blog =>
              String(blog.id) === String(blogId)
                ? { ...blog, likeCount: (blog.likeCount || 0) + 1 }
                : blog
            )
          );
          setFilteredBlogs(prevFiltered =>
            prevFiltered.map(blog =>
              String(blog.id) === String(blogId)
                ? { ...blog, likeCount: (blog.likeCount || 0) + 1 }
                : blog
            )
          );
          setActionError(null);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error.response?.status, error.response?.data, error.message);
      setActionError('Failed to toggle like. Please try again.');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const calculateReadingTime = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    if (wordCount < 50) return 1;
    if (wordCount < 500) return 10;
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleViewBookmarks = () => {
    setShowBookmarkPopup(true);
  };

  const handleBookmarkClick = (blogId) => {
    setShowBookmarkPopup(false);
    navigate(`/blog/${blogId}`);
  };

  if (loading) return <div className="blog-page__loading">Loading...</div>;
  if (error) return <div className="blog-page__error">Error: {error}</div>;

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

  const topAuthors = Object.entries(
    blogs.reduce((acc, blog) => {
      const author = blog.createdByUser?.userName || 'Unknown Author';
      if (!acc[author]) {
        acc[author] = { postCount: 0, totalLikes: 0 };
      }
      acc[author].postCount += 1;
      acc[author].totalLikes += blog.likeCount || 0;
      return acc;
    }, {})
  )
    .map(([author, { postCount, totalLikes }]) => ({
      author,
      postCount,
      totalLikes,
      score: postCount * 100 + totalLikes,
      imageUrl: `/assets/author${(Math.abs(author.charCodeAt(0)) % 6) + 1}.jpg`
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bookmarkedBlogs = blogs.filter(blog => bookmarks.includes(String(blog.id)));
  console.log('Bookmarked blogs for popup:', bookmarkedBlogs);

  const recentPosts = blogs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map(blog => ({
      id: String(blog.id),
      category: blog.tags?.[0] || '',
      title: blog.title,
      date: new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      icon: blog.images?.[0]?.fileUrl || getRandomPlaceholder(),
    }));

  const popularPosts = blogs
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 6)
    .map(blog => ({
      id: String(blog.id),
      title: blog.title,
      image: blog.images?.[0]?.fileUrl || getRandomPlaceholder(),
      date: new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      category: blog.tags?.[0] || '',
      likeCount: blog.likeCount || 0,
    }));

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/newsletter/subscribe', { email });
      setSubscriptionStatus('Successfully subscribed to the newsletter!');
      setEmail('');
      setTimeout(() => setSubscriptionStatus(null), 3000);
    } catch (error) {
      console.error('Newsletter error:', error.response?.status, error.response?.data, error.message);
      setSubscriptionStatus('Failed to subscribe. Please try again.');
      setTimeout(() => setSubscriptionStatus(null), 3000);
    }
  };

  return (
    <div className="blog-page" style={{ marginTop: '68px' }}>
      {showAuthPopup && (
        <div className="blog-page__auth-popup">
          <div className="blog-page__auth-popup-content">
            <h3>Please Log In</h3>
            <p>You need to be logged in to bookmark or like a post.</p>
            <div className="blog-page__auth-popup-buttons">
              <button className="blog-page__auth-popup-btn" onClick={() => navigate('/signin')}>
                Sign In
              </button>
              <button className="blog-page__auth-popup-btn" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
              <button className="blog-page__auth-popup-close" onClick={() => setShowAuthPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookmarkPopup && (
        <div className="blog-page__bookmark-popup">
          <div className="blog-page__bookmark-popup-content">
            <h3>Your Bookmarks</h3>
            <p>View your saved blogs below.</p>
            {bookmarkedBlogs.length > 0 ? (
              bookmarkedBlogs.map(blog => (
                <div
                  key={String(blog.id)}
                  className="blog-page__bookmark-item"
                  onClick={() => handleBookmarkClick(blog.id)}
                >
                  <img
                    src={blog.images?.[0]?.fileUrl || getRandomPlaceholder()}
                    alt={blog.title}
                    className="blog-page__bookmark-image"
                  />
                  <div className="blog-page__bookmark-info">
                    <h4>{blog.title}</h4>
                    <span className="blog-page__bookmark-date">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No bookmarks yet.</p>
            )}
            <button
              className="blog-page__bookmark-popup-close"
              onClick={() => setShowBookmarkPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="blog-page__error" style={{ position: 'fixed', top: '88px', right: '20px', background: '#e53e3e', color: '#fff', padding: '10px 20px', borderRadius: '5px', zIndex: 1000 }}>
          {actionError}
        </div>
      )}

      <div className="blog-page__main-content">
        <section className="blog-intro-section" style={{ backgroundImage: `url(${aboutpageData.hero.image})` }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="blog-intro-overlay"
          ></motion.div>
          <div className="blog-intro-tags">
            {categories.filter(cat => cat !== 'All').map((tag, index) => (
              <span key={index} className="blog-intro-tag">{tag}</span>
            ))}
          </div>
        </section>

        <div className="blog-page__recent-posts-section">
          <h2>RECENT POSTS</h2>
          <div className="blog-page__recent-carousel">
            {recentPosts.map((post, index) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="blog-page__recent-item-link">
                <motion.div
                  className="blog-page__recent-item"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <span className="blog-page__recent-number">{index + 1}</span>
                  <img src={post.icon} alt={post.title} className="blog-page__recent-icon" />
                  <div className="blog-page__recent-info">
                    <span className="blog-page__recent-category">{post.category}</span>
                    <h3>{post.title}</h3>
                    <div className="blog-page__recent-meta">
                      <span className="blog-page__date">{post.date}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="blog-page__popular-posts-section">
          <h2>POPULAR POSTS</h2>
          <div className="blog-page__popular-grid">
            {popularPosts.map((post, index) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="blog-page__popular-item-link">
                <motion.div
                  className="blog-page__popular-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="blog-page__popular-image-wrapper">
                    <img src={post.image} alt={post.title} className="blog-page__popular-image" />
                    <div className="blog-page__popular-overlay">
                      <span className="blog-page__popular-category">{post.category}</span>
                    </div>
                  </div>
                  <div className="blog-page__popular-info">
                    <h3>{post.title}</h3>
                    <span className="blog-page__popular-date">{post.date}</span>
                    <span className="blog-page__popular-like-count">{post.likeCount} likes</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="blog-page__filter-section">
          <div className="blog-page__filter-search-container">
            <span className="blog-page__filter-label">Filter by:</span>
            <div className="blog-page__category-filters">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className={`blog-page__category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="blog-page__search-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="blog-page__search-icon"
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
                className="blog-page__search-input"
              />
              {searchTerm && (
                <button className="blog-page__clear-btn" onClick={clearSearch}>
                  ×
                </button>
              )}
            </div>
            <select className="blog-page__sort-select" value={sortOption} onChange={handleSortChange}>
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="title">Sort by: Title</option>
              <option value="most-liked">Sort by: Most Liked</option>
            </select>
          </div>
        </div>

        {filteredBlogs[0] && (
          <div className="blog-page__header-banner">
            <img
              src={filteredBlogs[0].images?.[0]?.fileUrl || getRandomPlaceholder()}
              alt={filteredBlogs[0].title}
              className="blog-page__banner-image"
            />
            <div className="blog-page__banner-content">
              <span className="blog-page__banner-tag">Latest</span>
              <h1>{filteredBlogs[0].title}</h1>
            </div>
          </div>
        )}

        <div className="blog-page__blog-grid">
          {currentPosts.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={String(blog.id)} className="blog-page__blog-card-link">
              <motion.div
                className="blog-page__blog-card"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="blog-page__card-image">
                  <img
                    src={blog.images?.[0]?.fileUrl || getRandomPlaceholder()}
                    alt={blog.title}
                    className="blog-page__card-img"
                  />
                </div>
                <div className="blog-page__card-content">
                  <h3>{blog.title}</h3>
                  <p>{blog.body?.slice(0, 150)}...</p>
                  <div className="blog-page__card-tags">
                    {(blog.tags || []).map((tag, i) => (
                      <span key={i} className="blog-page__tag">{tag}</span>
                    ))}
                  </div>
                  <div className="blog-page__card-meta">
                    <span className="blog-page__date">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="blog-page__category">{blog.tags?.[0] || ''}</span>
                    <span className="blog-page__reading-time">{calculateReadingTime(blog.body)} min read</span>
                    <span className="blog-page__like-count">{blog.likeCount || 0} likes</span>
                  </div>
                  <div className="blog-page__card-actions">
                    <button
                      className={`blog-page__bookmark-btn ${bookmarks.includes(String(blog.id)) ? 'bookmarked' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleBookmark(blog.id);
                      }}
                    >
                      <svg viewBox="0 0 24 24">
                        {bookmarks.includes(String(blog.id)) ? (
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                        ) : (
                          <path d="M5 3v18l7-5 7 5V3H5zm2 2h10v13l-5-3.5-5 3.5V5z"/>
                        )}
                      </svg>
                    </button>
                    <button
                      className={`blog-page__like-btn ${likes.includes(String(blog.id)) ? 'liked' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLike(blog.id);
                      }}
                    >
                      <svg viewBox="0 0 24 24">
                        {likes.includes(String(blog.id)) ? (
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                        ) : (
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="blog-page__pagination">
          <button
            className={`blog-page__page-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="blog-page__page-info">Page {currentPage} of {totalPages}</span>
          <button
            className={`blog-page__page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div className="blog-page__top-authors-section">
          <h2>Top Authors</h2>
          <div className="blog-page__author-gallery">
            {topAuthors.map((author, index) => (
              <div key={index} className="blog-page__author-card">
                <div className="blog-page__author-image" style={{ backgroundImage: `url(${author.imageUrl || getRandomPlaceholder()})` }}></div>
                <div className="blog-page__author-info">
                  <span className="blog-page__author-name">{author.author}</span>
                  <span className="blog-page__author-count">{author.postCount} blogs, {author.totalLikes} likes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="blog-page__newsletter-section">
          <h2>STAY UPDATED</h2>
          <p>Subscribe to our newsletter for the latest blog updates and exclusive content.</p>
          <form className="blog-page__newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="blog-page__newsletter-input"
              required
            />
            <button type="submit" className="blog-page__newsletter-btn">Subscribe</button>
          </form>
          {subscriptionStatus && (
            <p className={`blog-page__subscription-status ${subscriptionStatus.includes('Failed') ? 'error' : 'success'}`}>
              {subscriptionStatus}
            </p>
          )}
        </div>
      </div>

      <div className="blog-page__sidebar">
        <div className="blog-page__categories-section">
          <h2>CATEGORIES</h2>
          {categoryData.length > 0 ? (
            categoryData.map((category, index) => (
              <div key={index} className="blog-page__category-item" style={{ backgroundColor: category.color }}>
                <span>{category.name}</span>
                <span className="blog-page__category-count">{category.count}</span>
              </div>
            ))
          ) : (
            <div className="blog-page__category-item" style={{ backgroundColor: '#e2e8f0' }}>
              <span>No Tags Available</span>
              <span className="blog-page__category-count">0</span>
            </div>
          )}
        </div>

        <div className="blog-page__recent-section">
          <h2>RECENT POST</h2>
          {recentPosts.length > 0 ? (
            <div className="blog-page__recent-item">
              <span className="blog-page__recent-number">1</span>
              <img src={recentPosts[0].icon} alt={recentPosts[0].title} className="blog-page__recent-icon" />
              <div className="blog-page__recent-info">
                <span className="blog-page__recent-category">{recentPosts[0].category}</span>
                <h3>{recentPosts[0].title}</h3>
                <div className="blog-page__recent-meta">
                  <span className="blog-page__date">{recentPosts[0].date}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="blog-page__recent-item">
              <span>No recent posts available</span>
            </div>
          )}
        </div>

        <div className="blog-page__bookmarks-section">
          <h2>YOUR BOOKMARKS</h2>
          <button className="blog-page__bookmarks-btn" onClick={handleViewBookmarks}>
            View Bookmarks
          </button>
        </div>
      </div>

      <motion.div
        className="contact-icon"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPopupOpen(!isPopupOpen)}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </motion.div>

      <ChatBoxPage isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};

export default BlogPage;