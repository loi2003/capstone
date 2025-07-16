import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllBlogs } from '../apis/blog-api';
import apiClient from '../apis/url-api';
import '../styles/BlogDetailPage.css';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
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
        // Optionally, use getBlogById if available (uncomment if implemented)
        // const response = await getBlogById(id, token);
        // setBlog(response.data?.data);
        
        // Current implementation using getAllBlogs
        const response = await getAllBlogs(token);
        console.log('API Response:', response.data); // Debug: Log API response
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log('Blog Data:', data); // Debug: Log blog data
        console.log('Searching for Blog ID:', id); // Debug: Log requested ID
        const selectedBlog = data.find(blog => blog.id.toString() === id.toString());
        if (!selectedBlog) {
          throw new Error('Blog not found');
        }
        setBlog(selectedBlog);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err.message, err.response?.data); // Debug: Log error details
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

  const shareBlog = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || 'Check out this blog!');
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
  if (error || !blog) {
    return (
      <div className="error-container">
        <h2>Blog Not Found</h2>
        <p>{error || 'The blog you are looking for does not exist.'}</p>
        <Link to="/blog" className="back-link">Back to Blogs</Link>
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
        <Link to="/blog" className="back-link">← Back to Blogs</Link>
        <motion.div
          className="blog-detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={blog.images?.[0]?.fileUrl || '/assets/placeholder.jpg'}
            alt={blog.title}
            className="blog-detail-image"
          />
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
            <span className="like-count">{getMockLikeCount()} likes</span>
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
              <span className="author-name">By {blog.author || 'Unknown Author'}</span>
              <span className="author-bio">Published on {new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="blog-detail-actions">
            <button
              className={`bookmark-btn ${bookmarks.includes(blog.id) ? 'bookmarked' : ''}`}
              onClick={() => toggleBookmark(blog.id)}
            >
              {bookmarks.includes(blog.id) ? '★' : '☆'}
            </button>
            <button
              className={`like-btn ${likes.includes(blog.id) ? 'liked' : ''}`}
              onClick={() => toggleLike(blog.id)}
            >
              {likes.includes(blog.id) ? '❤️' : '🤍'}
            </button>
            <div className="share-buttons">
              <button className="share-btn" onClick={() => shareBlog('twitter')}>
                <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.38 8.64 8.64 0 01-2.73 1.05A4.3 4.3 0 0016 4c-2.36 0-4.3 1.92-4.3 4.29 0 .34.04.67.11 1-3.57-.18-6.74-1.89-8.86-4.5a4.3 4.3 0 001.33 5.73 4.25 4.25 0 01-1.95-.54v.05c0 2.07 1.47 3.8 3.42 4.2a4.3 4.3 0 01-1.94.07c.55 1.72 2.14 2.97 4.02 3a8.61 8.61 0 01-5.33 1.83c-.35 0-.69-.02-1.03-.06 1.91 1.23 4.18 1.94 6.62 1.94 7.94 0 12.29-6.58 12.29-12.29 0-.19 0-.37-.01-.56.84-.61 1.57-1.36 2.14-2.22z" />
                </svg>
              </button>
              <button className="share-btn" onClick={() => shareBlog('facebook')}>
                <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.98h-2.54v-2.9h2.54v-2.21c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v6.98C18.34 21.13 22 16.99 22 12z" />
                </svg>
              </button>
              <button className="share-btn" onClick={() => shareBlog('linkedin')}>
                <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9.02h3.42v1.56h.05c.48-.91 1.65-1.87 3.39-1.87 3.62 0 4.29 2.39 4.29 5.49v6.25zM5.34 7.46c-1.14 0-2.06-.93-2.06-2.06 0-1.14.92-2.06 2.06-2.06s2.06.92 2.06 2.06c0 1.13-.92 2.06-2.06 2.06zm1.78 13h-3.56V9.02h3.56v11.43zM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetailPage;