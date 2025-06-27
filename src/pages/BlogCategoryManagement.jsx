import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../apis/authentication-api'; // Corrected path
import { createCategory, getAllCategories } from '../apis/blog-api';
import '../styles/BlogCategoryManagement.css';

const BlogCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await getCurrentUser();
        console.log('User response:', userResponse.data);
        setUser(userResponse.data.data || userResponse.data); // Adjust based on response structure

        // Fetch categories
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in.');
        }
        const categoriesResponse = await getAllCategories(token);
        setCategories(categoriesResponse.data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch data. Please log in again.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?.id) {
      setError('User not authenticated. Please log in.');
      return;
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(categoryName)) {
      setError('Category name must be alphanumeric');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await createCategory(user.id, categoryName, token);
      setMessage(response.data.message);
      setCategoryName('');

      // Refresh categories
      const categoriesResponse = await getAllCategories(token);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  if (loading) {
    return <div className="category-management">Loading...</div>;
  }

  return (
    <div className="category-management">
      <h1 className="category-management-title">Blog Category Management</h1>
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="categoryName">Category Name</label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            placeholder="Enter category name"
          />
        </div>
        <button type="submit" className="category-submit-button" disabled={!user}>
          Create Category
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="category-list">
        <h2 className="category-list-title">All Categories</h2>
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id} className="category-item">
                <span>{category.categoryName}</span>
                <span className={category.isActive ? 'status-active' : 'status-inactive'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlogCategoryManagement;