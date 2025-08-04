import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Chart from "chart.js/auto";
import { getAllBlogs, getAllCategories, deleteBlog, editBlog, approveBlog, rejectBlog, getBlogsByUser } from "../apis/blog-api";
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
  const [showFullBody, setShowFullBody] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);
  const blogsPerPage = 6;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const clearError = () => {
    setTimeout(() => {
      setError("");
      setShowErrorModal(null);
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
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
            `Access denied. Role ID ${roleId} is not authorized for this page. Only Clinic (3), Health Expert (4), or Nutrient Specialist (5) users can access this page.`
          );
        }

        const [categoriesResponse, blogsResponse, personalBlogsResponse] = await Promise.all([
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

        const blogsData = Array.isArray(blogsResponse.data?.data)
          ? blogsResponse.data.data
          : [];
        setBlogs(blogsData);

        const personalBlogsData = Array.isArray(personalBlogsResponse.data?.data)
          ? personalBlogsResponse.data.data
          : [];
        setPersonalBlogs(personalBlogsData);
      } catch (err) {
        setShowErrorModal(
          err.response?.data?.message || "Failed to fetch data. Please log in again."
        );
        clearError();
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, location]);

  useEffect(() => {
    if (
      !loading &&
      blogs.length > 0 &&
      categories.length > 0 &&
      chartRef.current
    ) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const categoryCounts = categories.reduce((acc, category) => {
        acc[category.categoryName] = (showPersonalBlogs ? personalBlogs : blogs).filter(
          (blog) => blog.categoryName === category.categoryName
        ).length;
        return acc;
      }, {});

      const labels = Object.keys(categoryCounts).filter(
        (key) => categoryCounts[key] > 0
      );
      const data = labels.map((key) => categoryCounts[key]);
      const colors = labels.map(
        (_, index) => `hsl(${(index * 137.5) % 360}, 70%, 60%)`
      );

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: colors,
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { family: "'Inter', sans-serif", size: 14 },
                color: "#124966",
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)",
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
  }, [blogs, personalBlogs, categories, loading, showPersonalBlogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOption, showPersonalBlogs]);

  const handleShowAllBlogs = () => {
    setShowPersonalBlogs(false);
    setCurrentPage(1);
  };

  const handleShowPersonalBlogs = () => {
    setShowPersonalBlogs(true);
    setCurrentPage(1);
  };

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      try {
        await getCurrentUser(token);
      } catch (tokenError) {
        setShowErrorModal("Session expired. Please log in again.");
        clearError();
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
        return;
      }

      if (!editBlogData.id || !editBlogData.categoryId || !editBlogData.title || !editBlogData.body) {
        throw new Error("All required fields (Id, CategoryId, Title, Body) must be provided.");
      }

      const formData = new FormData();
      formData.append("Id", editBlogData.id);
      formData.append("CategoryId", editBlogData.categoryId);
      formData.append("Title", editBlogData.title);
      formData.append("Body", editBlogData.body);

      const tags = Array.isArray(editBlogData.tags) ? editBlogData.tags : [];
      tags.forEach((tag, index) => {
        formData.append(`Tags[${index}]`, tag);
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
        status: user.roleId === "3" || user.roleId === "4" ? "Approved" : editBlogData.status,
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
        err.response?.data?.message || "Failed to update blog. Please try again.";
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
      const blog = blogs.find((b) => b.id === blogId) || personalBlogs.find((b) => b.id === blogId);

      if (user.roleId === "4" && blog.tags?.map(tag => tag.toLowerCase()).includes("nutrient")) {
        setShowErrorModal("Only Nutrient Specialists can approve blogs with the 'nutrient' tag.");
        clearError();
        return;
      }
      if (user.roleId === "5" && blog.tags?.map(tag => tag.toLowerCase()).includes("health")) {
        setShowErrorModal("Only Health Experts can approve blogs with the 'health' tag.");
        clearError();
        return;
      }

      const response = await approveBlog(blogId, user.id, token);
      
      if (response.data.error) {
        setShowErrorModal(response.data.message || "Failed to approve blog. Please try again.");
        clearError();
        return;
      }

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: "Approved" } : b
        )
      );
      setPersonalBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: "Approved" } : b
        )
      );
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to approve blog. Please try again.";
      setShowErrorModal(errorMessage);
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
      const blog = blogs.find((b) => b.id === blogId) || personalBlogs.find((b) => b.id === blogId);

      if (user.roleId === "4" && blog.tags?.map(tag => tag.toLowerCase()).includes("nutrient")) {
        setShowErrorModal("Only Nutrient Specialists can reject blogs with the 'nutrient' tag.");
        clearError();
        return;
      }
      if (user.roleId === "5" && blog.tags?.map(tag => tag.toLowerCase()).includes("health")) {
        setShowErrorModal("Only Health Experts can reject blogs with the 'health' tag.");
        clearError();
        return;
      }

      const response = await rejectBlog(blogId, user.id, rejectionReason, token);
      
      if (response.data.error) {
        setShowErrorModal(response.data.message || "Failed to reject blog. Please try again.");
        clearError();
        return;
      }

      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: "Rejected" } : b
        )
      );
      setPersonalBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: "Rejected" } : b
        )
      );
      setShowRejectModal(null);
      setRejectionReason("");
      setError("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to reject blog. Please try again.";
      setShowErrorModal(errorMessage);
      clearError();
    }
  };

  const handleViewBlog = (blog) => {
    setShowViewModal(blog);
  };

  const closeViewModal = () => {
    setShowViewModal(null);
  };

  const filteredBlogs = (showPersonalBlogs ? personalBlogs : blogs).filter((blog) => {
    const matchesTitle = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      blog.status?.toLowerCase() === statusFilter;
    return matchesTitle && matchesStatus;
  });

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

  const handleBack = () => {
    switch (user.roleId) {
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
        navigate("/"); // Fallback to homepage if roleId is invalid
        break;
    }
  };

  const handleAddBlog = () => {
    navigate("/blog-management/add");
  };

  const handleViewFullBody = (blog) => {
    setShowFullBody(blog);
  };

  const closeFullBodyModal = () => {
    setShowFullBody(null);
  };

  const truncateBody = (body, maxLength = 100) => {
    if (!body) return "No content";
    return body.length > maxLength ? `${body.substring(0, maxLength)}...` : body;
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
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <header className="blog-header">
        <motion.button
          className="blog-back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back to homepage"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="stat-label">Total Blogs</span>
              <span className="stat-value">{(showPersonalBlogs ? personalBlogs : blogs).length}</span>
            </div>
            <div className="blog-stat-item">
              <span className="stat-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="stat-label">Approved Blogs</span>
              <span className="stat-value">
                {(showPersonalBlogs ? personalBlogs : blogs).filter((blog) => blog.status?.toLowerCase() === "approved").length}
              </span>
            </div>
            <div className="blog-stat-item">
              <span className="stat-icon" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14m7-7H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="stat-label">Pending Blogs</span>
              <span className="stat-value">
                {(showPersonalBlogs ? personalBlogs : blogs).filter((blog) => blog.status?.toLowerCase() === "pending").length}
              </span>
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="button-icon"
            >
              <path
                d="M12 5v14m7-7H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Blog
          </motion.button>
        </section>
        <section className="blog-list-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              className={`blog-action-button ${showPersonalBlogs ? '' : 'active'}`}
              onClick={handleShowAllBlogs}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Show all blogs"
            >
              All Blogs
            </motion.button>
            <motion.button
              className={`blog-action-button ${showPersonalBlogs ? 'active' : ''}`}
              onClick={handleShowPersonalBlogs}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95}}
              aria-label="Show personal blogs"
            >
              Personal Blogs
            </motion.button>
          </div>
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
              <label htmlFor="statusFilter">Functions</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter blogs by status"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                <span>Actions</span>
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
                  <span>{blog.categoryName || "Uncategorized"}</span>
                  <span>
                    <motion.span
                      className="status-dot"
                      title={blog.status || "Pending"}
                      style={{
                        backgroundColor:
                          blog.status?.toLowerCase() === "approved"
                            ? "#34C759"
                            : blog.status?.toLowerCase() === "rejected"
                            ? "#FF3B30"
                            : "#FBC107",
                      }}
                      whileHover={{
                        scale: 1.2,
                        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
                      }}
                    />
                  </span>
                  <span className="blog-actions">
                    <motion.button
                      className="blog-action-button view"
                      onClick={() => handleViewBlog(blog)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`View blog ${blog.title}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="blog-action-button edit"
                      onClick={() => handleEditBlog(blog)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Edit blog ${blog.title}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                    <motion.button
                      className="blog-action-button delete"
                      onClick={() => setShowDeleteConfirm(blog.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Delete blog ${blog.title}`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 6h18v2H3zm2 3h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5-4V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h4v2H6V5h4z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.button>
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
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
              {Array.from({ length: totalPages }, (_, index) => (
                <motion.button
                  key={index + 1}
                  className={`pagination-button ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
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
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>
          )}
        </section>
        <section className="blog-chart-section">
          <h2 className="blog-chart-title">Blog Distribution by Category</h2>
          <div className="chart-container">
            <canvas ref={chartRef} />
          </div>
        </section>
        {["3", "4"].includes(user?.roleId) && (
          <section className="blog-approve-section">
            <h2 className="blog-approve-title">Approve Blogs</h2>
            {approvalBlogs.length === 0 ? (
              <p>No blogs pending approval.</p>
            ) : (
              <div className="blog-table" id="approve-blog-table">
                <div className="blog-table-header">
                  <span>Title</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {approvalBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    className="blog-table-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>{blog.title}</span>
                    <span>{blog.categoryName || "Uncategorized"}</span>
                    <span>
                      <motion.span
                        className="status-dot"
                        title={blog.status || "Pending"}
                        style={{
                          backgroundColor:
                            blog.status?.toLowerCase() === "approved"
                              ? "#34C759"
                              : blog.status?.toLowerCase() === "rejected"
                              ? "#FF3B30"
                              : "#FBC107",
                        }}
                        whileHover={{
                          scale: 1.2,
                          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>
                    <span className="blog-actions">
                      <motion.button
                        className="blog-action-button view"
                        onClick={() => handleViewBlog(blog)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`View blog ${blog.title}`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            fill="currentColor"
                          />
                        </svg>
                      </motion.button>
                      <motion.button
                        className="blog-action-button approve"
                        onClick={() => handleApproveBlog(blog.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Approve blog ${blog.title}`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                      <motion.button
                        className="blog-action-button reject"
                        onClick={() => setShowRejectModal(blog.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Reject blog ${blog.title}`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.button>
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
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
                  src={selectedImage.images[currentImageIndex].fileUrl || ""}
                  alt={
                    selectedImage.images[currentImageIndex].fileName || "Blog image"
                  }
                  onError={() =>
                    console.error(
                      `Failed to load modal image: ${selectedImage.images[currentImageIndex].fileUrl}`
                    )
                  }
                />
              </motion.div>
            </motion.div>
          )}
          {editBlogData && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <form className="blog-form-section" onSubmit={handleEditSubmit}>
                  <h2 className="blog-form-title">Edit Blog</h2>
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
                  <div className="form-group">
                    <div className="input-group">
                      <label htmlFor="edit-title">Title</label>
                      <input
                        id="edit-title"
                        type="text"
                        value={editBlogData.title}
                        onChange={(e) =>
                          setEditBlogData({ ...editBlogData, title: e.target.value })
                        }
                        required
                        aria-label="Blog title"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="edit-category">Category</label>
                      <select
                        id="edit-category"
                        value={editBlogData.categoryId}
                        onChange={(e) =>
                          setEditBlogData({ ...editBlogData, categoryId: e.target.value })
                        }
                        required
                        aria-label="Blog category"
                        disabled={isSubmitting}
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
                  <div className="input-group">
                    <label htmlFor="edit-body">Body</label>
                    <textarea
                      id="edit-body"
                      value={editBlogData.body}
                      onChange={(e) =>
                        setEditBlogData({ ...editBlogData, body: e.target.value })
                      }
                      required
                      aria-label="Blog content"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="edit-tags">Tags (comma-separated)</label>
                    <input
                      id="edit-tags"
                      type="text"
                      value={Array.isArray(editBlogData.tags) ? editBlogData.tags.join(", ") : ""}
                      onChange={(e) =>
                        setEditBlogData({
                          ...editBlogData,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag),
                        })
                      }
                      aria-label="Blog tags"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="input-group">
                    <label>Current Images</label>
                    <div className="blog-images">
                      {editBlogData.images.length > 0 ? (
                        editBlogData.images.map((image, index) => (
                          <div key={index} className="blog-image-wrapper">
                            <img
                              src={image.fileUrl || ""}
                              alt={image.fileName || "Blog image"}
                              className="blog-image"
                            />
                            <button
                              type="button"
                              className="blog-image-remove"
                              onClick={() => handleRemoveImage(index)}
                              aria-label={`Remove image ${index + 1}`}
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">No images</span>
                      )}
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="edit-images">Add New Images</label>
                    <input
                      id="edit-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      aria-label="Upload new images"
                      disabled={isSubmitting}
                    />
                    {newImages.length > 0 && (
                      <div className="blog-images">
                        {newImages.map((image, index) => (
                          <div key={index} className="blog-image-wrapper">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New image ${index + 1}`}
                              className="blog-image"
                            />
                            <button
                              type="button"
                              className="blog-image-remove"
                              onClick={() =>
                                setNewImages((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              aria-label={`Remove new image ${index + 1}`}
                              disabled={isSubmitting}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-actions">
                    <motion.button
                      type="submit"
                      className="blog-submit-button"
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                      aria-label="Save changes"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="loading-spinner">Saving...</span>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="button-icon"
                          >
                            <path
                              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M17 21v-8H7v8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 3v5h5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="blog-cancel-button"
                      onClick={() => setEditBlogData(null)}
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                      aria-label="Cancel edit"
                      disabled={isSubmitting}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          {showDeleteConfirm && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="blog-image-modal-close"
                  onClick={() => setShowDeleteConfirm(null)}
                  aria-label="Close delete confirmation"
                >
                  ×
                </button>
                <div className="delete-confirm">
                  <h2 className="delete-confirm-title">Confirm Delete</h2>
                  <p>Are you sure you want to delete this blog?</p>
                  <div className="form-actions">
                    <motion.button
                      className="blog-submit-button delete"
                      onClick={() => handleDeleteBlog(showDeleteConfirm)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Confirm delete"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M3 6h18v2H3zm2 3h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5-4V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h4v2H6V5h4z"
                          fill="currentColor"
                        />
                      </svg>
                      Delete
                    </motion.button>
                    <motion.button
                      className="blog-cancel-button"
                      onClick={() => setShowDeleteConfirm(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Cancel delete"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          {showRejectModal && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="blog-image-modal-close"
                  onClick={() => setShowRejectModal(null)}
                  aria-label="Close reject modal"
                >
                  ×
                </button>
                <div className="delete-confirm">
                  <h2 className="delete-confirm-title">Reject Blog</h2>
                  <p>Please provide a reason for rejecting this blog:</p>
                  <div className="input-group">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter rejection reason"
                      aria-label="Rejection reason"
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <motion.button
                      className="blog-submit-button reject"
                      onClick={() => handleRejectBlog(showRejectModal)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Confirm reject"
                      disabled={!rejectionReason.trim()}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Reject
                    </motion.button>
                    <motion.button
                      className="blog-cancel-button"
                      onClick={() => setShowRejectModal(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95}}
                      aria-label="Cancel reject"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          {showViewModal && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}
              >
                <button
                  className="blog-image-modal-close"
                  onClick={closeViewModal}
                  aria-label="Close view modal"
                >
                  ×
                </button>
                <div className="view-content">
                  <h2 className="blog-form-title">{showViewModal.title}</h2>
                  <p><strong>Category:</strong> {showViewModal.categoryName || "Uncategorized"}</p>
                  <p><strong>Body:</strong> {showViewModal.body || "No content"}</p>
                  <p><strong>Status:</strong>
                    <motion.span
                      className="status-dot"
                      title={showViewModal.status || "Pending"}
                      style={{
                        backgroundColor:
                          showViewModal.status?.toLowerCase() === "approved"
                            ? "#34C759"
                            : showViewModal.status?.toLowerCase() === "rejected"
                            ? "#FF3B30"
                            : "#FBC107",
                      }}
                      whileHover={{
                        scale: 1.2,
                        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
                      }}
                    />
                  </p>
                  <div className="input-group">
                    <label>Images</label>
                    <div className="blog-images">
                      {showViewModal.images?.length > 0 ? (
                        showViewModal.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.fileUrl || ""}
                            alt={image.fileName || "Blog image"}
                            className="blog-image"
                            onClick={() => openImageModal(image, index, showViewModal.images)}
                            onError={() => console.error(`Failed to load image: ${image.fileUrl}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                openImageModal(image, index, showViewModal.images);
                              }
                            }}
                          />
                        ))
                      ) : (
                        <span className="text-gray-500">No images</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          {showFullBody && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}
              >
                <button
                  className="blog-image-modal-close"
                  onClick={closeFullBodyModal}
                  aria-label="Close full body modal"
                >
                  ×
                </button>
                <div className="full-body-content">
                  <h2 className="blog-form-title">{showFullBody.title}</h2>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{showFullBody.body || "No content"}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
          {showErrorModal && (
            <motion.div
              className="blog-image-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="blog-image-modal-content"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="blog-image-modal-close"
                  onClick={() => setShowErrorModal(null)}
                  aria-label="Close error modal"
                >
                  ×
                </button>
                <div className="delete-confirm">
                  <h2 className="delete-confirm-title">Error</h2>
                  <p>{showErrorModal}</p>
                  <div className="form-actions">
                    <motion.button
                      className="blog-cancel-button"
                      onClick={() => setShowErrorModal(null)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Close error"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="button-icon"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BlogManagement;