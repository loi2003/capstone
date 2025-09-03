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
import { getCurrentUser, logout } from "../../apis/authentication-api";
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
    foodList: [], // Stores objects with { foodId, unit, amount }
  });
  const [selectedDish, setSelectedDish] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSidebarPage, setCurrentSidebarPage] = useState(1);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 4) {
          setUser(userData);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

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
      const [dishesResponse, foodsData] = await Promise.all([
        getAllDishes(),
        getAllFoods(),
      ]);
      console.log("Fetched dishes response:", dishesResponse);
      console.log("Fetched foods:", foodsData);
      const dishesData = dishesResponse?.data || [];
      setDishes(Array.isArray(dishesData) ? dishesData : []);
      setFoods(Array.isArray(foodsData) ? foodsData : []);
    } catch (err) {
      console.error("Fetch error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      setDishes([]);
      setFoods([]);
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
        foodList: Array.isArray(data.foods) ? data.foods.map(food => ({
          foodId: food.foodId,
          unit: food.unit === "g" ? "grams" : food.unit,
          amount: food.amount || 0,
        })) : [],
      });
      setIsEditing(true);
    } catch (err) {
      showNotification(`Failed to fetch dish details: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const createDishHandler = async () => {
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
        foodList: newDish.foodList.map(food => ({
          foodId: food.foodId,
          unit: food.unit === "grams" ? "g" : food.unit,
          amount: food.amount,
        })),
      });
      setNewDish({
        foodList: [],
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Dish created successfully", "success");
    } catch (err) {
      console.error("Create dish error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(`Failed to create dish: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateDishHandler = async () => {
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
      console.log("Updating dish with ID:", selectedDish?.id);
      await updateDish({
        dishId: selectedDish?.id,
        foodList: newDish.foodList.map(food => ({
          foodId: food.foodId,
          unit: food.unit === "grams" ? "g" : food.unit,
          amount: food.amount,
        })),
      });
      setNewDish({
        foodList: [],
      });
      setSelectedDish(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Dish updated successfully", "success");
    } catch (err) {
      showNotification(`Failed to update dish: ${err.response?.data?.message || err.message}`, "error");
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
      foodList: [],
    });
    setSelectedDish(null);
    setIsEditing(false);
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
    if (isNutrientDropdownOpen) setIsNutrientDropdownOpen(false);
    if (isFoodDropdownOpen) setIsFoodDropdownOpen(false);
  };

  const toggleNutrientDropdown = () => {
    setIsNutrientDropdownOpen((prev) => !prev);
  };

  const toggleFoodDropdown = () => {
    setIsFoodDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
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

  // Fix for toLowerCase error
  const filteredDishes = dishes.filter(
    (dish) =>
      (dish.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dish.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const sidebarVariants = {
    open: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "60px",
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
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

      {/* Sidebar */}
      <motion.aside
        className={`nutrient-specialist-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link
            to="/nutrient-specialist"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Leaf icon for nutrient specialist panel"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--orange-secondary)"
                  stroke="var(--orange-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Nutrient Panel</span>}
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
                stroke="var(--orange-white)"
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
        <motion.nav
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/blog-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Blog Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Edit icon for blog management"
                  >
                    <path
                      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4L18.5 2.5z"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Blog Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={isFoodDropdownOpen ? "Collapse food menu" : "Expand food menu"}
                  title="Food"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Apple icon for food management"
                  >
                    <path
                      d="M12 20c-4 0-7-4-7-8s3-8 7-8c1 0 2 .5 3 1.5 1-.5 2-1 3-1 4 0 7 4 7 8s-3 8-7 8c-1 0-2-.5-3-1.5-1 .5-2 1-3 1zm0-15c-2 0-3 2-3 4m6 0c0-2-1-4-3-4"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Food</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${isFoodDropdownOpen ? "open" : ""}`}
                    >
                      <path
                        stroke="var(--orange-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"}
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={isSidebarOpen && !isFoodDropdownOpen ? "closed" : "open"}
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Folder icon for food category management"
                    >
                      <path
                        d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
                        fill="var(--orange-secondary)"
                        stroke="var(--orange-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Apple icon for food management"
                    >
                      <path
                        d="M12 20c-4 0-7-4-7-8s3-8 7-8c1 0 2 .5 3 1.5 1-.5 2-1 3-1 4 0 7 4 7 8s-3 8-7 8c-1 0-2-.5-3-1.5-1 .5-2 1-3 1zm0-15c-2 0-3 2-3 4m6 0c0-2-1-4-3-4"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Food Management</span>}
                </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <button
                  onClick={toggleNutrientDropdown}
                  className="nutrient-dropdown-toggle"
                  aria-label={isNutrientDropdownOpen ? "Collapse nutrient menu" : "Expand nutrient menu"}
                  title="Nutrient"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient icon for nutrient management"
                  >
                    <path
                      d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                      stroke="var(--orange-white)"
                      fill="var(--orange-accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${isNutrientDropdownOpen ? "open" : ""}`}
                    >
                      <path
                        stroke="var(--orange-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={isNutrientDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"}
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="nutrient-dropdown"
                variants={dropdownVariants}
                animate={isSidebarOpen && !isNutrientDropdownOpen ? "closed" : "open"}
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
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
                        fill="var(--orange-secondary)"
                        stroke="var(--orange-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
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
                        stroke="var(--orange-white)"
                        fill="var(--orange-accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Nutrient in food icon"
                  >
                    <path
                      d="M7 20h10M12 4v12M7 7c0-3 2-5 5-5s5 2 5 5c0 3-2 5-5 5s-5-2-5-5z"
                      stroke="var(--orange-white)"
                      fill="var(--orange-accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/age-group-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Age Group Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Users icon for age group management"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-10a4 4 0 010-8m-6 4a4 4 0 11-8 0 4 4 0 018 0zm10 13v-2a4 4 0 00-3-3.87"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Age Group Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
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
                    aria-label="Plate icon for dish management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 8a4 4 0 014-4 4 4 0 014 4"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Dish Management</span>}
                </Link>
              </motion.div>
            </>
          )}
          {currentSidebarPage === 2 && (
            <>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/allergy-category-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Category Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for allergy category management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/allergy-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for allergy management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Disease Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for disease management"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Disease Management</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/nutrient-policy"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Policy"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Document icon for nutrient policy"
                  >
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Policy</span>}
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="sidebar-nav-item">
                <Link
                  to="/nutrient-specialist/nutrient-tutorial"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Tutorial"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Book icon for nutrient tutorial"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                      fill="var(--orange-accent)"
                      stroke="var(--orange-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Tutorial</span>}
                </Link>
              </motion.div>
            </>
          )}
          <motion.div variants={navItemVariants} className="sidebar-nav-item page-switcher">
            <button
              onClick={() => setCurrentSidebarPage(1)}
              className={currentSidebarPage === 1 ? "active" : ""}
              aria-label="Switch to sidebar page 1"
              title="<<"
            >
              {isSidebarOpen ? "<<" : "<<"}
            </button>
            <button
              onClick={() => setCurrentSidebarPage(2)}
              className={currentSidebarPage === 2 ? "active" : ""}
              aria-label="Switch to sidebar page 2"
              title=">>"
            >
              {isSidebarOpen ? ">>" : ">>"}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item nutrient-specialist-profile-section"
              >
                <Link
                  to="/profile"
                  className="nutrient-specialist-profile-info"
                  title={isSidebarOpen ? user.email : ""}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--orange-white)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="nutrient-specialist-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--orange-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div variants={navItemVariants} className="sidebar-nav-item">
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Login icon"
                >
                  <path
                    stroke="var(--orange-white)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
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
                        <span>{foods.find(f => f.id === food.foodId)?.name || "Unknown Food"}</span>
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
            ) : !Array.isArray(dishes) || dishes.length === 0 ? (
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
                {filteredDishes.map(dish => (
                  <motion.div
                    key={dish.id}
                    className="nutrient-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <h3>Dish #{dish.id}</h3>
                    </div>
                    <div className="food-list">
                      <h4>Foods:</h4>
                      <ul>
                        {Array.isArray(dish.foods) && dish.foods.length > 0 ? (
                          dish.foods.map(food => (
                            <li key={food.foodId}>
                              {food.foodName || foods.find(f => f.id === food.foodId)?.name || "Unknown Food"} ({food.amount} {food.unit})
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