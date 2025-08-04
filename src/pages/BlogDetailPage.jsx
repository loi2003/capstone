import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllBlogs, deleteLike, deleteBookmark } from '../apis/blog-api';
import apiClient from '../apis/url-api';
import '../styles/BlogDetailPage.css';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('bookmarks')) || []);
  const [likes, setLikes] = useState(() => JSON.parse(localStorage.getItem('likes')) || []);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getAllBlogs(token);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        const selectedBlog = data.find(blog => blog.id.toString() === id.toString());
        if (!selectedBlog) {
          throw new Error('Blog not found');
        }
        setBlog(selectedBlog);
        setAllBlogs(data.filter(b => b.id !== selectedBlog.id && b.status?.toLowerCase() === 'approved'));
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err.message, err.response?.data);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, token]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('likes', JSON.stringify(likes));
  }, [bookmarks, likes]);

  useEffect(() => {
    if (blog?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % blog.images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [blog]);

  const toggleBookmark = async (blogId) => {
    if (!token) {
      setShowAuthPopup(true);
      return;
    }
    try {
      if (bookmarks.includes(String(blogId))) {
        const response = await deleteBookmark(blogId, token);
        if (response.status === 200) {
          setBookmarks(bookmarks.filter(id => id !== String(blogId)));
        }
      } else {
        const response = await apiClient.post(`/api/bookmark/toggle/${blogId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/plain',
          },
        });
        if (response.status === 200) {
          setBookmarks([...bookmarks, String(blogId)]);
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
      if (likes.includes(String(blogId))) {
        const response = await deleteLike(blogId, token);
        if (response.status === 200) {
          setLikes(likes.filter(id => id !== String(blogId)));
          setBlog(prev => ({ ...prev, likeCount: (prev.likeCount || 0) - 1 }));
        }
      } else {
        const response = await apiClient.post(`/api/like/toggle/${blogId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/plain',
          },
        });
        if (response.status === 200) {
          setLikes([...likes, String(blogId)]);
          setBlog(prev => ({ ...prev, likeCount: (prev.likeCount || 0) + 1 }));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error.response?.data?.message || error.message);
    }
  };

  const calculateReadingTime = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0;
    if (wordCount < 50) return 1;
    if (wordCount < 500) return 10;
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const getRelatedBlogs = () => {
    if (!blog?.tags || blog.tags.length === 0) return [];
    const related = allBlogs
      .filter(b => b.tags?.some(tag => blog.tags.includes(tag)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return related;
  };

  const relatedBlogs = getRelatedBlogs();

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !blog) {
    return (
      <div className="error-container">
        <h2>Blog Not Found</h2>
        <p>{error || 'The blog you are looking for does not exist.'}</p>
        <Link to="/blog" className="back-link">←</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
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
      <div className="blog-detail-container">
        <Link to="/blog" className="back-link">←</Link>
        <motion.div
          className="blog-detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="blog-detail-image-container">
            <img
              src={blog.images?.[currentImageIndex]?.fileUrl || '/assets/placeholder.jpg'}
              alt={blog.title}
              className={`blog-detail-image ${currentImageIndex !== null ? 'active' : ''}`}
              key={currentImageIndex}
            />
          </div>
          {blog.images?.length > 1 && (
            <div className="image-thumbnails">
              {blog.images.map((image, index) => (
                <img
                  key={index}
                  src={image.fileUrl || '/assets/placeholder.jpg'}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail-image ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                />
              ))}
            </div>
          )}
          <div className="blog-detail-meta">
            <span className="category">{blog.tags?.[0] || 'General'}</span>
            <span className="date">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="reading-time">{calculateReadingTime(blog.body)} min read</span>
            <span className="like-count">{blog.likeCount || 0} likes</span>
          </div>
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-tags">
            {(blog.tags || []).map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
          <div className="blog-detail-body">{blog.body}</div>
          <div className="blog-detail-author">
            <div
              className="author-image"
              style={{ backgroundImage: `url('/assets/author${(parseInt(id) % 6) + 1}.jpg')` }}
            ></div>
            <div className="author-info">
              <span className="author-name">By {blog.createdByUser?.userName || 'Unknown Author'}</span>
              <span className="author-bio">Published on {new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="blog-detail-actions">
            <button
              className={`bookmark-btn ${bookmarks.includes(String(blog.id)) ? 'bookmarked' : ''}`}
              onClick={() => toggleBookmark(blog.id)}
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
              className={`like-btn ${likes.includes(String(blog.id)) ? 'liked' : ''}`}
              onClick={() => toggleLike(blog.id)}
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
          {relatedBlogs.length > 0 && (
            <div className="related-blogs-section">
              <h2>Related Blogs</h2>
              <div className="related-blogs-grid">
                {relatedBlogs.map(relatedBlog => (
                  <Link
                    to={`/blog/${relatedBlog.id}`}
                    key={relatedBlog.id}
                    className="related-blog-card"
                  >
                    <img
                      src={relatedBlog.images?.[0]?.fileUrl || '/assets/placeholder.jpg'}
                      alt={relatedBlog.title}
                      className="related-blog-image"
                    />
                    <div className="related-blog-info">
                      <span className="related-blog-category">{relatedBlog.tags?.[0] || 'General'}</span>
                      <h3>{relatedBlog.title}</h3>
                      <span className="related-blog-date">
                        {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetailPage;