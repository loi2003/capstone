import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllNutrientSuggestions,
  getNutrientSuggestionById,
  createNutrientSuggestion,
  updateNutrientSuggestion,
  deleteNutrientSuggestion,
  getAllNutrients,
  addNutrientSuggestionAttribute,
  getAllAgeGroups,
} from "../../apis/nutriet-api"; // Fixed typo from nutriet-api to nutrient-api
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/NutrientSuggestion.css";

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
    }, 3000);
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
const NutrientSuggestionModal = ({ suggestion, onClose, nutrients }) => {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{suggestion.nutrientSuggestionName || `Suggestion #${suggestion.id}`}</h2>
        <h3>Attributes:</h3>
        <ul>
          {Array.isArray(suggestion.nutrientSuggestionAttributes) &&
          suggestion.nutrientSuggestionAttributes.length > 0 ? (
            suggestion.nutrientSuggestionAttributes.map((attr) => (
              <li key={attr.nutrientId}>
                {nutrients.find((n) => n.id === attr.nutrientId)?.name ||
                  "Unknown Nutrient"}{" "}
                ({attr.amount} {attr.unit})
              </li>
            ))
          ) : (
            <li>No attributes added</li>
          )}
        </ul>
        <motion.button
          onClick={onClose}
          className="nutrient-specialist-button primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const NutrientAttributeModal = ({
  suggestionId,
  nutrients,
  ageGroups,
  onClose,
  onSave,
}) => {
  const [attributeData, setAttributeData] = useState({
    nutrientSuggestionId: suggestionId,
    ageGroupId: "",
    trimester: 0,
    maxEnergyPercentage: 0,
    minEnergyPercentage: 0,
    maxValuePerDay: 0,
    minValuePerDay: 0,
    unit: "milligrams",
    amount: 0,
    minAnimalProteinPercentageRequire: 0,
    nutrientId: "",
    type: 0,
  });

  const handleInputChange = (field, value) => {
    setAttributeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onSave(attributeData);
      onClose();
    } catch (error) {
      console.error("Error saving attribute:", error);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Add Attribute to Suggestion</h2>
        <div className="form-group">
          <label htmlFor="nutrientId">Nutrient</label>
          <select
            id="nutrientId"
            value={attributeData.nutrientId}
            onChange={(e) => handleInputChange("nutrientId", e.target.value)}
            className="input-field"
          >
            <option value="">Select Nutrient</option>
            {nutrients.map((nutrient) => (
              <option key={nutrient.id} value={nutrient.id}>
                {nutrient.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="ageGroupId">Age Group</label>
          <select
            id="ageGroupId"
            value={attributeData.ageGroupId}
            onChange={(e) => handleInputChange("ageGroupId", e.target.value)}
            className="input-field"
          >
            <option value="">Select Age Group</option>
            {ageGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="trimester">Trimester</label>
          <input
            id="trimester"
            type="number"
            value={attributeData.trimester}
            onChange={(e) =>
              handleInputChange("trimester", parseInt(e.target.value) || 0)
            }
            className="input-field"
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minEnergyPercentage">Min Energy Percentage</label>
          <input
            id="minEnergyPercentage"
            type="number"
            value={attributeData.minEnergyPercentage}
            onChange={(e) =>
              handleInputChange("minEnergyPercentage", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxEnergyPercentage">Max Energy Percentage</label>
          <input
            id="maxEnergyPercentage"
            type="number"
            value={attributeData.maxEnergyPercentage}
            onChange={(e) =>
              handleInputChange("maxEnergyPercentage", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minValuePerDay">Min Value Per Day</label>
          <input
            id="minValuePerDay"
            type="number"
            value={attributeData.minValuePerDay}
            onChange={(e) =>
              handleInputChange("minValuePerDay", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxValuePerDay">Max Value Per Day</label>
          <input
            id="maxValuePerDay"
            type="number"
            value={attributeData.maxValuePerDay}
            onChange={(e) =>
              handleInputChange("maxValuePerDay", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <select
            id="unit"
            value={attributeData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className="input-field"
          >
            <option value="milligrams">Milligrams</option>
            <option value="grams">Grams</option>
            <option value="micrograms">Micrograms</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={attributeData.amount}
            onChange={(e) =>
              handleInputChange("amount", parseFloat(e.target.value) || 0)
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minAnimalProteinPercentageRequire">
            Min Animal Protein Percentage
          </label>
          <input
            id="minAnimalProteinPercentageRequire"
            type="number"
            value={attributeData.minAnimalProteinPercentageRequire}
            onChange={(e) =>
              handleInputChange(
                "minAnimalProteinPercentageRequire",
                parseFloat(e.target.value) || 0
              )
            }
            className="input-field"
            min="0"
            step="0.1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <input
            id="type"
            type="number"
            value={attributeData.type}
            onChange={(e) =>
              handleInputChange("type", parseInt(e.target.value) || 0)
            }
            className="input-field"
            min="0"
          />
        </div>
        <div className="button-group">
          <motion.button
            onClick={handleSubmit}
            className="nutrient-specialist-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Attribute
          </motion.button>
          <motion.button
            onClick={onClose}
            className="nutrient-specialist-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NutrientSuggestion = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState({ name: "" });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedViewSuggestion, setSelectedViewSuggestion] = useState(null);
  const [selectedAttributeSuggestion, setSelectedAttributeSuggestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleHomepageNavigation = () => {
    setIsSidebarOpen(true);
    navigate("/nutrient-specialist");
  };

  useEffect(() => {
    const fetchUser = () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      getCurrentUser(token)
        .then((response) => {
          const userData = response.data?.data || response.data;
          if (userData && Number(userData.roleId) === 4) {
            setUser(userData);
          } else {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/signin", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error.message);
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        });
    };
    fetchUser();
  }, [navigate, token]);

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
      const [suggestionsResponse, nutrientsData, ageGroupsData] = await Promise.all([
        getAllNutrientSuggestions(token),
        getAllNutrients(token),
        getAllAgeGroups(token),
      ]);
      const suggestionsData = suggestionsResponse?.data || [];
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
      setNutrients(Array.isArray(nutrientsData) ? nutrientsData : []);
      setAgeGroups(Array.isArray(ageGroupsData) ? ageGroupsData : []);
    } catch (err) {
      console.error("Fetch error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      setSuggestions([]);
      setNutrients([]);
      setAgeGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionById = async (id) => {
    setLoading(true);
    try {
      const data = await getNutrientSuggestionById(id, token);
      setSelectedSuggestion(data);
      setNewSuggestion({
        name: data.nutrientSuggestionName || "",
      });
      setIsEditing(true);
      return data;
    } catch (err) {
      showNotification(`Failed to fetch suggestion details: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const createSuggestionHandler = async () => {
    if (!newSuggestion.name || newSuggestion.name.trim() === "") {
      showNotification("Suggestion name is required", "error");
      return;
    }

    setLoading(true);
    try {
      await createNutrientSuggestion({ name: newSuggestion.name }, token);
      setNewSuggestion({ name: "" });
      setIsEditing(false);
      await fetchData();
      showNotification("Nutrient suggestion created successfully", "success");
    } catch (err) {
      console.error("Create suggestion error:", err);
      showNotification(
        `Failed to create suggestion: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionHandler = async () => {
    if (!newSuggestion.name || newSuggestion.name.trim() === "") {
      showNotification("Suggestion name is required", "error");
      return;
    }
    setLoading(true);
    try {
      await updateNutrientSuggestion(
        {
          suggestionId: selectedSuggestion?.id,
          name: newSuggestion.name,
        },
        token
      );
      setNewSuggestion({ name: "" });
      setSelectedSuggestion(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Nutrient suggestion updated successfully", "success");
    } catch (err) {
      showNotification(
        `Failed to update suggestion: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSuggestionHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
    setLoading(true);
    try {
      await deleteNutrientSuggestion(id, token);
      setSelectedSuggestion(null);
      setIsEditing(false);
      setNewSuggestion({ name: "" });
      await fetchData();
      showNotification("Nutrient suggestion deleted successfully", "success");
    } catch (err) {
      showNotification(`Failed to delete suggestion: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async (attributeData) => {
    setLoading(true);
    try {
      await addNutrientSuggestionAttribute(attributeData, token);
      showNotification("Attribute added successfully", "success");
      await fetchData();
    } catch (error) {
      console.error("Error adding attribute:", error);
      showNotification(`Failed to add attribute: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId, token);
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

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      (suggestion.nutrientSuggestionName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const indexOfLastSuggestion = currentPage * itemsPerPage;
  const indexOfFirstSuggestion = indexOfLastSuggestion - itemsPerPage;
  const currentSuggestions = filteredSuggestions.slice(
    indexOfFirstSuggestion,
    indexOfLastSuggestion
  );

  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);

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
    initial: { opacity: 0, x: -20, backgroundColor: "rgba(0, 0, 0, 0)" },
    animate: {
      opacity: 1,
      x: 0,
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      backgroundColor: "#4caf50",
      transform: "translateY(-2px)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="nutrient-suggestion">
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
          variants={containerVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
                whileHover="hover"
              >
                <button
                  onClick={handleHomepageNavigation}
                  title="Homepage"
                  aria-label="Navigate to homepage"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Home icon for homepage"
                  >
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12h6v10"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Homepage</span>}
                </button>
              </motion.div>
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
                animate={isSidebarOpen && isFoodDropdownOpen ? "open" : "closed"}
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
                  isSidebarOpen && isNutrientDropdownOpen ? "open" : "closed"
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
                className="sidebar-nav-item"
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
                  to="/nutrient-specialist/energy-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Energy Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Energy icon for energy suggestion"
                  >
                    <path
                      d="M12 2l-6 9h4v7l6-9h-4V2zm-2 9h4m-4-7v3m4 3v3"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Energy Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item active"
                whileHover="hover"
              >
                <Link
                  to="/nutrient-specialist/nutrient-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient suggestion icon for nutrient suggestion"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4h4m-4 2v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Suggestion</span>}
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
                  title={isSidebarOpen ? user.email : "Profile"}
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
            <h1>Manage Nutrient Suggestions</h1>
            <p>Create, edit, and manage nutrient suggestions for dietary plans</p>
          </div>
        </div>
        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>
                {isEditing ? "Edit Nutrient Suggestion" : "Add New Nutrient Suggestion"}
              </h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="suggestion-name">Suggestion Name</label>
                <input
                  id="suggestion-name"
                  type="text"
                  value={newSuggestion.name}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter suggestion name"
                  className="input-field"
                />
              </div>
              <div className="button-group">
                <motion.button
                  onClick={
                    isEditing ? updateSuggestionHandler : createSuggestionHandler
                  }
                  disabled={loading}
                  className="submit-button nutrient-specialist-button primary"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Suggestion"
                    : "Create Suggestion"}
                </motion.button>
                {isEditing && (
                  <motion.button
                    onClick={() => {
                      setNewSuggestion({ name: "" });
                      setSelectedSuggestion(null);
                      setIsEditing(false);
                    }}
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
          <div className="nutrient-list-section">
            <div className="section-header">
              <h2>Nutrient Suggestion List</h2>
              <div className="nutrient-count">
                {filteredSuggestions.length}{" "}
                {filteredSuggestions.length === 1 ? "suggestion" : "suggestions"} found
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="search-suggestions">Search Suggestions</label>
              <input
                id="search-suggestions"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                className="search-input"
              />
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading suggestions...</p>
              </div>
            ) : !Array.isArray(suggestions) || suggestions.length === 0 ? (
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
                <h3>No suggestions found</h3>
                <p>Create your first nutrient suggestion to get started</p>
              </div>
            ) : (
              <>
                <div className="nutrient-grid">
                  {currentSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      className="nutrient-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="card-header">
                        <h3>
                          {suggestion.nutrientSuggestionName || `Suggestion #${suggestion.id}`}
                        </h3>
                      </div>
                      <div className="card-actions">
                        <motion.button
                          onClick={() => setSelectedAttributeSuggestion(suggestion)}
                          className="add-attribute-button nutrient-specialist-button secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add Attribute
                        </motion.button>
                        <motion.button
                          onClick={() => fetchSuggestionById(suggestion.id)}
                          className="edit-button nutrient-specialist-button primary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => setSelectedViewSuggestion(suggestion)}
                          className="view-button nutrient-specialist-button secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View
                        </motion.button>
                        <motion.button
                          onClick={() => deleteSuggestionHandler(suggestion.id)}
                          className="delete-button nutrient-specialist-button secondary"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {totalPages > 0 && (
                  <div className="pagination-controls">
                    <motion.button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-button"
                      whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                      whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                    >
                      Previous
                    </motion.button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <motion.button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                      whileHover={{
                        scale: currentPage === totalPages ? 1 : 1.05,
                      }}
                      whileTap={{
                        scale: currentPage === totalPages ? 1 : 0.95,
                      }}
                    >
                      Next
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <AnimatePresence>
          {selectedViewSuggestion && (
            <NutrientSuggestionModal
              suggestion={selectedViewSuggestion}
              onClose={() => setSelectedViewSuggestion(null)}
              nutrients={nutrients}
            />
          )}
          {selectedAttributeSuggestion && (
            <NutrientAttributeModal
              suggestionId={selectedAttributeSuggestion.id}
              nutrients={nutrients}
              ageGroups={ageGroups}
              onClose={() => setSelectedAttributeSuggestion(null)}
              onSave={handleAddAttribute}
            />
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default NutrientSuggestion;