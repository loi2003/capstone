import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addBlog, getAllCategories } from "../apis/blog-api";
import { getCurrentUser } from "../apis/authentication-api";
import "../styles/BlogManagement.css"; // Use AddingBlog.css if separate

const AddingBlog = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to add a blog.");
        navigate("/signin", { replace: true });
        return;
      }

      try {
        const userResponse = await getCurrentUser(token);
        const userData = userResponse.data?.data || userResponse.data;
        if (userData?.id && [3, 4, 5].includes(Number(userData.roleId))) {
          setUser(userData);
        } else {
          setError(
            "Only Clinic, Health Expert, or Nutrient Specialist users can add blogs."
          );
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
          return;
        }

        const categoriesResponse = await getAllCategories(token);
        const categoriesData = Array.isArray(categoriesResponse.data?.data)
          ? categoriesResponse.data.data
          : [];
        setCategories(categoriesData);
        if (categoriesData.length === 0) {
          setError("No categories available. Please create a category first.");
        }
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
    fetchUserAndCategories();
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
      id: "",
      userId: user.id,
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
      console.log("Blog submission response:", response.data); // Debug: Log response
      setMessage("Blog post created successfully!");
      setIsError(false);
      setFormData({
        categoryId: "",
        title: "",
        body: "",
        tags: "",
        images: [],
      });
      navigate("/blog-management");
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

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
          <h1 className="blog-header-title">Add New Blog</h1>
          <button
            onClick={() => navigate("/blog-management")}
            className="blog-action-button secondary"
          >
            Back to Blog Management
          </button>
        </motion.div>
      </header>
      <main className="blog-content">
        <motion.section
          className="blog-section blog-form-section"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="blog-section-title">Create Blog Post</h2>
          {loading ? (
            <p className="blog-list-loading">Loading...</p>
          ) : error ? (
            <p className="blog-list-error">{error}</p>
          ) : (
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
                  className={`blog-form-message ${isError ? "error" : "success"}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message}
                </motion.p>
              )}
            </form>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default AddingBlog;