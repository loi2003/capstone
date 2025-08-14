import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllFoods,
  updateFoodNutrient,
  addNutrientsToFood,
  deleteFoodNutrient,
  getAllNutrients,
} from "../../apis/nutriet-api";
import "../../styles/NutrientManagement.css";

const LoaderIcon = () => (
  <svg
    className="icon loader"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm8-8v2m0 12v2m8-8h-2m-12 0H4m15.364 4.364l-1.414-1.414M6.05 6.05l1.414 1.414"
    />
  </svg>
);

const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent("closeNotification"));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="notification-content">
        <h4>{type === "success" ? "Success" : "Error"}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

const NutrientInFoodManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newData, setNewData] = useState({
    foodId: "",
    nutrientId: "",
    nutrientEquivalent: "",
    unit: "",
    amountPerUnit: "",
    totalWeight: "",
    foodEquivalent: "",
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  const validateForm = () => {
    if (!newData.foodId || !newData.nutrientId) {
      showNotification("Food and Nutrient are required", "error");
      return false;
    }
    if (!newData.unit || !newData.amountPerUnit || !newData.totalWeight) {
      showNotification("Unit, Amount Per Unit, and Total Weight are required", "error");
      return false;
    }
    if (isNaN(newData.nutrientEquivalent) || isNaN(newData.amountPerUnit) || isNaN(newData.totalWeight)) {
      showNotification("Numeric fields must contain valid numbers", "error");
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsData, nutrientsData] = await Promise.all([
        getAllFoods(),
        getAllNutrients(),
      ]);
      setFoods(foodsData.data || []);
      setNutrients(nutrientsData.data || []);
      const flatAssociations = (foodsData.data || []).flatMap((food) =>
        (food.foodNutrients || []).map((n) => ({
          ...n,
          foodId: food.id,
          foodName: food.name,
          nutrientName: nutrientsData.data.find(nutrient => nutrient.id === n.nutrientId)?.name || n.nutrientId
        }))
      );
      setAssociations(flatAssociations);
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const createAssociationHandler = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await addNutrientsToFood({
        foodId: newData.foodId,
        nutrients: [{
          nutrientId: newData.nutrientId,
          nutrientEquivalent: parseFloat(newData.nutrientEquivalent) || 0,
          unit: newData.unit,
          amountPerUnit: parseFloat(newData.amountPerUnit),
          totalWeight: parseFloat(newData.totalWeight),
          foodEquivalent: newData.foodEquivalent,
        }],
      });
      setNewData({
        foodId: "",
        nutrientId: "",
        nutrientEquivalent: "",
        unit: "",
        amountPerUnit: "",
        totalWeight: "",
        foodEquivalent: "",
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Association created successfully", "success");
    } catch (err) {
      showNotification(`Failed to create association: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateAssociationHandler = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateFoodNutrient({
        foodId: selectedAssociation.foodId,
        nutrientId: selectedAssociation.nutrientId,
        nutrientEquivalent: parseFloat(newData.nutrientEquivalent) || 0,
        unit: newData.unit,
        amountPerUnit: parseFloat(newData.amountPerUnit),
        totalWeight: parseFloat(newData.totalWeight),
        foodEquivalent: newData.foodEquivalent,
      });
      setNewData({
        foodId: "",
        nutrientId: "",
        nutrientEquivalent: "",
        unit: "",
        amountPerUnit: "",
        totalWeight: "",
        foodEquivalent: "",
      });
      setSelectedAssociation(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Association updated successfully", "success");
    } catch (err) {
      showNotification(`Failed to update association: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAssociationHandler = async (foodId, nutrientId) => {
    if (!window.confirm("Are you sure you want to delete this association?"))
      return;
    setLoading(true);
    try {
      await deleteFoodNutrient(foodId, nutrientId);
      setSelectedAssociation(null);
      setIsEditing(false);
      setNewData({
        foodId: "",
        nutrientId: "",
        nutrientEquivalent: "",
        unit: "",
        amountPerUnit: "",
        totalWeight: "",
        foodEquivalent: "",
      });
      await fetchData();
      showNotification("Association deleted successfully", "success");
    } catch (err) {
      showNotification(`Failed to delete association: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setNewData({
      foodId: "",
      nutrientId: "",
      nutrientEquivalent: "",
      unit: "",
      amountPerUnit: "",
      totalWeight: "",
      foodEquivalent: "",
    });
    setSelectedAssociation(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewData({ ...newData, [name]: value });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const sidebarVariants = {
    open: {
      width: "min(260px, 25vw)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "min(60px, 15vw)",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <div className="nutrient-management">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`nutrient-specialist-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link to="/nutrient-specialist" className="logo">
            <motion.div className="logo-svg-container">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Leaf icon"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--nutrient-specialist-secondary)"
                  stroke="var(--nutrient-specialist-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Nutrient Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--nutrient-specialist-white)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? "M13 18L7 12L13 6M18 18L12 12L18 6"
                    : "M6 18L12 12L6 6M11 18L17 12L11 6"
                }
              />
            </svg>
          </motion.button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-nav-item">
            <Link to="/nutrient-specialist" title="Dashboard">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Dashboard icon"
              >
                <path
                  d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item">
            <Link
              to="/nutrient-specialist/food-category-management"
              title="Food Category Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Folder icon"
              >
                <path
                  d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
                  fill="var(--nutrient-specialist-secondary)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Category Management</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item">
            <Link
              to="/nutrient-specialist/food-management"
              title="Food Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Apple icon"
              >
                <path
                  d="M12 20c-4 0-7-4-7-8s3-8 7-8c1 0 2 .5 3 1.5 1-.5 2-1 3-1 4 0 7 4 7 8s-3 8-7 8c-1 0-2-.5-3-1.5-1 .5-2 1-3 1zm0-15c-2 0-3 2-3 4m6 0c0-2-1-4-3-4"
                  fill="var(--nutrient-specialist-accent)"
                  stroke="var(--nutrient-specialist-white)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Food Management</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
            <Link
              to="/nutrient-specialist/nutrient-in-food-management"
              title="Nutrient in Food Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-label="Nutrient in food icon"
              >
                <path
                  d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                  stroke="var(--nutrient-specialist-white)"
                  fill="var(--nutrient-specialist-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Nutrient in Food Management</span>}
            </Link>
          </div>
        </nav>
      </motion.aside>

      <motion.main
        className={`nutrient-specialist-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>Nutrient in Food Management</h1>
            <p>Manage associations between foods and nutrients for accurate nutritional data</p>
          </div>
        </div>

        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Association" : "Add New Association"}</h2>
            </div>
            {foods.length === 0 || nutrients.length === 0 ? (
              <p className="no-results">
                No foods or nutrients available. Please add some first.
              </p>
            ) : (
              <div className="form-card">
                <div className="form-group">
                  <label htmlFor="foodId">Food</label>
                  <select
                    id="foodId"
                    name="foodId"
                    value={newData.foodId}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    className="input-field"
                    aria-label="Select Food"
                    required
                  >
                    <option value="" disabled>
                      Select a food
                    </option>
                    {foods.map((food) => (
                      <option key={food.id} value={food.id}>
                        {food.name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="nutrientId">Nutrient</label>
                  <select
                    id="nutrientId"
                    name="nutrientId"
                    value={newData.nutrientId}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    className="input-field"
                    aria-label="Select Nutrient"
                    required
                  >
                    <option value="" disabled>
                      Select a nutrient
                    </option>
                    {nutrients.map((nutrient) => (
                      <option key={nutrient.id} value={nutrient.id}>
                        {nutrient.name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="nutrientEquivalent">Nutrient Equivalent</label>
                  <input
                    id="nutrientEquivalent"
                    type="number"
                    name="nutrientEquivalent"
                    value={newData.nutrientEquivalent}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    className="input-field"
                    aria-label="Nutrient Equivalent"
                    min="0"
                  />

                  <label htmlFor="unit">Unit</label>
                  <input
                    id="unit"
                    type="text"
                    name="unit"
                    value={newData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g., mg"
                    className="input-field"
                    aria-label="Unit"
                    required
                  />

                  <label htmlFor="amountPerUnit">Amount Per Unit</label>
                  <input
                    id="amountPerUnit"
                    type="number"
                    name="amountPerUnit"
                    value={newData.amountPerUnit}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="input-field"
                    aria-label="Amount Per Unit"
                    min="0"
                    required
                  />

                  <label htmlFor="totalWeight">Total Weight</label>
                  <input
                    id="totalWeight"
                    type="number"
                    name="totalWeight"
                    value={newData.totalWeight}
                    onChange={handleInputChange}
                    placeholder="e.g., 200"
                    className="input-field"
                    aria-label="Total Weight"
                    min="0"
                    required
                  />

                  <label htmlFor="foodEquivalent">Food Equivalent</label>
                  <input
                    id="foodEquivalent"
                    type="text"
                    name="foodEquivalent"
                    value={newData.foodEquivalent}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 cup"
                    className="input-field"
                    aria-label="Food Equivalent"
                  />

                  <div className="button-group">
                    <motion.button
                      onClick={
                        isEditing ? updateAssociationHandler : createAssociationHandler
                      }
                      disabled={loading}
                      className="submit-button nutrient-specialist-button primary"
                      whileHover={{
                        scale: loading ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: loading ? 1 : 0.95,
                      }}
                    >
                      {loading
                        ? isEditing
                          ? "Updating..."
                          : "Creating..."
                        : isEditing
                        ? "Update Association"
                        : "Create Association"}
                    </motion.button>
                    {isEditing && (
                      <motion.button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="cancel-button nutrient-specialist-button secondary"
                        whileHover={{ scale: loading ? 1 : 1.05 }}
                        whileTap={{ scale: loading ? 1 : 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nutrient-list-section">
            <div className="section-header">
              <h2>Association List</h2>
              <div className="nutrient-count">
                {associations.length}{" "}
                {associations.length === 1 ? "association" : "associations"} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading associations...</p>
              </div>
            ) : associations.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3>No associations found</h3>
                <p>Create your first association to get started</p>
              </div>
            ) : (
              <div className="nutrient-grid">
                {associations.map((assoc) => (
                  <motion.div
                    key={`${assoc.foodId}-${assoc.nutrientId}`}
                    className="nutrient-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <h3>{assoc.foodName} - {assoc.nutrientName}</h3>
                    </div>
                    <p className="card-description">
                      Amount: {assoc.amountPerUnit} {assoc.unit}
                    </p>
                    <p className="card-description">
                      Total Weight: {assoc.totalWeight}
                    </p>
                    <p className="card-description">
                      Nutrient Equivalent: {assoc.nutrientEquivalent}
                    </p>
                    <p className="card-description">
                      Food Equivalent: {assoc.foodEquivalent || 'N/A'}
                    </p>
                    <div className="card-actions">
                      <motion.button
                        onClick={() => {
                          setSelectedAssociation(assoc);
                          setNewData({
                            foodId: assoc.foodId,
                            nutrientId: assoc.nutrientId,
                            nutrientEquivalent: assoc.nutrientEquivalent || '',
                            unit: assoc.unit,
                            amountPerUnit: assoc.amountPerUnit,
                            totalWeight: assoc.totalWeight,
                            foodEquivalent: assoc.foodEquivalent || '',
                          });
                          setIsEditing(true);
                        }}
                        className="edit-button nutrient-specialist-button primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Edit association`}
                      >
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => deleteAssociationHandler(assoc.foodId, assoc.nutrientId)}
                        className="delete-button nutrient-specialist-button secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Delete association`}
                      >
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default NutrientInFoodManagement;