import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllBlogs, 
  getAllLikedBlogs, 
  getAllBookmarkedBlogs, 
  deleteLike, 
  deleteBookmark 
} from "../apis/blog-api";
import apiClient from "../apis/url-api";
import "../styles/BlogPage.css";
import ChatBoxPage from "../components/chatbox/ChatBoxPage";

// React Icons imports
import { 
  FaCalendarAlt, 
  FaBook, 
  FaHeart, 
  FaSearch, 
  FaTimes,
  FaBookmark,
  FaComments
} from "react-icons/fa";

const BlogPage = () => {
  // State management
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const postsPerPage = 6;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Enhanced placeholder images
  const placeholderImages = [
    "src/assets/parenting-in-pictures.svg",
    "src/assets/due-date-calculator.svg",
    "src/assets/find-a-health-service.svg",
    "src/assets/pregnancy-tracker.svg",
  ];

  const getRandomPlaceholder = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  }, [placeholderImages]);

  // Enhanced data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const blogResponse = await getAllBlogs(token);
        const approvedBlogs = Array.isArray(blogResponse.data?.data)
          ? blogResponse.data.data
              .filter((blog) => blog.status?.toLowerCase() === "approved")
              .map((blog) => ({
                ...blog,
                id: blog.blogId || blog.id,
                createdAt: blog.creationDate || blog.createdAt,
                likeCount: blog.likeCount || 0,
                viewCount: blog.viewCount || 0,
              }))
          : [];

        setBlogs(approvedBlogs);
        setFilteredBlogs(approvedBlogs);

        if (token) {
          try {
            const [likedResponse, bookmarkedResponse] = await Promise.all([
              getAllLikedBlogs(token),
              getAllBookmarkedBlogs(token),
            ]);

            const likedBlogIds = Array.isArray(likedResponse.data?.data)
              ? likedResponse.data.data.map((blog) =>
                  String(blog.blogId || blog.id)
                )
              : [];

            const bookmarkedBlogIds = Array.isArray(
              bookmarkedResponse.data?.data
            )
              ? bookmarkedResponse.data.data.map((blog) =>
                  String(blog.blogId || blog.id)
                )
              : [];

            setLikes(likedBlogIds);
            setBookmarks(bookmarkedBlogIds);
          } catch (userError) {
            console.warn("Error fetching user interactions:", userError);
          }
        } else {
          setLikes([]);
          setBookmarks([]);
        }

        if (approvedBlogs.length === 0) {
          setError("No approved blogs available.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Enhanced category management with colors
  const categoryData = useMemo(() => {
    const colors = ["#04668D", "#02808F", "#00A996", "#03C39A", "#F0F3BE"];
    const tagCounts = blogs
      .flatMap((blog) => blog.tags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([name, count], index) => ({
        name: name.toUpperCase(),
        count,
        color: colors[index % colors.length],
      }));
  }, [blogs]);

  const categories = useMemo(
    () => ["All", ...new Set(blogs.flatMap((blog) => blog.tags || []))],
    [blogs]
  );

  // Blog statistics
  const blogStats = useMemo(() => {
    const totalBlogs = blogs.length;
    const totalLikes = blogs.reduce(
      (sum, blog) => sum + (blog.likeCount || 0),
      0
    );
    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.viewCount || 0),
      0
    );
    const uniqueCategories = new Set(blogs.flatMap((blog) => blog.tags || []))
      .size;

    return {
      totalBlogs,
      totalLikes,
      totalViews,
      uniqueCategories,
    };
  }, [blogs]);

  // Enhanced filtering and sorting
  const filterBlogs = useCallback(
    (term, category, sort) => {
      let filtered = [...blogs];

      if (term) {
        filtered = filtered.filter(
          (blog) =>
            blog.title?.toLowerCase().includes(term) ||
            blog.body?.toLowerCase().includes(term) ||
            blog.tags?.some((tag) => tag.toLowerCase().includes(term))
        );
      }

      if (category !== "All") {
        filtered = filtered.filter((blog) => blog.tags?.includes(category));
      }

      switch (sort) {
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "title":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "most-liked":
          filtered.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
          break;
        case "most-viewed":
          filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        default:
          break;
      }

      setFilteredBlogs(filtered);
    },
    [blogs]
  );

  // Event handlers
  const handleSearch = useCallback(
    (e) => {
      const term = e.target.value.toLowerCase();
      setSearchTerm(term);
      filterBlogs(term, selectedCategory, sortOption);
      setCurrentPage(1);
    },
    [filterBlogs, selectedCategory, sortOption]
  );

  const handleCategoryFilter = useCallback(
    (category) => {
      setSelectedCategory(category);
      filterBlogs(searchTerm, category, sortOption);
      setCurrentPage(1);
    },
    [filterBlogs, searchTerm, sortOption]
  );

  const handleSortChange = useCallback(
    (e) => {
      const sort = e.target.value;
      setSortOption(sort);
      filterBlogs(searchTerm, selectedCategory, sort);
      setCurrentPage(1);
    },
    [filterBlogs, searchTerm, selectedCategory]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    filterBlogs("", selectedCategory, sortOption);
    setCurrentPage(1);
  }, [filterBlogs, selectedCategory, sortOption]);

  // Enhanced bookmark functionality
  const toggleBookmark = useCallback(
    async (blogId) => {
      if (!token) {
        setShowAuthPopup(true);
        return;
      }

      try {
        setActionError(null);
        const isBookmarked = bookmarks.includes(String(blogId));

        if (isBookmarked) {
          const response = await deleteBookmark(blogId, token);
          if (response.status === 200) {
            setBookmarks((prev) => prev.filter((id) => id !== String(blogId)));
          }
        } else {
          const response = await apiClient.post(
            `/api/bookmark/toggle/${blogId}`,
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "text/plain",
              },
            }
          );
          if (response.status === 200) {
            setBookmarks((prev) => [...prev, String(blogId)]);
          }
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error);
        setActionError("Failed to toggle bookmark. Please try again.");
        setTimeout(() => setActionError(null), 3000);
      }
    },
    [token, bookmarks]
  );

  // Enhanced like functionality
  const toggleLike = useCallback(
    async (blogId) => {
      if (!token) {
        setShowAuthPopup(true);
        return;
      }

      try {
        setActionError(null);
        const isLiked = likes.includes(String(blogId));

        if (isLiked) {
          const response = await deleteLike(blogId, token);
          if (response.status === 200) {
            setLikes((prev) => prev.filter((id) => id !== String(blogId)));
            setBlogs((prev) =>
              prev.map((blog) =>
                String(blog.id) === String(blogId)
                  ? {
                      ...blog,
                      likeCount: Math.max((blog.likeCount || 0) - 1, 0),
                    }
                  : blog
              )
            );
            setFilteredBlogs((prev) =>
              prev.map((blog) =>
                String(blog.id) === String(blogId)
                  ? {
                      ...blog,
                      likeCount: Math.max((blog.likeCount || 0) - 1, 0),
                    }
                  : blog
              )
            );
          }
        } else {
          const response = await apiClient.post(
            `/api/like/toggle/${blogId}`,
            null,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "text/plain",
              },
            }
          );
          if (response.status === 200) {
            setLikes((prev) => [...prev, String(blogId)]);
            setBlogs((prev) =>
              prev.map((blog) =>
                String(blog.id) === String(blogId)
                  ? { ...blog, likeCount: (blog.likeCount || 0) + 1 }
                  : blog
              )
            );
            setFilteredBlogs((prev) =>
              prev.map((blog) =>
                String(blog.id) === String(blogId)
                  ? { ...blog, likeCount: (blog.likeCount || 0) + 1 }
                  : blog
              )
            );
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        setActionError("Failed to toggle like. Please try again.");
        setTimeout(() => setActionError(null), 3000);
      }
    },
    [token, likes]
  );

  // Enhanced reading time calculation
  const calculateReadingTime = useCallback((text) => {
    if (!text) return 1;
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 50) return 1;
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  // Enhanced newsletter subscription
  const handleNewsletterSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email.trim()) return;

      setIsSubscribing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSubscriptionStatus("Successfully subscribed to our newsletter!");
        setEmail("");
      } catch (error) {
        setSubscriptionStatus("Failed to subscribe. Please try again.");
      } finally {
        setIsSubscribing(false);
        setTimeout(() => setSubscriptionStatus(null), 5000);
      }
    },
    [email]
  );

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  // Recent posts for sidebar
  const recentPosts = useMemo(
    () =>
      blogs
        .slice(0, 5)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [blogs]
  );

  // Loading state
  if (loading) {
    return (
      <div className="blog-page">
        <div className="blog-page__container">
          <div className="blog-page__loading">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ display: "inline-block", marginRight: "10px" }}
            >
              ⟳
            </motion.div>
            Loading amazing content for you...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blog-page">
        <div className="blog-page__container">
          {/* Enhanced Header Section */}
          <motion.header
            className="blog-page__header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="blog-page__header-content">
              <h1 className="blog-page__title">Blog & Community</h1>
              <p className="blog-page__subtitle">
                Your trusted source for pregnancy guidance, expert advice, and
                inspiring stories from fellow mothers on their journey to
                parenthood.
              </p>

              <div className="blog-page__stats">
                <div className="blog-page__stat-item">
                  <span className="blog-page__stat-number">
                    {blogStats.totalBlogs}
                  </span>
                  <span className="blog-page__stat-label">Articles</span>
                </div>
                <div className="blog-page__stat-item">
                  <span className="blog-page__stat-number">
                    {blogStats.uniqueCategories}
                  </span>
                  <span className="blog-page__stat-label">Categories</span>
                </div>
                <div className="blog-page__stat-item">
                  <span className="blog-page__stat-number">
                    {blogStats.totalLikes}
                  </span>
                  <span className="blog-page__stat-label">Likes</span>
                </div>
                <div className="blog-page__stat-item">
                  <span className="blog-page__stat-number">
                    {blogStats.totalViews > 0 ? blogStats.totalViews : "1.2K"}
                  </span>
                  <span className="blog-page__stat-label">Readers</span>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Enhanced Filter Section */}
          <motion.section
            className="blog-page__filter-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="blog-page__filter-container">
              {/* Search and Sort Row */}
              <div className="blog-page__search-row">
                <div className="blog-page__search-container">
                  <FaSearch className="blog-page__search-icon" />
                  <input
                    type="text"
                    className="blog-page__search-input"
                    placeholder="Search articles, topics, or keywords..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {searchTerm && (
                    <button className="blog-page__clear-btn" onClick={clearSearch}>
                      <FaTimes />
                    </button>
                  )}
                </div>

                <select
                  className="blog-page__sort-select"
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Alphabetical</option>
                  <option value="most-liked">Most Liked</option>
                  <option value="most-viewed">Most Viewed</option>
                </select>
              </div>

              {/* Category Filter Row */}
              <div className="blog-page__category-row">
                <span className="blog-page__filter-label">Categories:</span>
                <div className="blog-page__category-filters">
                  {categories.slice(0, 8).map((category, index) => (
                    <motion.button
                      key={category}
                      className={`blog-page__category-btn ${
                        selectedCategory === category ? "active" : ""
                      }`}
                      onClick={() => handleCategoryFilter(category)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {category}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Error Display */}
          <AnimatePresence>
            {actionError && (
              <motion.div
                className="blog-page__error"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {actionError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Layout */}
          <div className="blog-page__content">
            {/* Main Blog Grid */}
            <main className="blog-page__main-content">
              {error ? (
                <div className="blog-page__error">{error}</div>
              ) : (
                <>
                  <div className="blog-page__blog-grid">
                    <AnimatePresence mode="wait">
                      {currentPosts.map((blog, index) => (
                        <motion.div
                          key={blog.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -10 }}
                        >
                          <Link
                            to={`/blog/${blog.id}`}
                            className="blog-page__blog-card-link"
                          >
                            <article className="blog-page__blog-card">
                              <div className="blog-page__card-image">
                                <img
                                  src={blog.image || getRandomPlaceholder()}
                                  alt={blog.title}
                                  className="blog-page__card-img"
                                  onError={(e) => {
                                    e.target.src = getRandomPlaceholder();
                                  }}
                                />
                              </div>

                              <div className="blog-page__card-content">
                                <div className="blog-page__card-header">
                                  <h3>{blog.title}</h3>
                                  <p className="blog-page__card-excerpt">
                                    {blog.body?.slice(0, 120)}...
                                  </p>
                                </div>

                                {blog.tags && blog.tags.length > 0 && (
                                  <div className="blog-page__card-tags">
                                    {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                                      <span key={tagIndex} className="blog-page__tag">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="blog-page__card-footer">
                                  <div className="blog-page__card-meta">
                                    <div className="blog-page__meta-item">
                                      <FaCalendarAlt />
                                      <span>
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="blog-page__meta-item">
                                      <FaBook />
                                      <span>
                                        {calculateReadingTime(blog.body)} min read
                                      </span>
                                    </div>
                                    <div className="blog-page__meta-item">
                                      <FaHeart />
                                      <span>{blog.likeCount || 0}</span>
                                    </div>
                                  </div>

                                  <div
                                    className="blog-page__card-actions"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <motion.button
                                      className={`blog-page__bookmark-btn ${
                                        bookmarks.includes(String(blog.id))
                                          ? "bookmarked"
                                          : ""
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleBookmark(blog.id);
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Bookmark this article"
                                    >
                                      <FaBookmark />
                                    </motion.button>

                                    <motion.button
                                      className={`blog-page__like-btn ${
                                        likes.includes(String(blog.id)) ? "liked" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleLike(blog.id);
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Like this article"
                                    >
                                      <FaHeart />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </article>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="blog-page__pagination">
                      <motion.button
                        className={`blog-page__page-btn ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                        whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                      >
                        ← Previous
                      </motion.button>

                      <div className="blog-page__page-info">
                        Page {currentPage} of {totalPages}
                      </div>

                      <motion.button
                        className={`blog-page__page-btn ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                        whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                      >
                        Next →
                      </motion.button>
                    </div>
                  )}
                </>
              )}
            </main>

            {/* Enhanced Sidebar */}
            <aside className="blog-page__sidebar">
              {/* Popular Categories */}
              <motion.div
                className="blog-page__sidebar-section"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="blog-page__sidebar-title">Popular Categories</h2>
                <div className="blog-page__category-list">
                  {categoryData.map((category, index) => (
                    <motion.div
                      key={category.name}
                      className="blog-page__category-item"
                      style={{ background: category.color }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() =>
                        handleCategoryFilter(category.name.toLowerCase())
                      }
                    >
                      <span>{category.name}</span>
                      <span className="blog-page__category-count">
                        {category.count}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Posts */}
              <motion.div
                className="blog-page__sidebar-section"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="blog-page__sidebar-title">Recent Articles</h2>
                <div className="blog-page__recent-posts">
                  {recentPosts.map((blog, index) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -3 }}
                    >
                      <Link to={`/blog/${blog.id}`} className="blog-page__recent-item">
                        <img
                          src={blog.image || getRandomPlaceholder()}
                          alt={blog.title}
                          className="blog-page__recent-image"
                          onError={(e) => {
                            e.target.src = getRandomPlaceholder();
                          }}
                        />
                        <div className="blog-page__recent-content">
                          <h3 className="blog-page__recent-title">{blog.title}</h3>
                          <p className="blog-page__recent-date">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter Subscription */}
              <motion.div
                className="blog-page__sidebar-section blog-page__newsletter"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="blog-page__sidebar-title">Stay Updated</h2>
                <p>
                  Get weekly pregnancy tips, health updates, and exclusive content
                  delivered to your inbox.
                </p>

                <form
                  className="blog-page__newsletter-form"
                  onSubmit={handleNewsletterSubmit}
                >
                  <input
                    type="email"
                    className="blog-page__newsletter-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <motion.button
                    type="submit"
                    className="blog-page__newsletter-btn"
                    disabled={isSubscribing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubscribing ? "Subscribing..." : "Subscribe Now"}
                  </motion.button>
                </form>

                <AnimatePresence>
                  {subscriptionStatus && (
                    <motion.div
                      className={`blog-page__subscription-status ${
                        subscriptionStatus.includes("Success") ? "success" : "error"
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {subscriptionStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>

      {/* Enhanced Auth Popup */}
      <AnimatePresence>
        {showAuthPopup && (
          <motion.div
            className="blog-page__auth-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="blog-page__auth-popup-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3>Sign In Required</h3>
              <p>You need to be logged in to bookmark or like articles.</p>
              <div className="blog-page__auth-popup-buttons">
                <Link to="/signin" className="blog-page__auth-popup-btn">
                  Sign In
                </Link>
                <Link to="/signup" className="blog-page__auth-popup-btn">
                  Sign Up
                </Link>
                <button
                  className="blog-page__auth-popup-close"
                  onClick={() => setShowAuthPopup(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Contact Icon */}
      <motion.div
        className="contact-icon"
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <FaComments />
      </motion.div>

      {/* Chat Component */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <ChatBoxPage />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BlogPage;
