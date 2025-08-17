import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllNutrients,
  getAllFoods,
  addNutrientsToFood,
  deleteFoodNutrient,
  updateFoodNutrient,
} from "../../apis/nutriet-api";
import "../../styles/NutrientInFoodManagement.css";

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
  const [nutrients, setNutrients] = useState([]);
  const [foods, setFoods] = useState([]);
  const [foodNutrients, setFoodNutrients] = useState([]);
  const [newFoodNutrient, setNewFoodNutrient] = useState({
    foodId: "",
    nutrientId: "",
    nutrientEquivalent: "",
    unit: "",
    amountPerUnit: "",
    totalWeight: "",
    foodEquivalent: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFoodNutrient, setSelectedFoodNutrient] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  const showNotification = (message, type) => {
    setNotification({ message, type });
    const closeListener = () => {
      setNotification(null);
      document.removeEventListener("closeNotification", closeListener);
    };
    document.addEventListener("closeNotification", closeListener);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nutrientsData, foodsData] = await Promise.all([
        getAllNutrients(),
        getAllFoods(),
      ]);
      console.log("Fetched nutrients:", nutrientsData);
      console.log("Fetched foods:", foodsData);

      const nutrientMap = new Map(nutrientsData.map(n => [n.id, n.name]));
      const foodNutrientData = [];
      foodsData.forEach(food => {
        food.foodNutrients.forEach(fn => {
          foodNutrientData.push({
            id: `${food.id}-${fn.nutrientId}`,
            nutrientId: fn.nutrientId,
            nutrientName: nutrientMap.get(fn.nutrientId) || "Unknown",
            foodId: food.id,
            foodName: food.name,
            nutrientEquivalent: fn.nutrientEquivalent,
            unit: fn.unit,
            amountPerUnit: fn.amountPerUnit,
            totalWeight: fn.totalWeight,
            foodEquivalent: fn.foodEquivalent,
          });
        });
      });

      setNutrients(nutrientsData);
      setFoods(foodsData);
      setFoodNutrients(foodNutrientData);
    } catch (err) {
      console.error("Fetch data error:", err.response?.data || err.message);
      showNotification(`Failed to fetch data: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const addFoodNutrientHandler = async () => {
    const { foodId, nutrientId, nutrientEquivalent, unit, amountPerUnit, totalWeight, foodEquivalent } = newFoodNutrient;
    
    // Validate all fields
    if (!foodId || !nutrientId || !unit || !foodEquivalent) {
      showNotification("All fields are required", "error");
      return;
    }
    const numericFields = {
      nutrientEquivalent: Number(nutrientEquivalent),
      amountPerUnit: Number(amountPerUnit),
      totalWeight: Number(totalWeight),
    };
    if (Object.values(numericFields).some(val => isNaN(val) || val <= 0)) {
      showNotification("Nutrient Equivalent, Amount per Unit, and Total Weight must be greater than 0", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        foodId,
        nutrients: [{
          nutrientId,
          nutrientEquivalent: numericFields.nutrientEquivalent,
          unit,
          amountPerUnit: numericFields.amountPerUnit,
          totalWeight: numericFields.totalWeight,
          foodEquivalent,
        }],
      };
      console.log("Adding nutrient to food with data:", payload);
      await addNutrientsToFood(payload);
      setNewFoodNutrient({
        foodId: "",
        nutrientId: "",
        nutrientEquivalent: "",
        unit: "",
        amountPerUnit: "",
        totalWeight: "",
        foodEquivalent: "",
      });
      await fetchData();
      showNotification("Nutrient added to food successfully", "success");
    } catch (err) {
      console.error("Add nutrient error:", err.response?.data || err.message);
      showNotification(`Failed to add nutrient to food: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateFoodNutrientHandler = async () => {
    const { foodId, nutrientId, nutrientEquivalent, unit, amountPerUnit, totalWeight, foodEquivalent } = newFoodNutrient;
    
    // Validate all fields
    if (!foodId || !nutrientId || !unit || !foodEquivalent) {
      showNotification("All fields are required", "error");
      return;
    }
    const numericFields = {
      nutrientEquivalent: Number(nutrientEquivalent),
      amountPerUnit: Number(amountPerUnit),
      totalWeight: Number(totalWeight),
    };
    if (Object.values(numericFields).some(val => isNaN(val) || val <= 0)) {
      showNotification("Nutrient Equivalent, Amount per Unit, and Total Weight must be greater than 0", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        foodId,
        nutrientId,
        nutrientEquivalent: numericFields.nutrientEquivalent,
        unit,
        amountPerUnit: numericFields.amountPerUnit,
        totalWeight: numericFields.totalWeight,
        foodEquivalent,
      };
      console.log("Updating nutrient-food association with data:", payload);
      await updateFoodNutrient(payload);
      setNewFoodNutrient({
        foodId: "",
        nutrientId: "",
        nutrientEquivalent: "",
        unit: "",
        amountPerUnit: "",
        totalWeight: "",
        foodEquivalent: "",
      });
      setIsEditing(false);
      setSelectedFoodNutrient(null);
      await fetchData();
      showNotification("Nutrient-food association updated successfully", "success");
    } catch (err) {
      console.error("Update nutrient error:", err.response?.data || err.message);
      showNotification(`Failed to update association: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const editFoodNutrientHandler = (foodNutrient) => {
    setNewFoodNutrient({
      foodId: foodNutrient.foodId,
      nutrientId: foodNutrient.nutrientId,
      nutrientEquivalent: foodNutrient.nutrientEquivalent || "",
      unit: foodNutrient.unit || "",
      amountPerUnit: foodNutrient.amountPerUnit || "",
      totalWeight: foodNutrient.totalWeight || "",
      foodEquivalent: foodNutrient.foodEquivalent || "",
    });
    setSelectedFoodNutrient(foodNutrient);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setNewFoodNutrient({
      foodId: "",
      nutrientId: "",
      nutrientEquivalent: "",
      unit: "",
      amountPerUnit: "",
      totalWeight: "",
      foodEquivalent: "",
    });
    setSelectedFoodNutrient(null);
    setIsEditing(false);
  };

  const deleteFoodNutrientHandler = async (foodId, nutrientId) => {
    if (!window.confirm("Are you sure you want to delete this nutrient-food association?"))
      return;
    setLoading(true);
    try {
      console.log("Deleting nutrient-food association:", { FoodId: foodId, NutrientId: nutrientId });
      await deleteFoodNutrient(foodId, nutrientId);
      await fetchData();
      showNotification("Nutrient-food association deleted successfully", "success");
    } catch (err) {
      console.error("Delete association error:", err.response?.data || err.message);
      showNotification(`Failed to delete association: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFoodNutrient({ ...newFoodNutrient, [name]: value });
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
    <div className="nutrient-in-food-management">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`nutrient-specialist-sidebar ${isSidebarOpen ? "open" : "closed"}`}
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
              to="/nutrient-specialist/nutrient-category-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Nutrient Category Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Folder icon for nutrient category management"
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
              {isSidebarOpen && <span>Nutrient Category Management</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item">
            <Link
              to="/nutrient-specialist/nutrient-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Nutrient Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Sprout icon for nutrient management"
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
              {isSidebarOpen && <span>Nutrient Management</span>}
            </Link>
          </div>
          <div className="sidebar-nav-item active">
            <Link
              to="/nutrient-specialist/nutrient-in-food-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Nutrient in Food Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Link icon for nutrient in food management"
              >
                <path
                  d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
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
        className={`nutrient-specialist-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <div className="header-content">
            <h1>Manage Nutrients in Foods</h1>
            <p>Associate nutrients with foods and manage their details</p>
          </div>
        </div>

        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Nutrient-Food Association" : "Add Nutrient to Food"}</h2>
            </div>
            {(foods.length === 0 || nutrients.length === 0) && (
              <p className="no-results">
                No foods or nutrients available. Please add foods and nutrients first.
              </p>
            )}
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="food-id">Food <span className="required">*</span></label>
                <select
                  id="food-id"
                  name="foodId"
                  value={newFoodNutrient.foodId}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Food selection"
                  disabled={foods.length === 0 || isEditing}
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
                <label htmlFor="nutrient-id">Nutrient <span className="required">*</span></label>
                <select
                  id="nutrient-id"
                  name="nutrientId"
                  value={newFoodNutrient.nutrientId}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Nutrient selection"
                  disabled={nutrients.length === 0 || isEditing}
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
                <label htmlFor="nutrient-equivalent">Nutrient Equivalent <span className="required">*</span></label>
                <input
                  id="nutrient-equivalent"
                  type="number"
                  name="nutrientEquivalent"
                  value={newFoodNutrient.nutrientEquivalent}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  className="input-field"
                  aria-label="Nutrient equivalent"
                  required
                  min="0.01"
                  step="0.01"
                />
                <label htmlFor="unit">Unit <span className="required">*</span></label>
                <input
                  id="unit"
                  type="text"
                  name="unit"
                  value={newFoodNutrient.unit}
                  onChange={handleInputChange}
                  placeholder="e.g., mg"
                  className="input-field"
                  aria-label="Unit"
                  required
                />
                <label htmlFor="amount-per-unit">Amount per Unit <span className="required">*</span></label>
                <input
                  id="amount-per-unit"
                  type="number"
                  name="amountPerUnit"
                  value={newFoodNutrient.amountPerUnit}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  className="input-field"
                  aria-label="Amount per unit"
                  required
                  min="0.01"
                  step="0.01"
                />
                <label htmlFor="total-weight">Total Weight <span className="required">*</span></label>
                <input
                  id="total-weight"
                  type="number"
                  name="totalWeight"
                  value={newFoodNutrient.totalWeight}
                  onChange={handleInputChange}
                  placeholder="e.g., 200"
                  className="input-field"
                  aria-label="Total weight"
                  required
                  min="0.01"
                  step="0.01"
                />
                <label htmlFor="food-equivalent">Food Equivalent <span className="required">*</span></label>
                <input
                  id="food-equivalent"
                  type="text"
                  name="foodEquivalent"
                  value={newFoodNutrient.foodEquivalent}
                  onChange={handleInputChange}
                  placeholder="e.g., 1 cup"
                  className="input-field"
                  aria-label="Food equivalent"
                  required
                />
                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateFoodNutrientHandler : addFoodNutrientHandler}
                    disabled={loading || foods.length === 0 || nutrients.length === 0}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{
                      scale: loading || foods.length === 0 || nutrients.length === 0 ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: loading || foods.length === 0 || nutrients.length === 0 ? 1 : 0.95,
                    }}
                  >
                    {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Association" : "Add Nutrient to Food")}
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
          </div>

          <div className="nutrient-list-section">
            <div className="section-header">
              <h2>Nutrient-Food Associations</h2>
              <div className="nutrient-count">
                {foodNutrients.length}{" "}
                {foodNutrients.length === 1 ? "association" : "associations"} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading associations...</p>
              </div>
            ) : foodNutrients.length === 0 ? (
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
                <p>Create your first nutrient-food association to get started</p>
              </div>
            ) : (
              <div className="nutrient-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nutrient</th>
                      <th>Food</th>
                      <th>Nutrient Equivalent</th>
                      <th>Unit</th>
                      <th>Amount per Unit</th>
                      <th>Total Weight</th>
                      <th>Food Equivalent</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodNutrients.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>{item.nutrientName}</td>
                        <td>{item.foodName}</td>
                        <td>{item.nutrientEquivalent || "N/A"}</td>
                        <td>{item.unit || "N/A"}</td>
                        <td>{item.amountPerUnit || "N/A"}</td>
                        <td>{item.totalWeight || "N/A"}</td>
                        <td>{item.foodEquivalent || "N/A"}</td>
                        <td>
                          <motion.button
                            onClick={() => editFoodNutrientHandler(item)}
                            className="edit-button nutrient-specialist-button primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Edit ${item.nutrientName} in ${item.foodName}`}
                          >
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            onClick={() => deleteFoodNutrientHandler(item.foodId, item.nutrientId)}
                            className="delete-button nutrient-specialist-button secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`Delete ${item.nutrientName} in ${item.foodName}`}
                          >
                            <span>Delete</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default NutrientInFoodManagement;