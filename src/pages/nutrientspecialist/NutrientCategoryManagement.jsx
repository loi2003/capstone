import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNutrientCategories, getNutrientCategoryById, createNutrientCategory } from '../../apis/nutriet-api';
import '../../styles/NutrientCategoryManagement.css';

// SVG Icons
const BackIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const AddIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

const NutrientCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllNutrientCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch category by ID
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const data = await getNutrientCategoryById(id);
      setSelectedCategory(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    setLoading(true);
    try {
      await createNutrientCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
      setError('');
    } catch (err) {
      setError('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="nutrient-category-management">
      <div className="container">
        <button
          onClick={() => navigate('/nutrient-specialist')}
          className="back-button"
        >
          <BackIcon />
          Back to Nutrient Specialist
        </button>
        <h1>
          <CategoryIcon />
          Baby Nutrient Categories
        </h1>

        {/* Create Category Form */}
        <div className="form-section">
          <h2>
            <AddIcon />
            Add New Category
          </h2>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              placeholder="Category Name (e.g., Vitamins)"
              className="input-field"
            />
            <textarea
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              placeholder="Description (e.g., Essential for baby growth)"
              className="textarea-field"
              rows="4"
            />
            <button
              onClick={createCategory}
              disabled={loading}
              className="submit-button"
            >
              <AddIcon />
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>

        {/* Category List */}
        <div className="list-section">
          <h2>
            <CategoryIcon />
            All Categories
          </h2>
          {loading && <p className="loading-message">Loading...</p>}
          <div className="category-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => fetchCategoryById(category.id)}
              >
                <CategoryIcon />
                <h3>{category.name}</h3>
                <p>{category.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <div className="details-section">
            <h2>
              <CategoryIcon />
              Category Details
            </h2>
            <div className="category-details">
              <CategoryIcon />
              <h3>{selectedCategory.name}</h3>
              <p>{selectedCategory.description || 'No description'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutrientCategoryManagement;