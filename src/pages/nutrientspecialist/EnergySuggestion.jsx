import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllEnergySuggestions,
  getEnergySuggestionById,
  createEnergySuggestion,
  updateEnergySuggestion,
  deleteEnergySuggestion,
  getAllAgeGroups,
} from "../../apis/nutriet-api";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/EnergySuggestion.css";

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

const EnergySuggestionModal = ({ suggestion, onClose, ageGroups }) => {
  const getAgeGroupRange = (ageGroupId) => {
    const ageGroup = ageGroups.find((group) => group.id === ageGroupId);
    return ageGroup ? `${ageGroup.fromAge}-${ageGroup.toAge} years` : "Unknown";
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
        <h2>Energy Suggestion for Age Group {getAgeGroupRange(suggestion.ageGroupId)}</h2>
        <p>
          <strong>Age Group:</strong> {getAgeGroupRange(suggestion.ageGroupId)}
        </p>
        <p>
          <strong>Activity Level:</strong>{" "}
          {suggestion.activityLevelDisplay || suggestion.activityLevel}
        </p>
        <p>
          <strong>Base Calories:</strong> {suggestion.baseCalories} kcal
        </p>
        <p>
          <strong>Trimester:</strong> {suggestion.trimester || "N/A"}
        </p>
        <p>
          <strong>Additional Calories:</strong>{" "}
          {suggestion.additionalCalories || "N/A"} kcal
        </p>
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

const EnergySuggestion = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState({
    ageGroupId: "",
    activityLevel: "",
    baseCalories: "",
    trimester: "",
    additionalCalories: "",
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedViewSuggestion, setSelectedViewSuggestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
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
        console.error("Error fetching user:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
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

  const normalizeActivityLevel = (activityLevel) => {
    if (activityLevel === "Light" || activityLevel === 1) return "1-light";
    if (activityLevel === "Moderate" || activityLevel === 2) return "2-moderate";
    return activityLevel || "";
  };

  const getAgeGroupRange = (ageGroupId) => {
    const ageGroup = ageGroups.find((group) => group.id === ageGroupId);
    return ageGroup ? `${ageGroup.fromAge}-${ageGroup.toAge} years` : "Unknown";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllEnergySuggestions();
      let suggestionsData;
      if (Array.isArray(response)) {
        suggestionsData = response;
      } else {
        suggestionsData = response?.data || [];
      }
      console.log("Processed suggestions data:", suggestionsData);
      const normalizedSuggestions = Array.isArray(suggestionsData)
        ? suggestionsData.map((suggestion) => ({
            ...suggestion,
            activityLevelDisplay: normalizeActivityLevel(suggestion.activityLevel),
            activityLevel: normalizeActivityLevel(suggestion.activityLevel),
          }))
        : [];
      setSuggestions(normalizedSuggestions);
    } catch (err) {
      console.error("Fetch error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(
        `Failed to fetch energy suggestions: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgeGroups = async () => {
    try {
      const response = await getAllAgeGroups();
      const ageGroupsData = response?.data || [];
      console.log("Fetched age groups:", ageGroupsData);
      setAgeGroups(Array.isArray(ageGroupsData) ? ageGroupsData : []);
    } catch (err) {
      console.error("Error fetching age groups:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(
        `Failed to fetch age groups: ${err.response?.data?.message || err.message}`,
        "error"
      );
      setAgeGroups([]);
    }
  };

  const fetchSuggestionById = async (id) => {
    console.log("Fetching suggestion with ID:", id);
    if (!id) {
      showNotification("Invalid suggestion ID", "error");
      console.error("fetchSuggestionById called with invalid ID:", id);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Authentication token is missing. Please sign in again.", "error");
        navigate("/signin", { replace: true });
        return;
      }
      const response = await getEnergySuggestionById(id, token);
      console.log("Raw API response:", response);
      if (!response) {
        showNotification("Energy suggestion not found", "error");
        console.warn("No data in response:", response);
        return;
      }
      const data = response;
      console.log("Extracted data:", data);
      if (!data || typeof data !== "object" || !data.id) {
        throw new Error("Invalid response data format. Expected an object with an ID.");
      }
      const normalizedData = {
        ...data,
        activityLevel: normalizeActivityLevel(data.activityLevel),
        activityLevelDisplay: normalizeActivityLevel(data.activityLevel),
      };
      console.log("setSelectedSuggestion called with:", normalizedData);
      setSelectedSuggestion(normalizedData);
      setNewSuggestion({
        ageGroupId: normalizedData.ageGroupId || "",
        activityLevel: normalizedData.activityLevel || "",
        baseCalories: normalizedData.baseCalories || "",
        trimester: normalizedData.trimester || "",
        additionalCalories: normalizedData.additionalCalories || "",
      });
      setIsEditing(true);
      return normalizedData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An unexpected error occurred.";
      showNotification(`Failed to fetch suggestion details: ${errorMessage}`, "error");
      console.error("Fetch suggestion error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSuggestion = () => {
    if (!newSuggestion.ageGroupId || newSuggestion.ageGroupId.trim() === "") {
      return "Age Group is required";
    }
    if (!newSuggestion.activityLevel || newSuggestion.activityLevel.trim() === "") {
      return "Activity Level is required";
    }
    if (!newSuggestion.baseCalories || newSuggestion.baseCalories.trim() === "") {
      return "Base Calories is required";
    }
    if (isNaN(newSuggestion.baseCalories) || parseFloat(newSuggestion.baseCalories) <= 0) {
      return "Base Calories must be a positive number";
    }
    if (!newSuggestion.trimester || newSuggestion.trimester.trim() === "") {
      return "Trimester is required";
    }
    if (!["1", "2", "3"].includes(newSuggestion.trimester)) {
      return "Trimester must be 1, 2, or 3";
    }
    if (!newSuggestion.additionalCalories || newSuggestion.additionalCalories.trim() === "") {
      return "Additional Calories is required";
    }
    if (isNaN(newSuggestion.additionalCalories) || parseFloat(newSuggestion.additionalCalories) < 0) {
      return "Additional Calories must be a non-negative number";
    }
    return null;
  };

  const createSuggestionHandler = async () => {
    const validationError = validateSuggestion();
    if (validationError) {
      showNotification(validationError, "error");
      return;
    }
    const activityLevelValue = newSuggestion.activityLevel.split("-")[0];
    setLoading(true);
    try {
      await createEnergySuggestion(
        {
          ageGroupId: newSuggestion.ageGroupId,
          activityLevel: parseInt(activityLevelValue),
          baseCalories: parseFloat(newSuggestion.baseCalories),
          trimester: parseInt(newSuggestion.trimester),
          additionalCalories: parseFloat(newSuggestion.additionalCalories),
        },
        token
      );
      setNewSuggestion({
        ageGroupId: "",
        activityLevel: "",
        baseCalories: "",
        trimester: "",
        additionalCalories: "",
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Energy suggestion created successfully", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showNotification(`Failed to create suggestion: ${errorMessage}`, "error");
      console.error("Create suggestion error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionHandler = async () => {
    console.log("selectedSuggestion before update:", selectedSuggestion);
    if (!newSuggestion.ageGroupId || newSuggestion.ageGroupId.trim() === "") {
      showNotification("Age Group is required", "error");
      return;
    }
    if (
      !newSuggestion.activityLevel ||
      newSuggestion.activityLevel.trim() === ""
    ) {
      showNotification("Activity Level is required", "error");
      return;
    }
    if (
      !newSuggestion.baseCalories ||
      isNaN(newSuggestion.baseCalories) ||
      newSuggestion.baseCalories <= 0
    ) {
      showNotification("Valid Base Calories is required", "error");
      return;
    }
    if (!selectedSuggestion || !selectedSuggestion.id) {
      showNotification("No energy suggestion selected for update", "error");
      console.error("selectedSuggestion is invalid:", selectedSuggestion);
      return;
    }
    const activityLevelValue = newSuggestion.activityLevel.split("-")[0];
    setLoading(true);
    try {
      await updateEnergySuggestion(
        {
          id: selectedSuggestion.id,
          ageGroupId: newSuggestion.ageGroupId,
          activityLevel: parseInt(activityLevelValue),
          baseCalories: parseFloat(newSuggestion.baseCalories),
          trimester: parseInt(newSuggestion.trimester),
          additionalCalories: parseFloat(newSuggestion.additionalCalories),
        },
        token
      );
      setNewSuggestion({
        ageGroupId: "",
        activityLevel: "",
        baseCalories: "",
        trimester: "",
        additionalCalories: "",
      });
      setSelectedSuggestion(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Energy suggestion updated successfully", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showNotification(`Failed to update suggestion: ${errorMessage}`, "error");
      console.error("Update suggestion error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSuggestionHandler = async (id) => {
    if (!id) {
      showNotification("Invalid suggestion ID", "error");
      console.error("deleteSuggestionHandler called with invalid ID:", id);
      return;
    }
    if (!window.confirm("Are you sure you want to delete this energy suggestion?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteEnergySuggestion(id, token);
      await fetchData();
      showNotification("Energy suggestion deleted successfully", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showNotification(`Failed to delete suggestion: ${errorMessage}`, "error");
      console.error("Delete suggestion error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    if (window.confirm("Are you sure you want to cancel editing?")) {
      setNewSuggestion({
        ageGroupId: "",
        activityLevel: "",
        baseCalories: "",
        trimester: "",
        additionalCalories: "",
      });
      setSelectedSuggestion(null);
      setIsEditing(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsNutrientDropdownOpen(false);
    setIsFoodDropdownOpen(false);
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
      console.error("Error logging out:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
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
    if (user?.roleId === 4) {
      fetchData();
      fetchAgeGroups();
    }
  }, [user]);

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      (suggestion.ageGroupId || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (suggestion.activityLevelDisplay || suggestion.activityLevel || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getAgeGroupRange(suggestion.ageGroupId)
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
    <div className="energy-suggestion">
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
                animate={
                  isSidebarOpen && isFoodDropdownOpen ? "open" : "closed"
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
                    viewBox="0 0 24 22"
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
                className="sidebar-nav-item active"
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
                className="sidebar-nav-item"
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
            <h1>Manage Energy Suggestions</h1>
            <p>
              Create and edit energy suggestions for different age groups and
              activity levels
            </p>
          </div>
        </div>
        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>
                {isEditing
                  ? "Edit Energy Suggestion"
                  : "Add New Energy Suggestion"}
              </h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="age-group-id">Age Group</label>
                <select
                  id="age-group-id"
                  value={newSuggestion.ageGroupId}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      ageGroupId: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">Select Age Group</option>
                  {ageGroups.map((ageGroup) => (
                    <option key={ageGroup.id} value={ageGroup.id}>
                      {ageGroup.fromAge} - {ageGroup.toAge} years
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="activity-level">Activity Level</label>
                <select
                  id="activity-level"
                  value={newSuggestion.activityLevel}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      activityLevel: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">Select Activity Level</option>
                  <option value="1-light">1 - Light</option>
                  <option value="2-moderate">2 - Moderate</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="base-calories">Base Calories (kcal)</label>
                <input
                  id="base-calories"
                  type="number"
                  value={newSuggestion.baseCalories}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      baseCalories: e.target.value,
                    }))
                  }
                  placeholder="Enter base calories"
                  className="input-field"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="trimester">Trimester</label>
                <select
                  id="trimester"
                  value={newSuggestion.trimester}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      trimester: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">Select Trimester</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="additional-calories">
                  Additional Calories (kcal)
                </label>
                <select
                  id="additional-calories"
                  value={newSuggestion.additionalCalories}
                  onChange={(e) =>
                    setNewSuggestion((prev) => ({
                      ...prev,
                      additionalCalories: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">Select Additional Calories</option>
                  <option value="50">50 kcal</option>
                  <option value="250">250 kcal</option>
                  <option value="450">450 kcal</option>
                </select>
              </div>
              <div className="button-group">
                <motion.button
                  onClick={
                    isEditing
                      ? updateSuggestionHandler
                      : createSuggestionHandler
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
          <div className="nutrient-list-section">
            <div className="section-header">
              <h2>Energy Suggestion List</h2>
              <div className="nutrient-count">
                {filteredSuggestions.length}{" "}
                {filteredSuggestions.length === 1
                  ? "suggestion"
                  : "suggestions"}{" "}
                found
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="search-suggestions">Search Suggestions</label>
              <input
                id="search-suggestions"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by age group or activity level"
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
                <p>Create your first energy suggestion to get started</p>
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
                        <h3>Energy Suggestion for Age Group {getAgeGroupRange(suggestion.ageGroupId)}</h3>
                      </div>
                      <p>
                        <strong>Age Group:</strong> {getAgeGroupRange(suggestion.ageGroupId)}
                      </p>
                      <p>
                        <strong>Activity Level:</strong>{" "}
                        {suggestion.activityLevelDisplay ||
                          suggestion.activityLevel}
                      </p>
                      <p>
                        <strong>Base Calories:</strong>{" "}
                        {suggestion.baseCalories} kcal
                      </p>
                      <div className="card-actions">
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
                          className="delete-button nutrient-specialist-button danger"
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
                      onClick={handlePreviousPage}
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
                      onClick={handleNextPage}
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
            <EnergySuggestionModal
              suggestion={selectedViewSuggestion}
              onClose={() => setSelectedViewSuggestion(null)}
              ageGroups={ageGroups}
            />
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default EnergySuggestion;