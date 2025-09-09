import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllNutrients,
  getAllFoods,
  addNutrientsToFood,
  deleteFoodNutrient,
  updateFoodNutrient,
} from "../../apis/nutriet-api";
import "../../styles/NutrientInFoodManagement.css";
import { getCurrentUser, logout } from "../../apis/authentication-api";

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
  const [filteredFoodNutrients, setFilteredFoodNutrients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [currentSidebarPage, setCurrentSidebarPage] = useState(1);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
      const [nutrientsData, foodsData] = await Promise.all([
        getAllNutrients(),
        getAllFoods(),
      ]);
      console.log("Fetched nutrients:", nutrientsData);
      console.log("Fetched foods:", foodsData);

      const nutrientMap = new Map(nutrientsData.map((n) => [n.id, n.name]));
      const foodNutrientData = [];
      foodsData.forEach((food) => {
        food.foodNutrients.forEach((fn) => {
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
      setFilteredFoodNutrients(foodNutrientData);
    } catch (err) {
      console.error("Fetch data error:", err.response?.data || err.message);
      showNotification(`Failed to fetch data: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = foodNutrients.filter(
      (item) =>
        item.nutrientName.toLowerCase().includes(query) ||
        item.foodName.toLowerCase().includes(query)
    );
    setFilteredFoodNutrients(filtered);
  };

  const addFoodNutrientHandler = async () => {
    const {
      foodId,
      nutrientId,
      nutrientEquivalent,
      unit,
      amountPerUnit,
      totalWeight,
      foodEquivalent,
    } = newFoodNutrient;

    if (!foodId || !nutrientId || !unit || !foodEquivalent) {
      showNotification("All fields are required", "error");
      return;
    }
    const numericFields = {
      nutrientEquivalent: Number(nutrientEquivalent),
      amountPerUnit: Number(amountPerUnit),
      totalWeight: Number(totalWeight),
    };
    if (Object.values(numericFields).some((val) => isNaN(val) || val <= 0)) {
      showNotification(
        "Nutrient Equivalent, Amount per Unit, and Total Weight must be greater than 0",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        foodId,
        nutrients: [
          {
            nutrientId,
            nutrientEquivalent: numericFields.nutrientEquivalent,
            unit,
            amountPerUnit: numericFields.amountPerUnit,
            totalWeight: numericFields.totalWeight,
            foodEquivalent,
          },
        ],
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
      showNotification(
        `Failed to add nutrient to food: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFoodNutrientHandler = async () => {
    const {
      foodId,
      nutrientId,
      nutrientEquivalent,
      unit,
      amountPerUnit,
      totalWeight,
      foodEquivalent,
    } = newFoodNutrient;

    if (!foodId || !nutrientId || !unit || !foodEquivalent) {
      showNotification("All fields are required", "error");
      return;
    }
    const numericFields = {
      nutrientEquivalent: Number(nutrientEquivalent),
      amountPerUnit: Number(amountPerUnit),
      totalWeight: Number(totalWeight),
    };
    if (Object.values(numericFields).some((val) => isNaN(val) || val <= 0)) {
      showNotification(
        "Nutrient Equivalent, Amount per Unit, and Total Weight must be greater than 0",
        "error"
      );
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
      showNotification(
        "Nutrient-food association updated successfully",
        "success"
      );
    } catch (err) {
      console.error(
        "Update nutrient error:",
        err.response?.data || err.message
      );
      showNotification(
        `Failed to update association: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
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
    if (
      !window.confirm(
        "Are you sure you want to delete this nutrient-food association?"
      )
    )
      return;
    setLoading(true);
    try {
      console.log("Deleting nutrient-food association:", {
        FoodId: foodId,
        NutrientId: nutrientId,
      });
      await deleteFoodNutrient(foodId, nutrientId);
      await fetchData();
      showNotification(
        "Nutrient-food association deleted successfully",
        "success"
      );
    } catch (err) {
      console.error(
        "Delete association error:",
        err.response?.data || err.message
      );
      showNotification(
        `Failed to delete association: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFoodNutrient({ ...newFoodNutrient, [name]: value });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
      width: "min(280px, 25vw)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      width: "min(60px, 15vw)",
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
    hover: {
      backgroundColor: "var(--blue-secondary)",
      transform: "translateY(-2px)",
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
        className={`nutrient-specialist-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
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
                  fill="var(--nutrient-specialist-highlight)"
                  stroke="var(--nutrient-specialist-primary)"
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
        <motion.nav
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={navItemVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                    aria-label="Blog icon for blog management"
                  >
                    <path
                      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Blog Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={
                    isFoodDropdownOpen
                      ? "Collapse food menu"
                      : "Expand food menu"
                  }
                  title="Food"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Food icon for food management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4l2 6-6 2 6 2 2-6-2-6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      className={`dropdown-icon ${
                        isFoodDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && !isFoodDropdownOpen ? "closed" : "open"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                  whileHover="hover"
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
                      aria-label="Category icon for food category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
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
                  whileHover="hover"
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
                      aria-label="Food item icon for food management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <button
                  onClick={toggleNutrientDropdown}
                  className="nutrient-dropdown-toggle"
                  aria-label={
                    isNutrientDropdownOpen
                      ? "Collapse nutrient menu"
                      : "Expand nutrient menu"
                  }
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
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
                      className={`dropdown-icon ${
                        isNutrientDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isNutrientDropdownOpen
                            ? "M6 9l6 6 6-6"
                            : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="nutrient-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && !isNutrientDropdownOpen ? "closed" : "open"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                  whileHover="hover"
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
                      aria-label="Category icon for nutrient category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
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
                  whileHover="hover"
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
                      aria-label="Nutrient item icon for nutrient management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item active"
                whileHover="hover"
              >
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
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-3 2h6v2H9v-2zm0 4h6v2H9v-2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Age Group Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                    aria-label="Category icon for allergy category management"
                  >
                    <path
                      d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                      fill="var(--nutrient-specialist-secondary)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                    aria-label="Allergy icon for allergy management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4m0 4v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                    aria-label="Medical icon for disease management"
                  >
                    <path
                      d="M19 7h-3V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H5a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h4a2 2 0 002-2v-3h3a2 2 0 002-2V9a2 2 0 00-2-2zm-7 10v3h-2v-3H7v-2h3V9h2v3h3v2h-3z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Disease Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <Link
                  to="/nutrient-specialist/warning-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Warning Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for warning management"
                  >
                    <path
                      d="M12 2l10 20H2L12 2zm0 4v8m0 4v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Warning Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <Link
                  to="/nutrient-specialist/meal-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Meal Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Meal icon for meal management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 4h8v2H8v-2zm0 4h8v2H8v-2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Meal Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <Link
                  to="/nutrient-specialist/messenger-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Messenger Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Messenger icon for messenger management"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Messenger Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Policy</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
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
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
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
          <motion.div
            variants={navItemVariants}
            className="sidebar-nav-item page-switcher"
            whileHover="hover"
          >
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
                whileHover="hover"
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
                      fill="var(--nutrient-specialist-white)"
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
                whileHover="hover"
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
                      stroke="var(--nutrient-specialist-logout)"
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
            <motion.div
              variants={navItemVariants}
              className="sidebar-nav-item"
              whileHover="hover"
            >
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
                    stroke="var(--nutrient-specialist-white)"
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
            <h1>Manage Nutrients in Foods</h1>
            <p>Associate nutrients with foods and manage their details</p>
          </div>
        </div>

        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>
                {isEditing
                  ? "Edit Nutrient-Food Association"
                  : "Add Nutrient to Food"}
              </h2>
            </div>
            {(foods.length === 0 || nutrients.length === 0) && (
              <p className="no-results">
                No foods or nutrients available. Please add foods and nutrients
                first.
              </p>
            )}
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="food-id">
                  Food <span className="required">*</span>
                </label>
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
                <label htmlFor="nutrient-id">
                  Nutrient <span className="required">*</span>
                </label>
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
                <label htmlFor="nutrient-equivalent">
                  Nutrient Equivalent <span className="required">*</span>
                </label>
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
                <label htmlFor="unit">
                  Unit <span className="required">*</span>
                </label>
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
                <label htmlFor="amount-per-unit">
                  Amount per Unit <span className="required">*</span>
                </label>
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
                <label htmlFor="total-weight">
                  Total Weight <span className="required">*</span>
                </label>
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
                <label htmlFor="food-equivalent">
                  Food Equivalent <span className="required">*</span>
                </label>
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
                    onClick={
                      isEditing
                        ? updateFoodNutrientHandler
                        : addFoodNutrientHandler
                    }
                    disabled={
                      loading || foods.length === 0 || nutrients.length === 0
                    }
                    className="submit-button nutrient-specialist-button primary"
                    whileHover={{
                      scale:
                        loading || foods.length === 0 || nutrients.length === 0
                          ? 1
                          : 1.05,
                    }}
                    whileTap={{
                      scale:
                        loading || foods.length === 0 || nutrients.length === 0
                          ? 1
                          : 0.95,
                    }}
                  >
                    {loading
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                      ? "Update Association"
                      : "Add Nutrient to Food"}
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
              <div className="header-controls">
                <input
                  type="text"
                  placeholder="Search by nutrient or food name..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="input-field search-input"
                  aria-label="Search nutrient-food associations"
                />
                <div className="nutrient-count">
                  {filteredFoodNutrients.length}{" "}
                  {filteredFoodNutrients.length === 1
                    ? "association"
                    : "associations"}{" "}
                  found
                </div>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <p>Loading associations...</p>
              </div>
            ) : filteredFoodNutrients.length === 0 ? (
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
                <p>
                  Create your first nutrient-food association to get started
                </p>
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
                    {filteredFoodNutrients.map((item) => (
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
                        <td className="action-buttons">
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
                            onClick={() =>
                              deleteFoodNutrientHandler(
                                item.foodId,
                                item.nutrientId
                              )
                            }
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