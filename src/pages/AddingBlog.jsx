import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addBlog, getAllCategories } from "../apis/blog-api";
import { getCurrentUser } from "../apis/authentication-api";
import "../styles/AddingBlog.css";

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
  const [formErrors, setFormErrors] = useState({
    categoryId: "",
    title: "",
    body: "",
    tags: "",
  });
  const navigate = useNavigate();

  // Profanity list for filtering
  const profanityList = [
    "damn",
    "hell",
    "shit",
    "fuck",
    "bitch",
    "asshole",
    "crap",
  ];

  // Common stop words to avoid in titles
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
  ];

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
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
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

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "categoryId":
        if (!value) {
          error = "Please select a category.";
        } else if (!categories.some((c) => c.id === value)) {
          error = "Invalid category selected.";
        }
        break;
      case "title":
        if (!value.trim()) {
          error = "Title is required.";
        } else if (value.length < 10) {
          error = "Title must be at least 10 characters long.";
        } else if (value.length > 70) {
          error = "Title cannot exceed 70 characters.";
        } else if (!/^[a-zA-Z0-9\s.,!?-]+$/.test(value)) {
          error = "Title can only contain letters, numbers, spaces, and .,?!-.";
        } else if (/\s{2,}/.test(value)) {
          error = "Title cannot contain multiple consecutive spaces.";
        } else if (
          value
            .toLowerCase()
            .split(" ")
            .every((word) => stopWords.includes(word))
        ) {
          error = "Title must contain meaningful keywords, not just stop words.";
        } else {
          const words = value.split(" ");
          const majorWords = words.filter(
            (word) => !stopWords.includes(word.toLowerCase())
          );
          // if (
          //   majorWords.length > 0 &&
          //   majorWords.some((word) => word[0] !== word[0].toUpperCase())
          // ) {
          //   error = "Major words in title must be capitalized (e.g., Health Tips).";
          // }
        }
        break;
      case "body":
        if (!value.trim()) {
          error = "Body is required.";
        } else if (value.length < 50) {
          error = "Body must be at least 50 characters long.";
        } else if (value.length > 3000) {
          error = "Body cannot exceed 3000 characters.";
        } else if (
          value.split(/\w+/).filter((word) => word.length > 0).length < 20
        ) {
          error = "Body must contain at least 20 words.";
        } else if (
          value.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0)
            .length < 3
        ) {
          error = "Body must contain at least 3 sentences.";
        } else if ((value.match(/[!?.]/g) || []).length > 100) {
          error = "Body contains too many punctuation marks (max 100).";
        } else if (
          profanityList.some((word) => value.toLowerCase().includes(word))
        ) {
          error = "Body contains inappropriate language.";
        } else if (/(\b\w+\b)\s+\1\s+\1/.test(value)) {
          error = "Body cannot contain repetitive words.";
        }
        break;
      case "tags":
        const tagsArray = value
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag);
        if (tagsArray.length === 0) {
          error = "At least one tag is required.";
        } else if (tagsArray.length > 5) {
          error = "Maximum 5 tags allowed.";
        } else if (tagsArray.some((tag) => tag.length < 3)) {
          error = "Each tag must be at least 3 characters long.";
        } else if (tagsArray.some((tag) => tag.length > 20)) {
          error = "Each tag cannot exceed 20 characters.";
        } else if (tagsArray.some((tag) => !/^[a-z0-9-]+$/.test(tag))) {
          error = "Tags can only contain lowercase letters, numbers, or hyphens.";
        } else if (new Set(tagsArray).size !== tagsArray.length) {
          error = "Tags must be unique.";
        } else if (
          tagsArray.some((tag) =>
            ["general", "misc", "other", "blog", "post"].includes(tag)
          )
        ) {
          error = "Tags must be specific and relevant (e.g., avoid 'general', 'misc').";
        }
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const errors = {
      categoryId: "",
      title: "",
      body: "",
      tags: "",
    };

    validateField("categoryId", formData.categoryId);
    validateField("title", formData.title);
    validateField("body", formData.body);
    validateField("tags", formData.tags);

    const newErrors = {
      categoryId: formErrors.categoryId || validateField("categoryId", formData.categoryId),
      title: formErrors.title || validateField("title", formData.title),
      body: formErrors.body || validateField("body", formData.body),
      tags: formErrors.tags || validateField("tags", formData.tags),
    };

    setFormErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!validateForm()) {
      setMessage("Please fix the errors in the form.");
      setIsError(true);
      return;
    }

    if (!user) {
      setMessage("User not authenticated");
      setIsError(true);
      navigate("/signin", { replace: true });
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
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag),
      images: Array.isArray(formData.images) ? formData.images : [],
    };

    try {
      setLoading(true);
      const response = await addBlog(blogData, token);
      console.log("Blog submission response:", response.data);
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
            className="blog-action-button blog-action-button--secondary"
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
                {formErrors.categoryId && (
                  <p className="error-message">{formErrors.categoryId}</p>
                )}
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
                  placeholder="Enter blog title (e.g., Top Health Tips)"
                  aria-label="Blog title"
                />
                {formErrors.title && (
                  <p className="error-message">{formErrors.title}</p>
                )}
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
                  placeholder="Enter blog content (at least 3 sentences)"
                  aria-label="Blog content"
                />
                {formErrors.body && (
                  <p className="error-message">{formErrors.body}</p>
                )}
              </div>
              <div className="blog-form-field">
                <label htmlFor="tags">Tags (comma-separated, 1-5 tags)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., health-tips, nutrition, wellness"
                  disabled={!user}
                  aria-label="Blog tags"
                />
                {formErrors.tags && (
                  <p className="error-message">{formErrors.tags}</p>
                )}
              </div>
              <div className="blog-form-field">
                <label htmlFor="images">Images (optional)</label>
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
                {formData.images.length > 0 && (
                  <div className="blog-images">
                    {formData.images.map((image, index) => (
                      <div key={index} className="blog-image-wrapper">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Image ${index + 1}`}
                          className="blog-image"
                        />
                        <button
                          type="button"
                          className="blog-image-remove"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }
                          aria-label={`Remove image ${index + 1}`}
                          disabled={loading || !user}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                type="submit"
                className="blog-action-button blog-action-button--primary"
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