import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNutrients, getNutrientWithDetailsById, createNutrient } from '../../apis/nutriet-api';
import '../../styles/NutrientManagement.css';

// SVG Icons
const BackIcon = () => (
  <svg className="nutrient-mgmt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="nutrient-mgmt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NutrientManagement = () => {
  const [nutrients, setNutrients] = useState([]);
  const [filteredNutrients, setFilteredNutrients] = useState([]);
  const [newNutrient, setNewNutrient] = useState({ name: '', description: '', imageUrl: '', unit: '', categoryId: '' });
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch all nutrients
  const fetchNutrients = async () => {
    setLoading(true);
    try {
      const data = await getAllNutrients();
      setNutrients(data);
      setFilteredNutrients(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch nutrients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nutrient by ID with details
  const fetchNutrientById = async (id) => {
    setLoading(true);
    try {
      const data = await getNutrientWithDetailsById(id);
      setSelectedNutrient(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch nutrient details');
    } finally {
      setLoading(false);
    }
  };

  // Create new nutrient
  const createNutrientHandler = async () => {
    if (!newNutrient.name.trim() || !newNutrient.unit.trim() || !newNutrient.categoryId.trim()) {
      setError('Name, unit, and category ID are required');
      return;
    }
    setLoading(true);
    try {
      await createNutrient(newNutrient);
      setNewNutrient({ name: '', description: '', imageUrl: '', unit: '', categoryId: '' });
      fetchNutrients();
      setError('');
    } catch (err) {
      setError('Failed to create nutrient');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNutrient({ ...newNutrient, [name]: value });
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = nutrients.filter(nutrient =>
      nutrient.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredNutrients(filtered);
  };

  // Load nutrients on mount
  useEffect(() => {
    fetchNutrients();
  }, []);

  return (
    <div className="nutrient-mgmt-container">
      <div className="nutrient-mgmt-inner-container">
        <button
          onClick={() => navigate('/nutrient-specialist')}
          className="nutrient-mgmt-back-button"
        >
          <BackIcon />
          Back
        </button>
        <h1>
          Baby Nutrients
        </h1>

        {/* Create Nutrient Form */}
        <div className="nutrient-mgmt-form-section">
          <h2>
            Add New Nutrient
          </h2>
          <div className="nutrient-mgmt-form-group">
            <input
              type="text"
              name="name"
              value={newNutrient.name}
              onChange={handleInputChange}
              placeholder="Nutrient Name (e.g., Vitamin D)"
              className="nutrient-mgmt-input-field"
            />
            <textarea
              name="description"
              value={newNutrient.description}
              onChange={handleInputChange}
              placeholder="Description (e.g., Supports bone growth)"
              className="nutrient-mgmt-textarea-field"
              rows="4"
            />
            <input
              type="text"
              name="imageUrl"
              value={newNutrient.imageUrl}
              onChange={handleInputChange}
              placeholder="Image URL (optional)"
              className="nutrient-mgmt-input-field"
            />
            <input
              type="text"
              name="unit"
              value={newNutrient.unit}
              onChange={handleInputChange}
              placeholder="Unit (e.g., mg, IU)"
              className="nutrient-mgmt-input-field"
            />
            <input
              type="text"
              name="categoryId"
              value={newNutrient.categoryId}
              onChange={handleInputChange}
              placeholder="Category ID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
              className="nutrient-mgmt-input-field"
            />
            <button
              onClick={createNutrientHandler}
              disabled={loading}
              className="nutrient-mgmt-submit-button"
            >
              {loading ? 'Creating...' : 'Create Nutrient'}
            </button>
            {error && <p className="nutrient-mgmt-error-message">{error}</p>}
          </div>
        </div>

        {/* Nutrient List with Search */}
        <div className="nutrient-mgmt-list-section">
          <h2>
            All Nutrients
          </h2>
          <div className="nutrient-mgmt-search-section">
            <SearchIcon />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search nutrients..."
              className="nutrient-mgmt-input-field nutrient-mgmt-search-input"
            />
          </div>
          {loading && <p className="nutrient-mgmt-loading-message">Loading...</p>}
          <div className="nutrient-mgmt-nutrient-list">
            {filteredNutrients.map((nutrient) => (
              <div
                key={nutrient.id}
                className="nutrient-mgmt-nutrient-item"
                onClick={() => fetchNutrientById(nutrient.id)}
              >
                <div className="nutrient-mgmt-nutrient-header">
                  <h3>{nutrient.name}</h3>
                  <span className="nutrient-mgmt-nutrient-unit">{nutrient.unit}</span>
                </div>
                <p>{nutrient.description || 'No description'}</p>
                {nutrient.imageUrl && (
                  <img
                    src={nutrient.imageUrl}
                    alt={nutrient.name}
                    className="nutrient-mgmt-nutrient-image"
                  />
                )}
              </div>
            ))}
            {filteredNutrients.length === 0 && !loading && (
              <p className="nutrient-mgmt-no-results">No nutrients found</p>
            )}
          </div>
        </div>

        {/* Selected Nutrient Details */}
        {selectedNutrient && (
          <div className="nutrient-mgmt-details-section">
            <h2>
              Nutrient Details
            </h2>
            <div className="nutrient-mgmt-nutrient-details">
              <h3>{selectedNutrient.name}</h3>
              <p><strong>Unit:</strong> {selectedNutrient.unit}</p>
              <p><strong>Description:</strong> {selectedNutrient.description || 'No description'}</p>
              {selectedNutrient.imageUrl && (
                <img
                  src={selectedNutrient.imageUrl}
                  alt={selectedNutrient.name}
                  className="nutrient-mgmt-nutrient-image"
                />
              )}
              <p><strong>Category ID:</strong> {selectedNutrient.categoryId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutrientManagement;