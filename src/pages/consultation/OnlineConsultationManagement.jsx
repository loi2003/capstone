import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import { viewConsultantByUserId, getAllUsers } from "../../apis/consultant-api";
import {
  getAllOnlineConsultationsByConsultantId,
  updateOnlineConsultation,
  softDeleteOnlineConsultation,
  createOnlineConsultation,
  getOnlineConsultationById,
} from "../../apis/online-consultation-api";
import "../../styles/OnlineConsultationManagement.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const initialEditState = {
  Id: "",
  Trimester: "",
  Date: "",
  GestationalWeek: "",
  Summary: "",
  ConsultantNote: "",
  UserNote: "",
  VitalSigns: "",
  Recommendations: "",
  Attachments: [],
};

const OnlineConsultationManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [consultant, setConsultant] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialEditState);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(true);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const sortedConsultations = consultations
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalItems = sortedConsultations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConsultations = sortedConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [createForm, setCreateForm] = useState({
    Trimester: "",
    Date: "",
    GestationalWeek: "",
    Summary: "",
    ConsultantNote: "",
    UserNote: "",
    VitalSigns: "",
    Recommendations: "",
    Attachments: [],
    selectedAttachments: [],
  });

  useEffect(() => {
    const fetchUserAndConsultant = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 6) {
          setUser(userData);
          // Fetch consultant info by userId
          const consultantRes = await viewConsultantByUserId(userData.id);
          const consultantData = consultantRes?.data || consultantRes;
          setConsultant(consultantData);
          setLoading(true);
          const consultationsRes =
            await getAllOnlineConsultationsByConsultantId(consultantData.id);
          setConsultations(consultationsRes?.data || consultationsRes || []);
          setLoading(false);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    };
    fetchUserAndConsultant();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      setUserListLoading(true);
      try {
        const token = localStorage.getItem("token");
        const users = await getAllUsers(token);
        // Ensure users is always an array
        setUserList(Array.isArray(users) ? users : users?.data || []);
      } catch (err) {
        setUserList([]);
      }
      setUserListLoading(false);
    };
    fetchUsers();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!user?.userId) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/signin", { replace: true });
      return;
    }
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await logout(user.userId);
      } catch (error) {
        console.error("Error logging out:", error.message);
      } finally {
        localStorage.removeItem("token");
        setUser(null);
        setIsSidebarOpen(true);
        navigate("/signin", { replace: true });
      }
    }
  };

  // Animation variants (copied from ConsultantHomePage)
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

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const sidebarVariants = {
    open: {
      width: "250px",
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

  // --- Edit Modal Logic ---
  const handleEditClick = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const res = await getOnlineConsultationById(item.id, token);
      const data = res?.data || res;
      // Step 1: Load all data including existing attachments
      setEditForm({
        Id: data.id,
        Trimester: data.trimester ?? "",
        Date: data.date ? data.date.slice(0, 16) : "",
        GestationalWeek: data.gestationalWeek ?? "",
        Summary: data.summary ?? "",
        ConsultantNote: data.consultantNote ?? "",
        UserNote: data.userNote ?? "",
        VitalSigns: data.vitalSigns ?? "",
        Recommendations: data.recommendations ?? "",
        Attachments: Array.isArray(data.attachments) ? data.attachments : [],
        selectedAttachments: [],
        user: data.user || null,
      });
      setShowEditModal(true);
    } catch (err) {
      alert("Failed to load consultation details.", err.message);
    }
  };

  const handleEditChange = (e) => {
    const { type, files } = e.target;
    if (type === "file") {
      setEditForm((prev) => ({
        ...prev,
        selectedAttachments: Array.from(files),
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleAddAttachments = () => {
    setEditForm((prev) => ({
      ...prev,
      Attachments: [
        ...(prev.Attachments || []),
        ...(prev.selectedAttachments || []),
      ],
      selectedAttachments: [],
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    // Only send File objects (binary) in Attachments
    const filesToSend = editForm.Attachments.filter(
      (file) => file instanceof File
    );

    const payload = {
      Id: editForm.Id,
      Trimester: Number(editForm.Trimester),
      Date: editForm.Date,
      GestationalWeek: Number(editForm.GestationalWeek),
      Summary: editForm.Summary.trim(),
      ConsultantNote: editForm.ConsultantNote,
      UserNote: editForm.UserNote,
      VitalSigns: editForm.VitalSigns,
      Recommendations: editForm.Recommendations,
      Attachments: filesToSend, // Only File objects for upload
    };

    try {
      const token = localStorage.getItem("token");
      await updateOnlineConsultation(payload, token);
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update consultation.", err.message);
    }
    setEditLoading(false);
  };

  const handleRemoveClick = async (id) => {
    if (window.confirm("Are you sure you want to remove this consultation?")) {
      try {
        await softDeleteOnlineConsultation(id);
        setConsultations((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        alert("Failed to remove consultation.", err.message);
      }
    }
  };

  const handleCreateChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setCreateForm((prev) => ({
        ...prev,
        selectedAttachments: Array.from(files),
      }));
    } else {
      setCreateForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCreateAttachments = () => {
    setCreateForm((prev) => ({
      ...prev,
      Attachments: [
        ...(prev.Attachments || []),
        ...(prev.selectedAttachments || []),
      ],
      selectedAttachments: [],
    }));
  };

  const handleRemoveCreateAttachment = (idx) => {
    setCreateForm((prev) => ({
      ...prev,
      Attachments: prev.Attachments.filter((_, i) => i !== idx),
    }));
  };

  // const handleOpenCreateFlow = () => {
  //   setShowUserListModal(true);
  //   setSelectedUser(null);
  // };

  // const handleSelectUser = (user) => {
  //   setSelectedUser(user);
  //   setShowUserListModal(false);
  //   setShowCreateModal(true);
  // };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!createForm.Summary || !createForm.Summary.trim()) {
      setErrorMessage("Summary is required.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    if (!selectedUser) {
      setErrorMessage("Please select a user.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    try {
      await createOnlineConsultation(
        {
          ...createForm,
          Attachments: createForm.Attachments,
          ConsultantId: consultant?.id,
          UserId: selectedUser?.id,
        },
        token
      );
      // Optionally, refresh the list
      const consultationsRes = await getAllOnlineConsultationsByConsultantId(
        consultant.id
      );
      setConsultations(consultationsRes?.data || consultationsRes || []);
      setShowCreateModal(false);
      setCreateForm({
        Trimester: "",
        Date: "",
        GestationalWeek: "",
        Summary: "",
        ConsultantNote: "",
        UserNote: "",
        VitalSigns: "",
        Recommendations: "",
        Attachments: [],
        selectedAttachments: [],
      });
      setSuccessMessage("Create Consultation Successful!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Create Consultation Fail!");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="consultant-homepage">
      {(successMessage || errorMessage) && (
        <div
          className={`notification-popup ${
            errorMessage ? "notification-error" : "notification-success"
          }`}
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: errorMessage ? "#ffe6e6" : "#e6ffed",
            color: errorMessage ? "#d32f2f" : "#2d5a3d",
            border: errorMessage ? "1px solid #d32f2f" : "1px solid #34C759",
            borderRadius: "8px",
            padding: "12px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: 500,
          }}
        >
          <span className="notification-icon">
            {errorMessage ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#EF4444"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="#34C759"
                />
              </svg>
            )}
          </span>
          <span className="notification-message">
            {errorMessage || successMessage}
          </span>
        </div>
      )}
      <motion.aside
        className={`consultant-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/consultant"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              {/* <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Consultant icon for logo"
              >
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--consultant-accent)"
                  stroke="var(--consultant-background)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--consultant-accent)"
                  stroke="var(--consultant-background)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--consultant-accent)"
                  stroke="var(--consultant-background)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Consultant Panel</span>
            )}
          </Link>
          {isSidebarOpen && <h2 className="sidebar-title"></h2>}
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Toggle sidebar icon"
            >
              <path
                stroke="var(--consultant-background)"
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
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant/dashboard"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Consultant icon for dashboard"
              >
                <path
                  d="M4 6H20C20.5523 6 21 5.55228 21 5C21 4.44772 20.5523 4 20 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6Z"
                  fill="var(--consultant-primary)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 12H20C20.5523 12 21 11.5523 21 11C21 10.4477 20.5523 10 20 10H4C3.44772 10 3 10.4477 3 11C3 11.5523 3.44772 12 4 12Z"
                  fill="var(--consultant-primary)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 18H16C16.5523 18 17 17.5523 17 17C17 16.4477 16.5523 16 16 16H4C3.44772 16 3 16.4477 3 17C3 17.5523 3.44772 18 4 18Z"
                  fill="var(--consultant-primary)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 4.5L8 5.5L10 3.5"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10.5L8 11.5L10 9.5"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>📊</span>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant/schedule"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Calendar icon for schedule"
              >
                <path
                  d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                  fill="var(--consultant-secondary)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>📅</span>
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant/clients"
              onClick={() => setIsSidebarOpen(true)}
              title="Clients"
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Users icon for clients"
              >
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm6 10v-2a4 4 0 00-3-3.87m4-5.13a4 4 0 100-8 4 4 0 000 8z"
                  fill="var(--consultant-accent)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>👥</span>
              {isSidebarOpen && <span>Clients</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/consultant/support"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Support icon"
              >
                <path
                  d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728M12 9v3m0 3h.01"
                  fill="var(--consultant-light-accent)"
                  stroke="var(--consultant-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>❓</span>
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Online Consultation"
              onClick={() =>
                navigate("/consultation/online-consultation-management")
              }
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Plus icon for add consultation"
              >
                <path
                  d="M12 5v14m-7-7h14"
                  fill="var(--consultant-background)"
                  stroke="var(--consultant-light-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>💻</span>
              {isSidebarOpen && <span>Online Consultation</span>}
            </button>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <button
              className="sidebar-action-button"
              title="Add Consultation"
              onClick={() =>
                navigate("/consultation/offline-consultation-management")
              }
            >
              {/* <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Plus icon for add consultation"
              >
                <path
                  d="M12 5v14m-7-7h14"
                  fill="var(--consultant-background)"
                  stroke="var(--consultant-light-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg> */}
              <span>🏥</span>
              {isSidebarOpen && <span>Offline Consultation</span>}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item consultant-profile-section"
              >
                <div
                  className="consultant-profile-info"
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
                      fill="var(--consultant-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="consultant-profile-email">
                      {user.email}
                    </span>
                  )}
                </div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--consultant-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Đăng Xuất</span>}
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
                  aria-label="Sign in icon"
                >
                  <path
                    stroke="var(--consultant-background)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Đăng Nhập</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <main className="consultant-content">
        <section className="consultant-banner">
          <motion.div
            className="consultant-banner-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="consultant-banner-title">
              Online Consultation Management
            </h1>
            <p className="consultant-banner-subtitle">
              Manage your online consultations here.
            </p>
          </motion.div>
        </section>
        <section>
          <h2 style={{ marginTop: 24, marginBottom: 12 }}>
            Online Consultation List
          </h2>
          <div className="create-online-consultation-section">
            <button
              className="create-online-consultation-btn"
              onClick={() => setShowUserListModal(true)}
            >
              <span>➕</span>
              Add Online Consultation
            </button>
          </div>
          {showCreateModal && selectedUser && (
            <div className="modal-overlay">
              <div className="consultation-container">
                <div className="form-header">
                  <button
                    className="btn btn-cancel"
                    aria-label="Close"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ×
                  </button>
                  <h1 className="header-title">Add Online Consultation</h1>
                  <p className="header-subtitle">
                    Enter new online consultation information
                  </p>
                </div>
                <div
                  style={{
                    margin: "16px 30px 0 30px",
                    color: "#2d5a3d",
                    fontWeight: 600,
                  }}
                >
                  <span>Selected Patient: </span>
                  <span>{selectedUser.userName}</span>
                  {selectedUser.email && (
                    <span
                      style={{
                        color: "#7dd87f",
                        fontWeight: 400,
                        marginLeft: 8,
                      }}
                    >
                      ({selectedUser.email})
                    </span>
                  )}
                </div>
                <form onSubmit={handleCreateSubmit}>
                  <div className="form-content">
                    <div className="form-grid">
                      {/* Patient Information Section */}
                      <div className="form-section">
                        <div className="section-header">
                          <div className="section-icon">
                            <i className="fas fa-user-md"></i>
                          </div>
                          <h2 className="section-title">Patient Information</h2>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Trimester <span className="required">*</span>
                          </label>
                          <div className="input-icon">
                            <select
                              className="form-input"
                              name="Trimester"
                              value={createForm.Trimester}
                              required
                              onChange={handleCreateChange}
                            >
                              <option value="">Select Trimester</option>
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                            </select>
                            <i className="fas fa-hashtag"></i>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Date <span className="required">*</span>
                          </label>
                          <div className="datetime-wrapper">
                            <input
                              type="date"
                              className="form-input"
                              value={
                                createForm.Date
                                  ? createForm.Date.slice(0, 10)
                                  : ""
                              }
                              onChange={(e) =>
                                setCreateForm((prev) => ({
                                  ...prev,
                                  Date:
                                    e.target.value +
                                    "T" +
                                    (createForm.Date
                                      ? createForm.Date.slice(11, 16)
                                      : "00:00"),
                                }))
                              }
                              required
                            />
                            <span className="datetime-separator">at</span>
                            <input
                              type="time"
                              className="form-input"
                              value={
                                createForm.Date
                                  ? createForm.Date.slice(11, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                setCreateForm((prev) => ({
                                  ...prev,
                                  Date:
                                    (createForm.Date
                                      ? createForm.Date.slice(0, 10)
                                      : new Date().toISOString().slice(0, 10)) +
                                    "T" +
                                    e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gestational Week</label>
                          <div className="input-icon">
                            <input
                              type="number"
                              className="form-input"
                              name="GestationalWeek"
                              value={createForm.GestationalWeek}
                              min={1}
                              max={42}
                              placeholder="Enter week"
                              onChange={handleCreateChange}
                            />
                            <i className="fas fa-calendar-week"></i>
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Summary</label>
                          <textarea
                            className="form-textarea"
                            name="Summary"
                            placeholder="Enter detailed consultation summary..."
                            value={createForm.Summary}
                            onChange={handleCreateChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Attachments</label>
                          {/* List current attachments */}
                          {createForm.Attachments &&
                            createForm.Attachments.length > 0 && (
                              <ul
                                style={{
                                  margin: "8px 0 0 0",
                                  padding: 0,
                                  listStyle: "none",
                                  fontSize: "0.95em",
                                }}
                              >
                                {createForm.Attachments.map((file, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    {file.fileName
                                      ? file.fileName
                                      : file.name
                                      ? file.name
                                      : typeof file === "string"
                                      ? file
                                      : "Attachment"}
                                    <button
                                      type="button"
                                      style={{
                                        marginLeft: 8,
                                        background: "none",
                                        border: "none",
                                        color: "#d32f2f",
                                        cursor: "pointer",
                                        fontSize: "1em",
                                      }}
                                      title="Remove"
                                      onClick={() =>
                                        handleRemoveCreateAttachment(idx)
                                      }
                                    >
                                      &times;
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          {/* Select new attachments to add */}
                          <input
                            type="file"
                            name="Attachments"
                            multiple
                            onChange={handleCreateChange}
                            className="form-input"
                            style={{ marginTop: 8 }}
                          />
                          {/* Show selected files before adding */}
                          {createForm.selectedAttachments &&
                            createForm.selectedAttachments.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <strong>Selected to add:</strong>
                                <ul
                                  style={{
                                    margin: "4px 0 0 0",
                                    padding: 0,
                                    listStyle: "none",
                                    fontSize: "0.95em",
                                  }}
                                >
                                  {createForm.selectedAttachments.map(
                                    (file, idx) => (
                                      <li key={idx}>{file.name}</li>
                                    )
                                  )}
                                </ul>
                                <button
                                  type="button"
                                  className="btn btn-save"
                                  style={{
                                    marginTop: 6,
                                    padding: "6px 18px",
                                    fontSize: "0.98em",
                                  }}
                                  onClick={handleAddCreateAttachments}
                                >
                                  Add Attachment
                                  {createForm.selectedAttachments.length > 1
                                    ? "s"
                                    : ""}
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                      {/* Medical Information Section */}
                      <div className="form-section">
                        <div className="section-header">
                          <div className="section-icon">
                            <i className="fas fa-heartbeat"></i>
                          </div>
                          <h2 className="section-title">Medical Records</h2>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Vital Signs</label>
                          <textarea
                            className="form-textarea"
                            name="VitalSigns"
                            placeholder="Record vital signs and measurements..."
                            value={createForm.VitalSigns}
                            onChange={handleCreateChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Consultant Note</label>
                          <textarea
                            className="form-textarea"
                            name="ConsultantNote"
                            placeholder="Professional medical observations..."
                            value={createForm.ConsultantNote}
                            onChange={handleCreateChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">User Note</label>
                          <textarea
                            className="form-textarea"
                            name="UserNote"
                            placeholder="Patient's personal notes or concerns..."
                            value={createForm.UserNote}
                            onChange={handleCreateChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Recommendations</label>
                          <textarea
                            className="form-textarea"
                            name="Recommendations"
                            placeholder="Treatment recommendations and follow-up instructions..."
                            value={createForm.Recommendations}
                            onChange={handleCreateChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="actions-section">
                      <button
                        className="btn btn-cancel"
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowUserListModal(true);
                        }}
                      >
                        <i className="fas fa-times"></i> Back to user list
                      </button>
                      <button className="btn btn-save" type="submit">
                        <i className="fas fa-save"></i> Create
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          {loading ? (
            <div>Loading consultations...</div>
          ) : totalItems === 0 ? (
            <div>No consultations found.</div>
          ) : (
            <>
              <table className="online-consultation-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Patient</th>
                    <th>Summary</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedConsultations.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        {item.user?.userName} <br />
                        <span className="online-consultation-table-email">
                          {item.user?.email}
                        </span>
                      </td>
                      <td>{item.summary}</td>
                      <td>
                        {item.date
                          ? new Date(item.date).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </td>
                      <td>
                        {item.consultant?.isCurrentlyConsulting
                          ? "Consulting"
                          : "Completed"}
                      </td>
                      <td>{item.consultantNote}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="action-btn view"
                            title="View Detail"
                            onClick={() => handleEditClick(item)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="action-btn remove"
                            title="Remove"
                            onClick={() => handleRemoveClick(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <button
                  className="onlineConsultation-pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: "8px" }}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="onlineConsultation-pagination-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: "8px" }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        {showUserListModal && (
          <div className="modal-overlay">
            <div className="user-online-consultation-container">
              <div className="form-header">
                <button
                  className="btn btn-cancel"
                  aria-label="Close"
                  onClick={() => setShowUserListModal(false)}
                >
                  ×
                </button>
                <h1 className="header-title">Select User</h1>
              </div>
              <div className="user-online-consultation-form-content">
                <div className="table-user-online-consultation-container">
                  <table className="table-user-online-consultation">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userListLoading ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center" }}>
                            <div className="loading-spinner"></div>
                            Loading users...
                          </td>
                        </tr>
                      ) : userList.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center" }}>
                            <div
                              className="no-user-online-consultation-results-icon"
                              role="img"
                              aria-label="No results"
                            >
                              🔍
                            </div>
                            <h3>No users found</h3>
                            <p>
                              Try adjusting your search criteria or add a new
                              user.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        userList.map((u, idx) => (
                          <tr key={u.id || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.userName}
                                  className="user-avatar"
                                  style={{
                                    width: 45,
                                    height: 45,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div className="user-avatar">
                                  {u.userName
                                    ? u.userName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                    : "U"}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="user-name">{u.userName}</div>
                            </td>
                            <td>
                              <div className="user-email">{u.email}</div>
                            </td>
                            <td>{u.phoneNo}</td>
                            <td>
                              <button
                                className="btn btn-save"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowUserListModal(false);
                                  setShowCreateModal(true);
                                }}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="consultation-container">
              <div className="form-header">
                <h1 className="header-title">Online Consultation Detail</h1>
                <p className="header-subtitle">
                  Complete patient consultation information
                </p>
              </div>
              {editForm.user && (
                <div
                  style={{
                    margin: "16px 30px 0 30px",
                    color: "#2d5a3d",
                    fontWeight: 600,
                  }}
                >
                  <span>Patient: </span>
                  <span>{editForm.user.userName}</span>
                  {editForm.user.email && (
                    <span
                      style={{
                        color: "#7dd87f",
                        fontWeight: 400,
                        marginLeft: 8,
                      }}
                    >
                      ({editForm.user.email})
                    </span>
                  )}
                </div>
              )}
              <form onSubmit={handleEditSubmit}>
                <div className="form-content">
                  <div className="form-grid">
                    {/* Patient Information Section */}
                    <div className="form-section">
                      <div className="section-header">
                        <div className="section-icon">
                          <i className="fas fa-user-md"></i>
                        </div>
                        <h2 className="section-title">Patient Information</h2>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Trimester <span className="required">*</span>
                        </label>
                        <div className="input-icon">
                          <select
                            className="form-input"
                            name="Trimester"
                            value={editForm.Trimester}
                            required
                            onChange={handleEditChange}
                          >
                            <option value="">Select Trimester</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </select>
                          <i className="fas fa-hashtag"></i>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Date <span className="required">*</span>
                        </label>
                        <div className="datetime-wrapper">
                          <input
                            type="date"
                            className="form-input"
                            value={
                              editForm.Date ? editForm.Date.slice(0, 10) : ""
                            }
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Date:
                                  e.target.value +
                                  "T" +
                                  (editForm.Date
                                    ? editForm.Date.slice(11, 16)
                                    : "00:00"),
                              }))
                            }
                            required
                          />
                          <span className="datetime-separator">at</span>
                          <input
                            type="time"
                            className="form-input"
                            value={
                              editForm.Date ? editForm.Date.slice(11, 16) : ""
                            }
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                Date:
                                  (editForm.Date
                                    ? editForm.Date.slice(0, 10)
                                    : new Date().toISOString().slice(0, 10)) +
                                  "T" +
                                  e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gestational Week</label>
                        <div className="input-icon">
                          <input
                            type="number"
                            className="form-input"
                            name="GestationalWeek"
                            value={editForm.GestationalWeek}
                            min={1}
                            max={42}
                            placeholder="Enter week"
                            onChange={handleEditChange}
                          />
                          <i className="fas fa-calendar-week"></i>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Summary</label>
                        <textarea
                          className="form-textarea"
                          name="Summary"
                          placeholder="Enter detailed consultation summary..."
                          value={editForm.Summary}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Attachments</label>
                        {/* List current attachments */}
                        {editForm.Attachments &&
                          editForm.Attachments.length > 0 && (
                            <ul
                              style={{
                                margin: "8px 0 0 0",
                                padding: 0,
                                listStyle: "none",
                                fontSize: "0.95em",
                              }}
                            >
                              {editForm.Attachments.map((file, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  {/* Show fileName if object has fileName, else fallback to .name or string */}
                                  {file.fileName || file.name || String(file)}
                                  <button
                                    type="button"
                                    style={{
                                      marginLeft: 8,
                                      background: "none",
                                      border: "none",
                                      color: "#d32f2f",
                                      cursor: "pointer",
                                      fontSize: "1em",
                                    }}
                                    title="Remove"
                                    onClick={() => {
                                      setEditForm((prev) => ({
                                        ...prev,
                                        Attachments: prev.Attachments.filter(
                                          (_, i) => i !== idx
                                        ),
                                      }));
                                    }}
                                  >
                                    &times;
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        {/* Select new attachments to add */}
                        <input
                          type="file"
                          name="Attachments"
                          multiple
                          onChange={handleEditChange}
                          className="form-input"
                          style={{ marginTop: 8 }}
                        />
                        {/* Show selected files before adding */}
                        {editForm.selectedAttachments &&
                          editForm.selectedAttachments.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <strong>Selected to add:</strong>
                              <ul
                                style={{
                                  margin: "4px 0 0 0",
                                  padding: 0,
                                  listStyle: "none",
                                  fontSize: "0.95em",
                                }}
                              >
                                {editForm.selectedAttachments.map(
                                  (file, idx) => (
                                    <li key={idx}>{file.name}</li>
                                  )
                                )}
                              </ul>
                              <button
                                type="button"
                                className="btn btn-save"
                                style={{
                                  marginTop: 6,
                                  padding: "6px 18px",
                                  fontSize: "0.98em",
                                }}
                                onClick={handleAddAttachments}
                              >
                                Add Attachment
                                {editForm.selectedAttachments.length > 1
                                  ? "s"
                                  : ""}
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                    {/* Medical Information Section */}
                    <div className="form-section">
                      <div className="section-header">
                        <div className="section-icon">
                          <i className="fas fa-heartbeat"></i>
                        </div>
                        <h2 className="section-title">Medical Records</h2>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Vital Signs</label>
                        <textarea
                          className="form-textarea"
                          name="VitalSigns"
                          placeholder="Record vital signs and measurements..."
                          value={editForm.VitalSigns}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Consultant Note</label>
                        <textarea
                          className="form-textarea"
                          name="ConsultantNote"
                          placeholder="Professional medical observations..."
                          value={editForm.ConsultantNote}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">User Note</label>
                        <textarea
                          className="form-textarea"
                          name="UserNote"
                          placeholder="Patient's personal notes or concerns..."
                          value={editForm.UserNote}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Recommendations</label>
                        <textarea
                          className="form-textarea"
                          name="Recommendations"
                          placeholder="Treatment recommendations and follow-up instructions..."
                          value={editForm.Recommendations}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="actions-section">
                    <button
                      className="btn btn-cancel"
                      type="button"
                      onClick={() => setShowEditModal(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                      className="btn btn-save"
                      type="submit"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OnlineConsultationManagement;
