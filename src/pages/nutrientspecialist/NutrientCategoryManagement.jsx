import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNutrientCategories, getNutrientCategoryById, createNutrientCategory, updateNutrientCategory } from '../../apis/nutriet-api';
import '../../styles/NutrientCategoryManagement.css';

// SVG Icons
const BackIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NutrientCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllNutrientCategories();
      setCategories(data);
      setFilteredCategories(data);
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
      setNewCategory({ name: data.name, description: data.description });
      setIsEditing(true);
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

  // Update category
  const updateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }
    setLoading(true);
    try {
      await updateNutrientCategory({
        nutrientCategoryId: selectedCategory.id,
        name: newCategory.name,
        description: newCategory.description
      });
      setNewCategory({ name: '', description: '' });
      setSelectedCategory(null);
      setIsEditing(false);
      fetchCategories();
      setError('');
    } catch (err) {
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedCategory(null);
    setNewCategory({ name: '', description: '' });
    setError('');
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
        </button>
        <h1>
          Baby Nutrient Categories
        </h1>

        {/* Create/Update Category Form */}
        <div className="form-section">
          <h2>
            {isEditing ? 'Edit Category' : 'Add New Category'}
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
            <div className="button-group">
              <button
                onClick={isEditing ? updateCategory : createCategory}
                disabled={loading}
                className="submit-button"
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Category' : 'Create Category')}
              </button>
              {isEditing && (
                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>

        {/* Category List with Search */}
        <div className="list-section">
          <h2>
            All Categories
          </h2>
          <div className="search-section">
            <SearchIcon />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search categories..."
              className="input-field search-input"
            />
          </div>
          {loading && <p className="loading-message">Loading...</p>}
          <div className="category-list">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="category-item"
                onClick={() => fetchCategoryById(category.id)}
              >
                <div className="category-header">
                  <h3>{category.name}</h3>
                </div>
                <p>{category.description || 'No description'}</p>
              </div>
            ))}
            {filteredCategories.length === 0 && !loading && (
              <p className="no-results">No categories found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientCategoryManagement;