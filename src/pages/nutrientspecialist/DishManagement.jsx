import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  getAllFoods,
} from "../../apis/nutriet-api";
import "../../styles/DishManagement.css";

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

const DishManagement = () => {
  const [dishes, setDishes] = useState([]);
  const [foods, setFoods] = useState([]);
  const [newDish, setNewDish] = useState({
    name: "",
    foodList: [], // Now stores objects with { foodId, unit, amount }
  });
  const [selectedDish, setSelectedDish] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
      const [dishesData, foodsData] = await Promise.all([
        getAllDishes(),
        getAllFoods(),
      ]);
      console.log("Fetched dishes:", dishesData);
      console.log("Fetched foods:", foodsData);
      setDishes(dishesData);
      setFoods(foodsData);
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDishById = async (id) => {
    console.log("Fetching dish with ID:", id);
    setLoading(true);
    try {
      const data = await getDishById(id);
      console.log("Fetched dish data:", data);
      setSelectedDish(data);
      setNewDish({
        name: data.name || "",
        foodList: data.foodList.map(food => ({
          foodId: food.id,
          unit: food.unit || "grams",
          amount: food.amount || 0,
        })) || [],
      });
      setIsEditing(true);
    } catch (err) {
      showNotification(`Failed to fetch dish details: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const createDishHandler = async () => {
    if (!newDish.name.trim()) {
      showNotification("Dish name is required", "error");
      return;
    }
    if (newDish.foodList.length === 0) {
      showNotification("Please select at least one food", "error");
      return;
    }
    if (newDish.foodList.some(food => !food.unit || food.amount <= 0)) {
      showNotification("Please provide valid unit and amount for all selected foods", "error");
      return;
    }
    setLoading(true);
    try {
      console.log("Creating dish with data:", newDish);
      await createDish({
        name: newDish.name,
        foodList: newDish.foodList,
      });
      setNewDish({
        name: "",
        foodList: [],
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Dish created successfully", "success");
    } catch (err) {
      showNotification(`Failed to create dish: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateDishHandler = async () => {
    if (!newDish.name.trim()) {
      showNotification("Dish name is required", "error");
      return;
    }
    if (newDish.foodList.length === 0) {
      showNotification("Please select at least one food", "error");
      return;
    }
    if (newDish.foodList.some(food => !food.unit || food.amount <= 0)) {
      showNotification("Please provide valid unit and amount for all selected foods", "error");
      return;
    }
    setLoading(true);
    try {
      console.log("Updating dish with ID:", selectedDish.id);
      await updateDish({
        dishID: selectedDish.id,
        name: newDish.name,
        foodList: newDish.foodList,
      });
      setNewDish({
        name: "",
        foodList: [],
      });
      setSelectedDish(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Dish updated successfully", "success");
    } catch (err) {
      showNotification(`Failed to update dish: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDishHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    setLoading(true);
    try {
      console.log("Deleting dish with ID:", id);
      await deleteDish(id);
      setSelectedDish(null);
      setIsEditing(false);
      setNewDish({
        name: "",
        foodList: [],
      });
      await fetchData();
      showNotification("Dish deleted successfully", "success");
    } catch (err) {
      showNotification(`Failed to delete dish: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setNewDish({
      name: "",
      foodList: [],
    });
    setSelectedDish(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  const handleFoodSelect = (foodId) => {
    setNewDish(prev => {
      const currentFoods = [...prev.foodList];
      const index = currentFoods.findIndex(food => food.foodId === foodId);

      if (index > -1) {
        currentFoods.splice(index, 1);
      } else {
        currentFoods.push({ foodId, unit: "grams", amount: 1 });
      }

      return { ...prev, foodList: currentFoods };
    });
  };

  const handleFoodDetailChange = (foodId, field, value) => {
    setNewDish(prev => ({
      ...prev,
      foodList: prev.foodList.map(food =>
        food.foodId === foodId ? { ...food, [field]: value } : food
      ),
    }));
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
      width: "min(320px, 30vw)", // Increased width for consistency
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "min(80px, 20vw)", // Increased width for consistency
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <div className="dish-management">
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
                aria-label="Sprout icon"
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
              to="/nutrient-specialist/dish-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Dish Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Dish icon"
              >
                <path
                  d="M12 3v10m0 0c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-7 8h14a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 012-2z"
                  stroke="var(--nutrient-specialist-white)"
                  fill="var(--nutrient-specialist-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Dish Management</span>}
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
            <h1>Manage Dishes</h1>
            <p>Create, edit, and manage dishes composed of multiple foods</p>
          </div>
        </div>

        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Dish" : "Add New Dish"}</h2>
            </div>
            {foods.length === 0 && (
              <p className="no-results">
                No foods available. Please add foods first.
              </p>
            )}
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="dish-name">Dish Name</label>
                <input
                  id="dish-name"
                  type="text"
                  name="name"
                  value={newDish.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Vegetable Puree"
                  className="input-field"
                  aria-label="Dish name"
                />
                <label htmlFor="food-selection">Select Foods</label>
                <div className="food-selection-container">
                  {foods.map(food => (
                    <motion.div
                      key={food.id}
                      className={`food-item ${
                        newDish.foodList.some(f => f.foodId === food.id) ? "selected" : ""
                      }`}
                      onClick={() => handleFoodSelect(food.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="food-name">{food.name}</span>
                      {newDish.foodList.some(f => f.foodId === food.id) && (
                        <span className="checkmark">✓</span>
                      )}
                    </motion.div>
                  ))}
                </div>
                {newDish.foodList.length > 0 && (
                  <div className="food-details-container">
                    <h4>Food Details</h4>
                    {newDish.foodList.map(food => (
                      <div key={food.foodId} className="food-detail-item">
                        <span>{foods.find(f => f.id === food.foodId)?.name}</span>
                        <div className="food-detail-inputs">
                          <select
                            value={food.unit}
                            onChange={e => handleFoodDetailChange(food.foodId, "unit", e.target.value)}
                            className="input-field"
                          >
                            <option value="grams">Grams</option>
                            <option value="cups">Cups</option>
                            <option value="tablespoons">Tablespoons</option>
                            <option value="teaspoons">Teaspoons</option>
                          </select>
                          <input
                            type="number"
                            value={food.amount}
                            onChange={e => handleFoodDetailChange(food.foodId, "amount", parseFloat(e.target.value))}
                            placeholder="Amount"
                            className="input-field"
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="button-group">
                  <motion.button
                    onClick={isEditing ? updateDishHandler : createDishHandler}
                    disabled={loading || foods.length === 0}
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{
                      scale: loading || foods.length === 0 ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: loading || foods.length === 0 ? 1 : 0.95,
                    }}
                  >
                    {loading
                      ? isEditing
                        ? "Updating..."
                        : "Creating..."
                      : isEditing
                      ? "Update Dish"
                      : "Create Dish"}
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
              <h2>Dish List</h2>
              <div className="nutrient-count">
                {dishes.length} {dishes.length === 1 ? "dish" : "dishes"} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading dishes...</p>
              </div>
            ) : dishes.length === 0 ? (
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
                <h3>No dishes found</h3>
                <p>Create your first dish to get started</p>
              </div>
            ) : (
              <div className="nutrient-grid">
                {dishes.map(dish => (
                  <motion.div
                    key={dish.id}
                    className="nutrient-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <h3>{dish.name || "Unnamed Dish"}</h3>
                    </div>
                    <div className="food-list">
                      <h4>Foods:</h4>
                      <ul>
                        {dish.foodList && dish.foodList.length > 0 ? (
                          dish.foodList.map(food => (
                            <li key={food.id}>
                              {food.name} ({food.amount} {food.unit})
                            </li>
                          ))
                        ) : (
                          <li>No foods in this dish</li>
                        )}
                      </ul>
                    </div>
                    <div className="card-actions">
                      <motion.button
                        onClick={() => fetchDishById(dish.id)}
                        className="edit-button nutrient-specialist-button primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => deleteDishHandler(dish.id)}
                        className="delete-button nutrient-specialist-button secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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

export default DishManagement;