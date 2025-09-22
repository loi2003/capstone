import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllBlogs, deleteLike, deleteBookmark } from "../apis/blog-api";
import apiClient from "../apis/url-api";
import "../styles/BlogDetailPage.css";
import parentingInPictures from "../assets/parenting-in-pictures.svg";

// React Icons imports
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaBook,
  FaHeart,
  FaBookmark,
  FaUser,
  FaTags,
  FaEye,
  FaShare,
  FaClock,
} from "react-icons/fa";

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState(
    () => JSON.parse(localStorage.getItem("bookmarks")) || []
  );
  const [likes, setLikes] = useState(
    () => JSON.parse(localStorage.getItem("likes")) || []
  );
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [actionError, setActionError] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const placeholderImages = [
    parentingInPictures,
  ];
  
  const getRandomPlaceholder = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await getAllBlogs(token);
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const selectedBlog = data.find(
          (blog) => blog.id.toString() === id.toString()
        );

        if (!selectedBlog) {
          throw new Error("Blog not found");
        }

        // Ensure images is an array, even if empty
        selectedBlog.images = Array.isArray(selectedBlog.images)
          ? selectedBlog.images
          : [];
        setBlog(selectedBlog);
        setAllBlogs(
          data.filter(
            (b) =>
              b.id !== selectedBlog.id && b.status?.toLowerCase() === "approved"
          )
        );
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err.message, err.response?.data);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, token]);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("likes", JSON.stringify(likes));
  }, [bookmarks, likes]);

  useEffect(() => {
    if (blog?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % blog.images.length);
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
      setActionError(null);
      if (bookmarks.includes(String(blogId))) {
        const response = await deleteBookmark(blogId, token);
        if (response.status === 200) {
          setBookmarks(bookmarks.filter((id) => id !== String(blogId)));
        }
      } else {
        const response = await apiClient.post(
          `/api/bookmark/toggle/${blogId}`,
          null,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "text/plain" },
          }
        );
        if (response.status === 200) {
          setBookmarks([...bookmarks, String(blogId)]);
        }
      }
    } catch (error) {
      console.error(
        "Error toggling bookmark:",
        error.response?.data?.message || error.message
      );
      setActionError("Failed to toggle bookmark. Please try again.");
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const toggleLike = async (blogId) => {
    if (!token) {
      setShowAuthPopup(true);
      return;
    }

    try {
      setActionError(null);
      if (likes.includes(String(blogId))) {
        const response = await deleteLike(blogId, token);
        if (response.status === 200) {
          setLikes(likes.filter((id) => id !== String(blogId)));
          setBlog((prev) => ({
            ...prev,
            likeCount: (prev.likeCount || 0) - 1,
          }));
        }
      } else {
        const response = await apiClient.post(
          `/api/like/toggle/${blogId}`,
          null,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "text/plain" },
          }
        );
        if (response.status === 200) {
          setLikes([...likes, String(blogId)]);
          setBlog((prev) => ({
            ...prev,
            likeCount: (prev.likeCount || 0) + 1,
          }));
        }
      }
    } catch (error) {
      console.error(
        "Error toggling like:",
        error.response?.data?.message || error.message
      );
      setActionError("Failed to toggle like. Please try again.");
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

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const getRelatedBlogs = () => {
    if (!blog?.tags || blog.tags.length === 0) return [];
    const related = allBlogs
      .filter((b) => b.tags?.some((tag) => blog.tags.includes(tag)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return related;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.body?.slice(0, 150),
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const relatedBlogs = getRelatedBlogs();

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", marginRight: "10px" }}
            >
              ⟳
            </motion.div>
            Loading article for you...
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          <div className="blog-detail-error">
            <h2>Article Not Found</h2>
            <p>{error || "The blog you are looking for does not exist."}</p>
            <Link to="/blog" className="error-back-link">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blog-detail-page">
        <div className="blog-detail-container">
          {/* Enhanced Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/blog" className="blog-detail-back-link">
              <FaArrowLeft />
              <span>Back to Blog</span>
            </Link>
          </motion.div>

          {/* Enhanced Blog Content */}
          <motion.article
            className="blog-detail-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Blog Header */}
            <header className="blog-detail-header">
              <div className="blog-detail-meta-top">
                {blog.tags && blog.tags.length > 0 && (
                  <div className="blog-detail-tags">
                    <FaTags className="meta-icon" />
                    {blog.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="blog-detail-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h1 className="blog-detail-title">{blog.title}</h1>

              <div className="blog-detail-meta">
                <div className="blog-detail-meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span>
                    {new Date(
                      blog.createdAt || blog.creationDate
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="blog-detail-meta-item">
                  <FaClock className="meta-icon" />
                  <span>{calculateReadingTime(blog.body)} min read</span>
                </div>
                <div className="blog-detail-meta-item">
                  <FaHeart className="meta-icon" />
                  <span>{blog.likeCount || 0} likes</span>
                </div>
                {/* <div className="blog-detail-meta-item">
                  <FaEye className="meta-icon" />
                  <span>
                    {blog.viewCount || Math.floor(Math.random() * 1000)} views
                  </span>
                </div> */}
              </div>
            </header>

            {/* Enhanced Image Section */}
            {(blog.image || blog.images?.length > 0) && (
              <div className="blog-detail-image-section">
                <div className="blog-detail-image-container">
                  <img
                    src={
                      blog.images && blog.images.length > 0
                        ? blog.images[currentImageIndex]
                        : blog.image || getRandomPlaceholder()
                    }
                    alt={blog.title}
                    className="blog-detail-image"
                    onError={(e) => {
                      e.target.src = getRandomPlaceholder();
                    }}
                  />
                </div>

                {blog.images?.length > 1 && (
                  <div className="image-thumbnails">
                    {blog.images.map((img, index) => (
                      <motion.img
                        key={index}
                        src={img}
                        alt={`${blog.title} ${index + 1}`}
                        className={`thumbnail-image ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onError={(e) => {
                          e.target.src = getRandomPlaceholder();
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Blog Body */}
            <div className="blog-detail-body">
              <p>{blog.body}</p>
            </div>

            {/* Enhanced Author Section */}
            {blog.author && (
              <div className="blog-detail-author">
                <div className="author-avatar">
                  <FaUser />
                </div>
                <div className="author-info">
                  <h3 className="author-name">{blog.author}</h3>
                  <p className="author-bio">
                    Healthcare Writer & Pregnancy Expert
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="blog-detail-actions">
              <div className="action-buttons-left">
                <motion.button
                  className={`action-btn bookmark-btn ${
                    bookmarks.includes(String(blog.id)) ? "bookmarked" : ""
                  }`}
                  onClick={() => toggleBookmark(blog.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Bookmark this article"
                >
                  <FaBookmark />
                  <span>
                    {bookmarks.includes(String(blog.id))
                      ? "Bookmarked"
                      : "Bookmark"}
                  </span>
                </motion.button>

                <motion.button
                  className={`action-btn like-btn ${
                    likes.includes(String(blog.id)) ? "liked" : ""
                  }`}
                  onClick={() => toggleLike(blog.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Like this article"
                >
                  <FaHeart />
                  <span>{blog.likeCount || 0}</span>
                </motion.button>

                <motion.button
                  className="action-btn share-btn"
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share this article"
                >
                  <FaShare />
                  <span>Share</span>
                </motion.button>
              </div>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {actionError && (
                <motion.div
                  className="action-error"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {actionError}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>

          {/* Enhanced Related Blogs Section */}
          {relatedBlogs.length > 0 && (
            <motion.section
              className="related-blogs-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2>Related Articles</h2>
              <div className="related-blogs-grid">
                {relatedBlogs.map((relatedBlog, index) => (
                  <motion.div
                    key={relatedBlog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      to={`/blog/${relatedBlog.id}`}
                      className="related-blog-card"
                    >
                      <div className="related-blog-image-wrapper">
                        <img
                          src={relatedBlog.image || getRandomPlaceholder()}
                          alt={relatedBlog.title}
                          className="related-blog-image"
                          onError={(e) => {
                            e.target.src = getRandomPlaceholder();
                          }}
                        />
                        {relatedBlog.tags && relatedBlog.tags[0] && (
                          <div className="related-blog-category">
                            {relatedBlog.tags[0]}
                          </div>
                        )}
                      </div>
                      <div className="related-blog-info">
                        <h3>{relatedBlog.title}</h3>
                        <div className="related-blog-meta">
                          <span className="related-blog-date">
                            <FaCalendarAlt />
                            {new Date(
                              relatedBlog.createdAt || relatedBlog.creationDate
                            ).toLocaleDateString()}
                          </span>
                          <span className="related-blog-likes">
                            <FaHeart />
                            {relatedBlog.likeCount || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>

      {/* Enhanced Auth Popup */}
      <AnimatePresence>
        {showAuthPopup && (
          <motion.div
            className="auth-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="auth-popup-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3>Sign In Required</h3>
              <p>You need to be logged in to bookmark or like articles.</p>
              <div className="auth-popup-buttons">
                <Link to="/signin" className="auth-popup-btn">
                  Sign In
                </Link>
                <Link to="/signup" className="auth-popup-btn">
                  Sign Up
                </Link>
                <button
                  className="auth-popup-close"
                  onClick={() => setShowAuthPopup(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BlogDetailPage;
