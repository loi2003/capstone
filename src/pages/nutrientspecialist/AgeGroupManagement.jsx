import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllAgeGroups, createAgeGroup, updateAgeGroup, deleteAgeGroup } from "../../apis/nutriet-api";
import "../../styles/FoodManagement.css";

const AgeGroupManagement = () => {
  const [ageGroups, setAgeGroups] = useState([]);
  const [formData, setFormData] = useState({
    ageGroupId: "",
    fromAge: "",
    toAge: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const fetchAgeGroups = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAgeGroups();
      setAgeGroups(data.data || []);
    } catch (error) {
      showNotification("Failed to fetch age groups", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fromAge || !formData.toAge) {
      showNotification("Please fill in all required fields", "error");
      return;
    }
    if (parseInt(formData.fromAge) >= parseInt(formData.toAge)) {
      showNotification("From Age must be less than To Age", "error");
      return;
    }
    try {
      if (isEditing) {
        await updateAgeGroup({
          ageGroupId: formData.ageGroupId,
          fromAge: parseInt(formData.fromAge),
          toAge: parseInt(formData.toAge),
        });
        showNotification("Age group updated successfully", "success");
      } else {
        await createAgeGroup({
          fromAge: parseInt(formData.fromAge),
          toAge: parseInt(formData.toAge),
        });
        showNotification("Age group created successfully", "success");
      }
      resetForm();
      fetchAgeGroups();
    } catch (error) {
      showNotification(`Failed to ${isEditing ? "update" : "create"} age group`, "error");
    }
  };

  const handleEdit = (ageGroup) => {
    setFormData({
      ageGroupId: ageGroup.ageGroupId,
      fromAge: ageGroup.fromAge.toString(),
      toAge: ageGroup.toAge.toString(),
    });
    setIsEditing(true);
  };

  const handleDelete = async (ageGroupId) => {
    if (window.confirm("Are you sure you want to delete this age group?")) {
      try {
        await deleteAgeGroup(ageGroupId);
        showNotification("Age group deleted successfully", "success");
        fetchAgeGroups();
      } catch (error) {
        showNotification("Failed to delete age group", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData({ ageGroupId: "", fromAge: "", toAge: "" });
    setIsEditing(false);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const filteredAgeGroups = ageGroups.filter(
    (ageGroup) =>
      `${ageGroup.fromAge}-${ageGroup.toAge}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedAgeGroups = filteredAgeGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAgeGroups.length / itemsPerPage);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`food-management ${isSidebarOpen ? "" : "sidebar-closed"}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {notification.show && (
        <motion.div
          className={`notification ${notification.type}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <div className="notification-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={notification.type === "success" ? "M20 6L9 17L4 12" : "M12 12V8M12 16V16.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"}
                stroke="var(--blue-white)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="notification-content">
            <h4>{notification.type === "success" ? "Success" : "Error"}</h4>
            <p>{notification.message}</p>
          </div>
        </motion.div>
      )}
      <aside className={`nutrient-specialist-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        {/* Sidebar content is assumed to be handled by layout or parent component */}
      </aside>
      <main className="nutrient-specialist-content">
        <header className="management-header">
          <div>
            <h1>Age Group Management</h1>
            <p>Manage age groups for nutritional guidance.</p>
          </div>
        </header>
        <div className="management-container">
          <section className="form-section">
            <h2>{isEditing ? "Edit Age Group" : "Add New Age Group"}</h2>
            <form onSubmit={handleSubmit} className="form-card">
              <div className="form-group">
                <label htmlFor="fromAge">From Age</label>
                <input
                  type="number"
                  id="fromAge"
                  name="fromAge"
                  value={formData.fromAge}
                  onChange={handleInputChange}
                  placeholder="Enter from age"
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="toAge">To Age</label>
                <input
                  type="number"
                  id="toAge"
                  name="toAge"
                  value={formData.toAge}
                  onChange={handleInputChange}
                  placeholder="Enter to age"
                  required
                  min="0"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="nutrient-specialist-button primary">
                  {isEditing ? "Update" : "Add"} Age Group
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="nutrient-specialist-button secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
          <section className="category-list-section">
            <div className="section-header">
              <h2>All Age Groups</h2>
              <span className="category-count">{filteredAgeGroups.length} Age Groups</span>
            </div>
            <div className="search-section">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
                  stroke="var(--blue-text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search age groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isLoading ? (
              <div className="loading-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    stroke="var(--blue-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>Loading...</p>
              </div>
            ) : filteredAgeGroups.length === 0 ? (
              <div className="empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                    stroke="var(--blue-text)"
                    strokeWidth="2"
                  />
                </svg>
                <h3>No Age Groups Found</h3>
                <p>Add a new age group to get started.</p>
              </div>
            ) : (
              <>
                <div className="category-grid">
                  {paginatedAgeGroups.map((ageGroup) => (
                    <motion.div
                      key={ageGroup.ageGroupId}
                      className="category-card"
                      variants={cardVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="card-header">
                        <h3>{`${ageGroup.fromAge}-${ageGroup.toAge} Years`}</h3>
                      </div>
                      <div className="card-actions">
                        <button
                          className="nutrient-specialist-button primary"
                          onClick={() => handleEdit(ageGroup)}
                        >
                          Edit
                        </button>
                        <button
                          className="nutrient-specialist-button secondary"
                          onClick={() => handleDelete(ageGroup.ageGroupId)}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="pagination-controls">
                  <button
                    className="nutrient-specialist-button secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="nutrient-specialist-button secondary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </motion.div>
  );
};

export default AgeGroupManagement;