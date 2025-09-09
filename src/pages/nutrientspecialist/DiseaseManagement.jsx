import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllDiseases,
  getDiseaseById,
  createDisease,
  updateDisease,
  deleteDisease,
} from "../../apis/nutriet-api";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/DiseaseManagement.css";

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

const DiseaseManagement = () => {
  const [diseases, setDiseases] = useState([]);
  const [newDisease, setNewDisease] = useState({
    name: "",
    description: "",
    symptoms: "",
    treatmentOptions: "",
    pregnancyRelated: false,
    riskLevel: "",
    typeOfDesease: "",
  });
  const [selectedDisease, setSelectedDisease] = useState(null);
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
      const apiResponse = await getAllDiseases(token);
      console.log("Fetched diseases response:", apiResponse);
      if (apiResponse.error !== 0) {
        throw new Error(apiResponse.message || "Failed to fetch diseases");
      }
      const diseasesData = apiResponse.data || [];
      setDiseases(Array.isArray(diseasesData) ? diseasesData : []);
    } catch (err) {
      console.error("Fetch error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  };

 const fetchDiseaseById = async (id) => {
  if (!id || typeof id !== "string" || id.trim() === "") {
    showNotification("Invalid Disease ID provided", "error");
    return;
  }
  if (!token) {
    showNotification("Authentication token missing", "error");
    navigate("/signin", { replace: true });
    return;
  }
  setLoading(true);
  try {
    console.log("Fetching disease with ID:", id, "Token:", token.substring(0, 10) + "...");
    const apiResponse = await getDiseaseById(id, token);
    console.log("Raw API response:", apiResponse);

    let data;
    // Check if response is wrapped in { error, message, data } or is the raw disease object
    if (apiResponse && typeof apiResponse === "object" && "error" in apiResponse) {
      // Wrapped response
      if (apiResponse.error !== 0) {
        throw new Error(apiResponse.message || "Disease not found");
      }
      data = apiResponse.data;
    } else {
      // Raw disease object
      data = apiResponse;
    }

    // Validate the disease data
    if (!data || typeof data !== "object" || !data.id) {
      throw new Error("Invalid or empty response data from API");
    }

    console.log("Fetched disease data:", data);
    setSelectedDisease(data);
    setNewDisease({
      name: data.name || "",
      description: data.description || "",
      symptoms: data.symptoms || "",
      treatmentOptions: data.treatmentOptions || "",
      pregnancyRelated: !!data.pregnancyRelated,
      riskLevel: data.riskLevel || "",
      typeOfDesease: data.typeOfDesease || "",
    });
    setIsEditing(true);
  } catch (err) {
    console.error("Fetch disease by ID error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      id,
      token: token ? "Token present" : "Token missing",
      axiosError: err.isAxiosError ? {
        code: err.code,
        request: err.request,
        response: err.response,
      } : null,
    });

    let errorMessage = "Failed to fetch disease";
    if (err.message.includes("not found")) {
      errorMessage = "Disease not found.";
    } else if (err.response?.status === 400) {
      errorMessage = err.response?.data?.message || "Disease not found";
    } else if (err.response?.status === 401) {
      errorMessage = "Session expired. Please sign in again.";
      localStorage.removeItem("token");
      navigate("/signin", { replace: true });
    } else if (err.response?.status === 404) {
      errorMessage = "Disease not found.";
    } else if (err.code === "ERR_NETWORK") {
      errorMessage = "Network error: Unable to connect to the server.";
    } else {
      errorMessage = err.response?.data?.message || err.message || "Unknown error";
    }

    showNotification(errorMessage, "error");
  } finally {
    setLoading(false);
  }
};
  const createDiseaseHandler = async () => {
    if (!newDisease.name || newDisease.name.trim() === "") {
      showNotification("Disease name is required", "error");
      return;
    }
    setLoading(true);
    try {
      console.log("Creating disease with data:", newDisease);
      const apiResponse = await createDisease(
        {
          name: newDisease.name,
          description: newDisease.description || "",
          symptoms: newDisease.symptoms || "",
          treatmentOptions: newDisease.treatmentOptions || "",
          pregnancyRelated: !!newDisease.pregnancyRelated,
          riskLevel: newDisease.riskLevel || "",
          typeOfDesease: newDisease.typeOfDesease || "",
        },
        token
      );
      console.log("Create disease response:", apiResponse);
      if (apiResponse.error !== 0) {
        throw new Error(apiResponse.message || "Failed to create disease");
      }
      setNewDisease({
        name: "",
        description: "",
        symptoms: "",
        treatmentOptions: "",
        pregnancyRelated: false,
        riskLevel: "",
        typeOfDesease: "",
      });
      setIsEditing(false);
      await fetchData();
      showNotification("Disease created successfully", "success");
    } catch (err) {
      console.error("Create disease error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(
        `Failed to create disease: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDiseaseHandler = async () => {
    if (!newDisease.name || newDisease.name.trim() === "") {
      showNotification("Disease name is required", "error");
      return;
    }
    if (!selectedDisease || !selectedDisease.id) {
      showNotification("No disease selected for update", "error");
      return;
    }
    if (!token) {
      showNotification("Authentication token missing", "error");
      navigate("/signin", { replace: true });
      return;
    }
    if (newDisease.riskLevel && !["Low", "Medium", "High"].includes(newDisease.riskLevel)) {
      showNotification("Risk level must be Low, Medium, or High", "error");
      return;
    }
    setLoading(true);
    try {
      console.log("Updating disease with ID:", selectedDisease.id, "Data:", newDisease);
      const apiResponse = await updateDisease(
        {
          diseaseId: selectedDisease.id,
          name: newDisease.name,
          description: newDisease.description || "",
          symptoms: newDisease.symptoms || "",
          treatmentOptions: newDisease.treatmentOptions || "",
          pregnancyRelated: !!newDisease.pregnancyRelated,
          riskLevel: newDisease.riskLevel || "",
          typeOfDesease: newDisease.typeOfDesease || "",
        },
        token
      );
      console.log("Update disease response:", apiResponse);
      if (apiResponse.error !== 0) {
        throw new Error(apiResponse.message || "Failed to update disease");
      }
      setNewDisease({
        name: "",
        description: "",
        symptoms: "",
        treatmentOptions: "",
        pregnancyRelated: false,
        riskLevel: "",
        typeOfDesease: "",
      });
      setSelectedDisease(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Disease updated successfully", "success");
    } catch (err) {
      console.error("Update disease error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      let errorMessage = "Failed to update disease";
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid data provided";
      } else if (err.response?.status === 401) {
        errorMessage = "Session expired. Please sign in again.";
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      } else if (err.response?.status === 404) {
        errorMessage = "Disease not found.";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage = "Network error: Unable to connect to the server.";
      } else {
        errorMessage = err.response?.data?.message || err.message || "Unknown error";
      }
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDiseaseHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this disease?")) return;
    setLoading(true);
    try {
      console.log("Deleting disease with ID:", id);
      const apiResponse = await deleteDisease(id, token);
      console.log("Delete disease response:", apiResponse);
      if (apiResponse.error !== 0) {
        throw new Error(apiResponse.message || "Failed to delete disease");
      }
      setSelectedDisease(null);
      setIsEditing(false);
      setNewDisease({
        name: "",
        description: "",
        symptoms: "",
        treatmentOptions: "",
        pregnancyRelated: false,
        riskLevel: "",
        typeOfDesease: "",
      });
      await fetchData();
      showNotification("Disease deleted successfully", "success");
    } catch (err) {
      console.error("Delete disease error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showNotification(
        `Failed to delete disease: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setNewDisease({
      name: "",
      description: "",
      symptoms: "",
      treatmentOptions: "",
      pregnancyRelated: false,
      riskLevel: "",
      typeOfDesease: "",
    });
    setSelectedDisease(null);
    setIsEditing(false);
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

  const filteredDiseases = diseases.filter(
    (disease) =>
      (disease.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (disease.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
    <div className="disease-management">
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
                      className={`dropdown-icon ${
                        isFoodDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--orange-white)"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
                      className={`dropdown-icon ${
                        isNutrientDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--orange-white)"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Warning Management"
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
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
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
              >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Messenger Management"
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
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
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
              >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Meal Management"
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
                      fill="var(--blue-accent)"
                      stroke="var(--blue-white)"
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
              >
                <Link
                  to="/nutrient-specialist/nutrient-policy"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Policy"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 22"
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
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
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
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
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
            <motion.div
              variants={navItemVariants}
              className="sidebar-nav-item"
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
            <h1>Manage Diseases</h1>
            <p>Create, edit, and manage diseases for nutritional guidance</p>
          </div>
        </div>

        <div className="management-container">
          <div className="form-section">
            <div className="section-header">
              <h2>{isEditing ? "Edit Disease" : "Add New Disease"}</h2>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="disease-name">Disease Name *</label>
                <input
                  id="disease-name"
                  type="text"
                  value={newDisease.name}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter disease name"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="disease-description">Description</label>
                <textarea
                  id="disease-description"
                  value={newDisease.description}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter disease description"
                  className="textarea-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="disease-symptoms">Symptoms</label>
                <textarea
                  id="disease-symptoms"
                  value={newDisease.symptoms}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      symptoms: e.target.value,
                    }))
                  }
                  placeholder="Enter disease symptoms"
                  className="textarea-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="disease-treatment">Treatment Options</label>
                <textarea
                  id="disease-treatment"
                  value={newDisease.treatmentOptions}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      treatmentOptions: e.target.value,
                    }))
                  }
                  placeholder="Enter treatment options"
                  className="textarea-field"
                />
              </div>
              <div className="form-group pregnancy-related-group">
                <label htmlFor="disease-pregnancy">Pregnancy Related</label>
                <input
                  id="disease-pregnancy"
                  type="checkbox"
                  className="pregnancy-checkbox"
                  checked={newDisease.pregnancyRelated}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      pregnancyRelated: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="disease-pregnancy" className="pregnancy-checkbox-label">
                  <svg
                    className="checkbox-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="var(--nutrient-specialist-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{newDisease.pregnancyRelated ? "Yes" : "No"}</span>
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="disease-risk-level">Risk Level</label>
                <select
                  id="disease-risk-level"
                  value={newDisease.riskLevel}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      riskLevel: e.target.value,
                    }))
                  }
                  className="input-field"
                >
                  <option value="">Select Risk Level</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="disease-type">Type of Disease</label>
                <input
                  id="disease-type"
                  type="text"
                  value={newDisease.typeOfDesease}
                  onChange={(e) =>
                    setNewDisease((prev) => ({
                      ...prev,
                      typeOfDesease: e.target.value,
                    }))
                  }
                  placeholder="Enter type of disease"
                  className="input-field"
                />
              </div>
              <div className="button-group">
                <motion.button
                  onClick={
                    isEditing ? updateDiseaseHandler : createDiseaseHandler
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
                    ? "Update Disease"
                    : "Create Disease"}
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
              <h2>Disease List</h2>
              <div className="nutrient-count">
                {diseases.length}{" "}
                {diseases.length === 1 ? "disease" : "diseases"} found
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <LoaderIcon />
                <p>Loading diseases...</p>
              </div>
            ) : !Array.isArray(diseases) || diseases.length === 0 ? (
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
                <h3>No diseases found</h3>
                <p>Create your first disease to get started</p>
              </div>
            ) : (
              <div className="nutrient-grid">
                {filteredDiseases.map((disease) => (
                  <motion.div
                    key={disease.id}
                    className="nutrient-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="card-header">
                      <h3>{disease.name || `Disease #${disease.id}`}</h3>
                    </div>
                    <div className="disease-description">
                      <h4>Description:</h4>
                      <p>{disease.description || "No description available"}</p>
                    </div>
                    <div className="disease-description">
                      <h4>Symptoms:</h4>
                      <p>{disease.symptoms || "No symptoms available"}</p>
                    </div>
                    <div className="disease-description">
                      <h4>Treatment Options:</h4>
                      <p>
                        {disease.treatmentOptions ||
                          "No treatment options available"}
                      </p>
                    </div>
                    <div className="disease-description">
                      <h4>Pregnancy Related:</h4>
                      <p>{disease.pregnancyRelated ? "Yes" : "No"}</p>
                    </div>
                    <div className="disease-description">
                      <h4>Risk Level:</h4>
                      <p>{disease.riskLevel || "Not specified"}</p>
                    </div>
                    <div className="disease-description">
                      <h4>Type of Disease:</h4>
                      <p>{disease.typeOfDesease || "Not specified"}</p>
                    </div>
                    <div className="card-actions">
                      <motion.button
                        onClick={() => fetchDiseaseById(disease.id)}
                        className="edit-button nutrient-specialist-button primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                      >
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => deleteDiseaseHandler(disease.id)}
                        className="delete-button nutrient-specialist-button secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
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

export default DiseaseManagement;