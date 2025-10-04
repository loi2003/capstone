import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllBlogs,
  getAllCategories,
  deleteBlog,
  editBlog,
  approveBlog,
  rejectBlog,
  getBlogsByUser,
} from "../apis/blog-api";
import { getCurrentUser } from "../apis/authentication-api";
import "../styles/BlogManagement.css";

const BlogManagement = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [personalBlogs, setPersonalBlogs] = useState([]);
  const [showPersonalBlogs, setShowPersonalBlogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("title-asc");
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editBlogData, setEditBlogData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showViewModal, setShowViewModal] = useState(null);

  const blogsPerPage = 6;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const rolePermissions = {
    "3": { canApprove: true, canReject: true, restrictedTags: [] },
    "4": { canApprove: true, canReject: true, restrictedTags: ["nutrient"] },
    "5": { canApprove: true, canReject: true, restrictedTags: ["health"] },
  };

  // Optimize category lookup with useMemo
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [categories]);

  const clearError = () => {
    setTimeout(() => {
      setError("");
      setShowErrorModal(null);
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (blogs.length > 0 && categories.length > 0 && personalBlogs.length > 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
        const userResponse = await getCurrentUser(token);
        const userData = userResponse.data?.data || userResponse.data;
        const roleId = String(userData?.roleId);
        if (userData?.id && ["3", "4", "5"].includes(roleId)) {
          setUser({ ...userData, roleId });
        } else {
          throw new Error(
            `Access denied. Role ID ${roleId} is not authorized for this page.`
          );
        }
        const [categoriesResponse, blogsResponse, personalBlogsResponse] =
          await Promise.all([
            getAllCategories(token),
            getAllBlogs(token),
            getBlogsByUser(userData.id, token),
          ]);
        const categoriesData = Array.isArray(categoriesResponse.data?.data)
          ? categoriesResponse.data.data
          : [];
        setCategories(categoriesData);
        if (categoriesData.length === 0) {
          setError("No categories available. Please create a category first.");
          clearError();
        }
        setBlogs(
          Array.isArray(blogsResponse.data?.data) ? blogsResponse.data.data : []
        );
        setPersonalBlogs(
          Array.isArray(personalBlogsResponse.data?.data)
            ? personalBlogsResponse.data.data
            : []
        );
      } catch (err) {
        setShowErrorModal(err.response?.data?.message || "Failed to fetch data.");
        clearError();
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOption, showPersonalBlogs]);

  const openImageModal = (image, index, images) => {
    setSelectedImage({ image, images });
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedImage.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedImage.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleEditBlog = (blog) => {
    setEditBlogData({
      id: blog.id,
      userId: blog.userId,
      categoryId: blog.categoryId,
      title: blog.title,
      body: blog.body,
      tags: blog.tags || [],
      images: blog.images || [],
    });
    setNewImages([]);
    setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    const totalImages = editBlogData.images.length + newImages.length + files.length;
    if (totalImages > maxImages) {
      setShowErrorModal(`You can only upload up to ${maxImages} images in total.`);
      clearError();
      return;
    }
    const validImages = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isUnderSizeLimit = file.size <= 5 * 1024 * 1024;
      if (!isImage) {
        setShowErrorModal("Only image files are allowed.");
        clearError();
        return false;
      }
      if (!isUnderSizeLimit) {
        setShowErrorModal("Image size must be less than 5MB.");
        clearError();
        return false;
      }
      return true;
    });
    setNewImages((prev) => [...prev, ...validImages]);
  };

  const handleRemoveImage = (index) => {
    setEditBlogData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateEditForm = () => {
    if (!editBlogData.title.trim()) {
      return "Title is required.";
    }
    if (!/^[a-zA-Z0-9\s-_]{3,100}$/.test(editBlogData.title.trim())) {
      return "Title must be 3-100 characters long and contain only letters, numbers, spaces, hyphens, or underscores.";
    }
    const titleLowerCase = editBlogData.title.trim().toLowerCase();
    const existingBlogs = showPersonalBlogs ? personalBlogs : blogs;
    const isDuplicate = existingBlogs.some(
      (blog) =>
        String(blog.id) !== String(editBlogData.id) &&
        blog.title &&
        blog.title.trim().toLowerCase() === titleLowerCase
    );
    if (isDuplicate) {
      return "This title is already in use. Please choose a unique title.";
    }
    if (!editBlogData.body.trim()) {
      return "Blog content is required.";
    }
    if (editBlogData.body.trim().length < 10) {
      return "Blog content must be at least 10 characters long.";
    }
    if (
      !editBlogData.categoryId ||
      !categories.some((c) => c.id === editBlogData.categoryId)
    ) {
      return "Please select a valid category.";
    }
    if (editBlogData.tags && editBlogData.tags.length > 0) {
      if (editBlogData.tags.length > 10) {
        return "You can only add up to 10 tags.";
      }
      const invalidTag = editBlogData.tags.find(
        (tag) => !tag.trim() || !/^[a-zA-Z0-9-_]+$/.test(tag.trim())
      );
      if (invalidTag) {
        return "Tags must contain only letters, numbers, hyphens, or underscores, and cannot be empty.";
      }
    }
    return null;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const validationError = validateEditForm();
    if (validationError) {
      setShowErrorModal(validationError);
      clearError();
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }
      await getCurrentUser(token);
      if (
        !editBlogData.id ||
        !editBlogData.categoryId ||
        !editBlogData.title ||
        !editBlogData.body
      ) {
        throw new Error(
          "All required fields (Id, CategoryId, Title, Body) must be provided."
        );
      }
      const formData = new FormData();
      formData.append("Id", editBlogData.id);
      formData.append("CategoryId", editBlogData.categoryId);
      formData.append("Title", editBlogData.title.trim());
      formData.append("Body", editBlogData.body.trim());
      const tags = Array.isArray(editBlogData.tags) ? editBlogData.tags : [];
      tags.forEach((tag, index) => {
        formData.append(`Tags[${index}]`, tag.trim());
      });
      newImages.forEach((image, index) => {
        formData.append("Images", image);
      });
      const response = await editBlog(formData, token);
      const updatedBlog = {
        ...editBlogData,
        images: response.data.data?.images || editBlogData.images,
        categoryName:
          categories.find((c) => c.id === editBlogData.categoryId)
            ?.categoryName || editBlogData.categoryName,
        status:
          user.roleId === "3" || user.roleId === "4"
            ? "Approved"
            : editBlogData.status,
      };
      setBlogs((prev) =>
        prev.map((b) => (b.id === editBlogData.id ? updatedBlog : b))
      );
      setPersonalBlogs((prev) =>
        prev.map((b) => (b.id === editBlogData.id ? updatedBlog : b))
      );
      setEditBlogData(null);
      setNewImages([]);
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message === "Title already exists"
          ? "This title is already in use. Please choose a unique title."
          : err.response?.data?.message || "Failed to update blog. Please try again.";
      setShowErrorModal(errorMessage);
      clearError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      const token = localStorage.getItem("token");
      await deleteBlog(blogId, token);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
      setPersonalBlogs((prev) => prev.filter((b) => b.id !== blogId));
      setShowDeleteConfirm(null);
      setError("");
    } catch (err) {
      setShowErrorModal("Failed to delete blog. Please try again.");
      clearError();
    }
  };

  const handleApproveBlog = async (blogId) => {
    try {
      const token = localStorage.getItem("token");
      const blog =
        blogs.find((b) => b.id === blogId) ||
        personalBlogs.find((b) => b.id === blogId);
      const category = categoryMap[blog.categoryId];
      const permissions = rolePermissions[user.roleId];
      if (
        category?.blogCategoryTag &&
        permissions.restrictedTags.includes(category.blogCategoryTag.toLowerCase())
      ) {
        setShowErrorModal(
          `Only authorized roles can approve blogs with the ${category.blogCategoryTag} tag.`
        );
        clearError();
        return;
      }
      const response = await approveBlog(blogId, user.id, token);
      if (response.data.error) {
        setShowErrorModal(
          response.data.message || "Failed to approve blog. Please try again."
        );
        clearError();
        return;
      }
      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, status: "Approved" } : b))
      );
      setPersonalBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, status: "Approved" } : b))
      );
      setError("");
    } catch (err) {
      setShowErrorModal(
        err.response?.data?.message || "Failed to approve blog. Please try again."
      );
      clearError();
    }
  };

  const handleRejectBlog = async (blogId) => {
    if (!rejectionReason.trim()) {
      setShowErrorModal("Please provide a rejection reason.");
      clearError();
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const blog =
        blogs.find((b) => b.id === blogId) ||
        personalBlogs.find((b) => b.id === blogId);
      const category = categoryMap[blog.categoryId];
      const permissions = rolePermissions[user.roleId];
      if (
        category?.blogCategoryTag &&
        permissions.restrictedTags.includes(category.blogCategoryTag.toLowerCase())
      ) {
        setShowErrorModal(
          `Only authorized roles can reject blogs with the ${category.blogCategoryTag} tag.`
        );
        clearError();
        return;
      }
      const response = await rejectBlog(blogId, user.id, rejectionReason, token);
      if (response.data.error) {
        setShowErrorModal(
          response.data.message || "Failed to reject blog. Please try again."
        );
        clearError();
        return;
      }
      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, status: "Rejected" } : b))
      );
      setPersonalBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, status: "Rejected" } : b))
      );
      setShowRejectModal(null);
      setRejectionReason("");
      setError("");
    } catch (err) {
      setShowErrorModal(
        err.response?.data?.message || "Failed to reject blog. Please try again."
      );
      clearError();
    }
  };

  const handleViewBlog = (blog) => {
    setShowViewModal(blog);
  };

  const closeViewModal = () => {
    setShowViewModal(null);
  };

  const handleShowAllBlogs = () => {
    setShowPersonalBlogs(false);
    setCurrentPage(1);
  };

  const handleShowPersonalBlogs = () => {
    setShowPersonalBlogs(true);
    setCurrentPage(1);
  };

  const handleAddBlog = () => {
    navigate("/blog-management/add");
  };

  const handleBack = () => {
    switch (user?.roleId) {
      case "5":
        navigate("/clinic");
        break;
      case "3":
        navigate("/health-expert");
        break;
      case "4":
        navigate("/nutrient-specialist");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const truncateBody = (body, maxLength = 100) => {
    if (!body) return "No content";
    return body.length > maxLength
      ? `${body.substring(0, maxLength)}...`
      : body;
  };

  const filteredBlogs = (showPersonalBlogs ? personalBlogs : blogs).filter(
    (blog) => {
      const matchesTitle = blog.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || blog.status?.toLowerCase() === statusFilter;
      return matchesTitle && matchesStatus;
    }
  );

  const approvalBlogs = filteredBlogs.filter(
    (blog) => blog.status?.toLowerCase() === "pending"
  );

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    switch (sortOption) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "approved-first":
        return (
          (b.status?.toLowerCase() === "approved" ? 1 : 0) -
          (a.status?.toLowerCase() === "approved" ? 1 : 0)
        );
      case "pending-first":
        return (
          (b.status?.toLowerCase() === "pending" ? 1 : 0) -
          (a.status?.toLowerCase() === "pending" ? 1 : 0)
        );
      default:
        return 0;
    }
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

  if (loading) {
    return (
      <motion.div
        className="blog-management"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="blog-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <motion.button
            className="back-button"
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.button>
          <h1 className="page-title">Blog Management</h1>
          <div className="header-actions">
            <motion.button
              className="add-button"
              onClick={handleAddBlog}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" />
              </svg>
              Add Blog
            </motion.button>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>Total Blogs</h3>
              <span className="stat-number">
                {(showPersonalBlogs ? personalBlogs : blogs).length}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon approved">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>Approved</h3>
              <span className="stat-number">
                {
                  (showPersonalBlogs ? personalBlogs : blogs).filter(
                    (blog) => blog.status?.toLowerCase() === "approved"
                  ).length
                }
              </span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>Pending</h3>
              <span className="stat-number">
                {
                  (showPersonalBlogs ? personalBlogs : blogs).filter(
                    (blog) => blog.status?.toLowerCase() === "pending"
                  ).length
                }
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Controls Section */}
        <section className="controls-section">
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${!showPersonalBlogs ? 'active' : ''}`}
                onClick={handleShowAllBlogs}
              >
                All Blogs
              </button>
              <button
                className={`tab ${showPersonalBlogs ? 'active' : ''}`}
                onClick={handleShowPersonalBlogs}
              >
                Personal Blogs
              </button>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="filter-select"
              >
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="approved-first">Approved First</option>
                <option value="pending-first">Pending First</option>
              </select>
            </div>
          </div>
        </section>

        {/* Blogs Table */}
        <section className="table-section">
          <div className="table-container">
            {currentBlogs.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" stroke="currentColor" strokeWidth="1" />
                </svg>
                <h3>No blogs found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Title</div>
                    <div className="table-cell">Category</div>
                    <div className="table-cell">Tag</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell actions-header">Actions</div>
                  </div>
                </div>
                <div className="table-body">
                  {currentBlogs.map((blog) => {
                    const category = categoryMap[blog.categoryId];
                    return (
                      <motion.div
                        key={blog.id}
                        className="table-row"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="table-cell title-cell">
                          <span className="blog-title">{blog.title}</span>
                        </div>
                        <div className="table-cell">
                          <span className="category-tag">{blog.categoryName || "Uncategorized"}</span>
                        </div>
                        <div className="table-cell">
                          <span className={`category-tag ${category?.blogCategoryTag?.toLowerCase() || ''}`}>
                            {category?.blogCategoryTag || "N/A"}
                          </span>
                        </div>
                        <div className="table-cell">
                          <div className={`status-badge ${blog.status?.toLowerCase()}`}>
                            {blog.status || "Pending"}
                          </div>
                        </div>
                        <div className="table-cell actions-cell">
                          <div className="action-buttons">
                            <motion.button
                              className="action-btn view"
                              onClick={() => handleViewBlog(blog)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="View blog"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                              </svg>
                            </motion.button>
                            <motion.button
                              className="action-btn edit"
                              onClick={() => handleEditBlog(blog)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Edit blog"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </motion.button>
                            <motion.button
                              className="action-btn delete"
                              onClick={() => setShowDeleteConfirm(blog.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              title="Delete blog"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18v2H3zm2 3h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5-4V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h4v2H6V5h4z" fill="currentColor" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <motion.button
                className="pagination-btn prev"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </motion.button>
              
              {Array.from({ length: totalPages }, (_, index) => (
                <motion.button
                  key={index + 1}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {index + 1}
                </motion.button>
              ))}
              
              <motion.button
                className="pagination-btn next"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </motion.button>
            </div>
          )}
        </section>

        {/* Approval Section for specific roles */}
        {["3", "4"].includes(user?.roleId) && approvalBlogs.length > 0 && (
          <section className="approval-section">
            <div className="section-header">
              <h2>Pending Approval</h2>
              <span className="badge">{approvalBlogs.length}</span>
            </div>
            <div className="table-container">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">Title</div>
                  <div className="table-cell">Category</div>
                  <div className="table-cell">Tag</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell actions-header">Actions</div>
                </div>
              </div>
              <div className="table-body">
                {approvalBlogs.map((blog) => {
                  const category = categoryMap[blog.categoryId];
                  return (
                    <motion.div
                      key={blog.id}
                      className="table-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="table-cell title-cell">
                        <span className="blog-title">{blog.title}</span>
                      </div>
                      <div className="table-cell">
                        <span className="category-tag">{blog.categoryName || "Uncategorized"}</span>
                      </div>
                      <div className="table-cell">
                        <span className={`category-tag ${category?.blogCategoryTag?.toLowerCase() || ''}`}>
                          {category?.blogCategoryTag || "N/A"}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className="status-badge pending">{blog.status || "Pending"}</div>
                      </div>
                      <div className="table-cell actions-cell">
                        <div className="action-buttons">
                          <motion.button
                            className="action-btn view"
                            onClick={() => handleViewBlog(blog)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="View blog"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                            </svg>
                          </motion.button>
                          <motion.button
                            className="action-btn approve"
                            onClick={() => handleApproveBlog(blog.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Approve blog"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </motion.button>
                          <motion.button
                            className="action-btn reject"
                            onClick={() => setShowRejectModal(blog.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Reject blog"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Image Modal */}
        {selectedImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="image-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeImageModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
              {selectedImage.images.length > 1 && (
                <>
                  <button className="nav-btn prev" onClick={prevImage}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button className="nav-btn next" onClick={nextImage}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </>
              )}
              <img
                src={selectedImage.images[currentImageIndex].fileUrl || ""}
                alt={selectedImage.images[currentImageIndex].fileName || "Blog image"}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Edit Blog Modal */}
        {editBlogData && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditBlogData(null)}
          >
            <motion.div
              className="form-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Edit Blog</h2>
                <button className="modal-close" onClick={() => setEditBlogData(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              <form className="edit-form" onSubmit={handleEditSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editBlogData.title}
                      onChange={(e) => setEditBlogData({ ...editBlogData, title: e.target.value })}
                      placeholder="Enter blog title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editBlogData.categoryId}
                      onChange={(e) => setEditBlogData({ ...editBlogData, categoryId: e.target.value })}
                      required
                      disabled
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={editBlogData.body}
                    onChange={(e) => setEditBlogData({ ...editBlogData, body: e.target.value })}
                    placeholder="Enter blog content"
                    rows="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editBlogData.tags) ? editBlogData.tags.join(", ") : ""}
                    onChange={(e) => setEditBlogData({
                      ...editBlogData,
                      tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                    })}
                    placeholder="health, nutrition, wellness"
                  />
                </div>

                <div className="form-group">
                  <label>Current Images</label>
                  <div className="images-grid">
                    {editBlogData.images.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={image.fileUrl} alt={`Blog image ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Add New Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  {newImages.length > 0 && (
                    <div className="images-grid">
                      {newImages.map((image, index) => (
                        <div key={index} className="image-item">
                          <img src={URL.createObjectURL(image)} alt={`New image ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditBlogData(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="confirm-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon warning">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3>Delete Blog</h3>
              <p>Are you sure you want to delete this blog? This action cannot be undone.</p>
              <div className="modal-actions">
                <motion.button
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-danger"
                  onClick={() => handleDeleteBlog(showDeleteConfirm)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRejectModal(null)}
          >
            <motion.div
              className="form-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Reject Blog</h2>
                <button className="modal-close" onClick={() => setShowRejectModal(null)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              <div className="form-group">
                <label>Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this blog..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-actions">
                <motion.button
                  className="btn-secondary"
                  onClick={() => setShowRejectModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-danger"
                  onClick={() => handleRejectBlog(showRejectModal)}
                  disabled={!rejectionReason.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reject Blog
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* View Blog Modal */}
        {showViewModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewModal}
          >
            <motion.div
              className="view-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{showViewModal.title}</h2>
                <button className="modal-close" onClick={closeViewModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>

              <div className="blog-meta">
                <div className="meta-item">
                  <span className="label">Category:</span>
                  <span className="value">{showViewModal.categoryName || "Uncategorized"}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Tag:</span>
                  <span className="value">
                    {categoryMap[showViewModal.categoryId]?.blogCategoryTag || "N/A"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Status:</span>
                  <div className={`status-badge ${showViewModal.status?.toLowerCase()}`}>
                    {showViewModal.status || "Pending"}
                  </div>
                </div>
              </div>

              <div className="blog-content">
                <h3>Content</h3>
                <div className="content-text">
                  {showViewModal.body || "No content available"}
                </div>
              </div>

              {showViewModal.images?.length > 0 && (
                <div className="blog-images">
                  <h3>Images ({showViewModal.images.length})</h3>
                  <div className="images-grid">
                    {showViewModal.images.map((image, index) => (
                      <div
                        key={index}
                        className="image-item view"
                        onClick={() => openImageModal(image, index, showViewModal.images)}
                      >
                        <img src={image.fileUrl} alt={`Blog image ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <motion.button
                  className="btn-primary"
                  onClick={closeViewModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowErrorModal(null)}
          >
            <motion.div
              className="confirm-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3>Error</h3>
              <p>{showErrorModal}</p>
              <div className="modal-actions">
                <motion.button
                  className="btn-primary"
                  onClick={() => setShowErrorModal(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlogManagement;