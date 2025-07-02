import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addBlog, getAllBlogs, getAllCategories, approveBlog, rejectBlog } from "../apis/blog-api";
import { getCurrentUser } from "../apis/authentication-api";
import "../styles/BlogManagement.css";

const BlogManagement = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    body: "",
    tags: "",
    images: [],
  });
  const [rejectionReasons, setRejectionReasons] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to access Blog Management.");
        navigate("/signin", { replace: true });
        return;
      }

      try {
        // Fetch user data
        const userResponse = await getCurrentUser();
        console.log("getCurrentUser response:", userResponse.data);
        const userData = userResponse.data?.data || userResponse.data;
        if (userData?.id && [3, 4, 5].includes(Number(userData.roleId))) {
          setUser(userData);
        } else {
          setError(
            "Only Clinic, Health Expert, or Nutrient Specialist users can access this page."
          );
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
          return;
        }

        // Fetch categories and blogs concurrently
        const [categoriesResponse, blogsResponse] = await Promise.all([
          getAllCategories(token),
          getAllBlogs(token),
        ]);

        // Handle categories response
        const categoriesData = categoriesResponse.data?.data || [];
        setCategories(categoriesData);
        if (categoriesData.length === 0) {
          setError("No categories available. Please create a category first.");
        }

        // Handle blogs response
        setBlogs(blogsResponse.data?.data || []);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
        setError(error.response?.data?.message || "Error fetching data");
        setLoading(false);
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      }
    };
    fetchUserAndData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter(
      (file) => validTypes.includes(file.type) && file.size <= maxSize
    );

    if (validFiles.length !== files.length) {
      setMessage(
        "Some files are invalid (only JPEG, PNG, GIF, max 5MB allowed)."
      );
      setIsError(true);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!user) {
      setMessage("User not authenticated");
      setIsError(true);
      navigate("/signin", { replace: true });
      return;
    }

    // Client-side validation
    if (!formData.title.trim()) {
      setMessage("Title is required");
      setIsError(true);
      return;
    }
    if (!formData.body.trim()) {
      setMessage("Body is required");
      setIsError(true);
      return;
    }
    if (!formData.categoryId) {
      setMessage("Please select a valid category");
      setIsError(true);
      return;
    }

    const token = localStorage.getItem("token");
    const blogData = {
      id: "", // Backend generates UUID
      userId: user.id, // Use user.id from getCurrentUser
      categoryId: formData.categoryId,
      title: formData.title.trim(),
      body: formData.body.trim(),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      images: formData.images,
    };

    try {
      setLoading(true);
      const response = await addBlog(blogData, token);
      setMessage("Blog post created successfully!");
      setIsError(false);
      setFormData({
        categoryId: "",
        title: "",
        body: "",
        tags: "",
        images: [],
      });
      const blogsResponse = await getAllBlogs(token);
      setBlogs(blogsResponse.data?.data || []);
    } catch (error) {
      console.error(
        "Blog submission error:",
        error.response?.data || error.message
      );
      const validationErrors = error.response?.data?.errors;
      if (validationErrors && typeof validationErrors === "object") {
        const errorMessages = Object.values(validationErrors).flat().join("; ");
        setMessage(
          errorMessages ||
            error.response?.data?.message ||
            "Error creating blog post"
        );
      } else {
        setMessage(error.response?.data?.message || "Error creating blog post");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBlog = async (blogId) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      await approveBlog(blogId, user.id, token);
      setMessage("Blog approved successfully!");
      setIsError(false);
      const blogsResponse = await getAllBlogs(token);
      setBlogs(blogsResponse.data?.data || []);
    } catch (error) {
      console.error(
        "Error approving blog:",
        error.response?.data || error.message
      );
      setMessage(error.response?.data?.message || "Error approving blog");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDenyBlog = async (blogId) => {
    const reason = rejectionReasons[blogId]?.trim();
    if (!reason) {
      setMessage("Rejection reason is required");
      setIsError(true);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      await rejectBlog(blogId, user.id, reason, token);
      setMessage("Blog denied successfully!");
      setIsError(false);
      setRejectionReasons((prev) => ({ ...prev, [blogId]: "" }));
      const blogsResponse = await getAllBlogs(token);
      setBlogs(blogsResponse.data?.data || []);
    } catch (error) {
      console.error(
        "Error denying blog:",
        error.response?.data || error.message
      );
      setMessage(error.response?.data?.message || "Error denying blog");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectionReasonChange = (blogId, value) => {
    setRejectionReasons((prev) => ({ ...prev, [blogId]: value }));
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const blogItemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="blog-management">
      <header className="blog-header">
        <motion.div
          className="blog-header-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="blog-header-title">Blog Management</h1>
          <button
            onClick={() => navigate(-1)}
            className="blog-action-button secondary"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </header>
      <main className="blog-content">
        <div className="blog-split">
          {user && [3, 4, 5].includes(Number(user.roleId)) && (
            <motion.section
              className="blog-section blog-form-section"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <h2 className="blog-section-title">Add New Blog</h2>
              <form className="blog-form" onSubmit={handleSubmit}>
                <div className="blog-form-field">
                  <label htmlFor="categoryId">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    disabled={categories.length === 0 || !user}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="error-message">
                      Please create a category in the Categories section.
                    </p>
                  )}
                </div>
                <div className="blog-form-field">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={!user}
                    placeholder="Enter blog title"
                    aria-label="Blog title"
                  />
                </div>
                <div className="blog-form-field">
                  <label htmlFor="body">Body</label>
                  <textarea
                    id="body"
                    name="body"
                    value={formData.body}
                    onChange={handleInputChange}
                    required
                    disabled={!user}
                    placeholder="Enter blog content"
                    aria-label="Blog content"
                  />
                </div>
                <div className="blog-form-field">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., health, nutrition, wellness"
                    disabled={!user}
                    aria-label="Blog tags"
                  />
                </div>
                <div className="blog-form-field">
                  <label htmlFor="images">Images</label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading || !user}
                    aria-label="Upload blog images"
                  />
                </div>
                <motion.button
                  type="submit"
                  className="blog-action-button primary"
                  disabled={loading || !user}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? "Submitting..." : "Submit Blog"}
                </motion.button>
                {message && (
                  <motion.p
                    className={`blog-form-message ${
                      isError ? "error" : "success"
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message}
                  </motion.p>
                )}
              </form>
            </motion.section>
          )}
          {user && [3, 4].includes(Number(user.roleId)) && (
            <motion.section
              className="blog-section blog-approve-deny-section"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <h2 className="blog-section-title">Approve/Deny Blogs</h2>
              {loading ? (
                <p className="blog-list-loading">Loading blogs...</p>
              ) : error ? (
                <p className="blog-list-error">{error}</p>
              ) : blogs.filter((blog) => blog.status?.toLowerCase() === "pending" && blog.user?.roleId === 5).length === 0 ? (
                <p className="blog-list-error">No pending blogs from Clinic users available.</p>
              ) : (
                <div className="blog-list">
                  {blogs
                    .filter((blog) => blog.status?.toLowerCase() === "pending" && blog.user?.roleId === 5)
                    .map((blog) => (
                      <motion.div
                        key={blog.id}
                        className="blog-list-item"
                        variants={blogItemVariants}
                      >
                        <h3>{blog.title}</h3>
                        <p>
                          <strong>Category:</strong>{" "}
                          {blog.category?.categoryName || "N/A"}
                        </p>
                        <p>
                          <strong>Body:</strong>{" "}
                          {blog.body.length > 100
                            ? `${blog.body.substring(0, 100)}...`
                            : blog.body}
                        </p>
                        <p>
                          <strong>Tags:</strong>{" "}
                          {blog.blogTags?.length > 0
                            ? blog.blogTags.join(", ")
                            : "None"}
                        </p>
                        <p>
                          <strong>Created By:</strong>{" "}
                          {blog.user?.roleId === 5 ? "Clinic" : "Unknown"}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {new Date(blog.creationDate).toLocaleDateString()}
                        </p>
                        <div className="blog-action-buttons">
                          <motion.button
                            className="blog-action-button approve"
                            onClick={() => handleApproveBlog(blog.id)}
                            disabled={loading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Approve
                          </motion.button>
                          <div className="blog-deny-section">
                            <input
                              type="text"
                              value={rejectionReasons[blog.id] || ""}
                              onChange={(e) =>
                                handleRejectionReasonChange(blog.id, e.target.value)
                              }
                              placeholder="Enter rejection reason"
                              className="blog-rejection-input"
                              disabled={loading}
                              aria-label="Rejection reason"
                            />
                            <motion.button
                              className="blog-action-button deny"
                              onClick={() => handleDenyBlog(blog.id)}
                              disabled={loading || !rejectionReasons[blog.id]?.trim()}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Deny
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
              {message && (
                <motion.p
                  className={`blog-form-message ${
                    isError ? "error" : "success"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message}
                </motion.p>
              )}
            </motion.section>
          )}
          <motion.section
            className="blog-section blog-list-section"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <h2 className="blog-section-title">All Blogs</h2>
            {loading ? (
              <p className="blog-list-loading">Loading blogs...</p>
            ) : error ? (
              <p className="blog-list-error">{error}</p>
            ) : blogs.length === 0 ? (
              <p className="blog-list-error">No blogs available.</p>
            ) : (
              <div className="blog-list">
                {blogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    className="blog-list-item"
                    variants={blogItemVariants}
                  >
                    <h3>{blog.title}</h3>
                    <p>
                      <strong>Category:</strong>{" "}
                      {blog.category?.categoryName || "N/A"}
                    </p>
                    <p>
                      <strong>Body:</strong>{" "}
                      {blog.body.length > 100
                        ? `${blog.body.substring(0, 100)}...`
                        : blog.body}
                    </p>
                    <p>
                      <strong>Tags:</strong>{" "}
                      {blog.blogTags?.length > 0
                        ? blog.blogTags.join(", ")
                        : "None"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <motion.span
                        className="status-dot"
                        title={blog.status || "Pending"}
                        style={{
                          backgroundColor:
                            blog.status?.toLowerCase() === "approved"
                              ? "#34C759"
                              : blog.status?.toLowerCase() === "denied"
                              ? "#FF3B30"
                              : "#FFC107",
                        }}
                        whileHover={{
                          scale: 1.2,
                          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
                        }}
                      />
                      <span className="blog-status">
                        {blog.status || "Pending"}
                      </span>
                    </p>
                    <p>
                      <strong>Created By:</strong>{" "}
                      {blog.user?.roleId === 5 ? "Clinic" : 
                       blog.user?.roleId === 4 ? "Nutrient Specialist" : 
                       blog.user?.roleId === 3 ? "Health Expert" : "Unknown"}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(blog.creationDate).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default BlogManagement;