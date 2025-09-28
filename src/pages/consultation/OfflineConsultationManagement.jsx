import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import { viewOfflineConsultationsByCreatedBy } from "../../apis/offline-consultation-api";
import { viewAllDoctors } from "../../apis/doctor-api";
import { getAllUsers } from "../../apis/consultant-api";
import {
  bookOfflineConsultation,
  viewOfflineConsultationById,
  softDeleteOfflineConsultation,
  updateOfflineConsultation,
  addAttachmentsToOfflineConsultation,
  sendBookingOfflineConsultationEmails,
} from "../../apis/offline-consultation-api";
import "../../styles/OfflineConsultationManagement.css";
import "../../styles/ConsultantHomePage.css";
import {
  FaComments,
  FaSearch,
  FaUser,
  FaHospital,
  FaPhone,
  FaVideo,
  FaFile,
  FaPaperclip,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaQuestion,
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaClipboardList,
} from "react-icons/fa";
import { FaEye, FaTrash } from "react-icons/fa";

const OfflineConsultationManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorListModal, setShowDoctorListModal] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [doctorListLoading, setDoctorListLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userListLoading, setUserListLoading] = useState(false);
  const [selectedUserForConsultation, setSelectedUserForConsultation] =
    useState(null);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    consultationType: "",
    healthNote: "",
    attachments: [],
    slotStartTime: "",
    slotEndTime: "",
    slotDayOfWeek: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editConsultation, setEditConsultation] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const sortedConsultations = consultations
    .slice()
    .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
  const totalItems = sortedConsultations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedConsultations = sortedConsultations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState(""); // "0" for OneTime, "1" for Periodic
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [periodicDates, setPeriodicDates] = useState([]); // Array of { date, startTime, endTime }
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showConsultationTypeModal, setShowConsultationTypeModal] =
    useState(false);
  const [createAttachments, setCreateAttachments] = useState([]);
  const [editAttachments, setEditAttachments] = useState([]);
  const [editFromMonth, setEditFromMonth] = useState("");
  const [editToMonth, setEditToMonth] = useState("");
  const [editPeriodicDates, setEditPeriodicDates] = useState([]);

  useEffect(() => {
    const fetchUserAndConsultations = async () => {
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
          setLoading(true);
          const consultationsRes = await viewOfflineConsultationsByCreatedBy(
            userData.id,
            token
          );
          setConsultations(consultationsRes?.data || consultationsRes || []);
          setLoading(false);
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
    fetchUserAndConsultations();
  }, [navigate]);

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

  const handleAddOfflineConsultation = async () => {
    setShowDoctorListModal(true);
    setDoctorListLoading(true);
    try {
      const token = localStorage.getItem("token");
      const doctors = await viewAllDoctors(token);
      setDoctorList(Array.isArray(doctors) ? doctors : doctors?.data || []);
    } catch (err) {
      setDoctorList([], err.message);
    }
    setDoctorListLoading(false);
    setSelectedDoctor(null);
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorListModal(false);
    setShowUserListModal(true);
    setUserListLoading(true);
    try {
      const token = localStorage.getItem("token");
      const users = await getAllUsers(token);
      setUserList(Array.isArray(users) ? users : users?.data || []);
    } catch (err) {
      setUserList([], err.message);
    }
    setUserListLoading(false);
    setSelectedUserForConsultation(null);
  };

  const handleSelectUser = (user) => {
    setSelectedUserForConsultation(user);
    setShowUserListModal(false);
    setStep(3);
    setShowConsultationTypeModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    // Get values from form
    const healthNote = e.target.healthNotes.value;

    let payload = {
      userId: selectedUserForConsultation?.id,
      doctorId: selectedDoctor?.id,
      consultationType: consultationType === "1" ? "Periodic" : "OneTime",
      healthNote,
    };

    if (consultationType === "0") {
      // OneTime
      const startDate = e.target.consultationStartDate.value;
      const startTime = e.target.consultationStartTime.value;
      const endDate = e.target.consultationEndDate.value;
      const endTime = e.target.consultationEndTime.value;
      const slotStartTime = `${startDate}T${startTime}`;
      const slotEndTime = `${endDate}T${endTime}`;
      payload = {
        ...payload,
        startDate: slotStartTime,
        endDate: slotEndTime,
        schedule: [
          {
            slot: {
              startTime: slotStartTime,
              endTime: slotEndTime,
            },
          },
        ],
      };
    } else if (consultationType === "1") {
      // Periodic
      payload = {
        ...payload,
        fromMonth: `${e.target.fromMonth.value}-01T00:00:00Z`,
        toMonth: `${e.target.toMonth.value}-01T00:00:00Z`,
        schedule: periodicDates
          .filter((d) => d.date && d.startTime && d.endTime)
          .map((d) => ({
            slot: {
              startTime: `${d.date}T${d.startTime}`,
              endTime: `${d.date}T${d.endTime}`,
            },
          })),
      };
    }

    try {
      const token = localStorage.getItem("token");
      const response = await bookOfflineConsultation(payload, token);
      if (response?.error === 1 && response?.message) {
        setErrorMessage(response.message);
        setTimeout(() => setErrorMessage(""), 4000);
        setCreateLoading(false);
        return;
      }
      if (createAttachments.length > 0 && response?.data?.id) {
        await addAttachmentsToOfflineConsultation(
          response.data.id,
          createAttachments,
          token
        );
      }

      // Send booking emails
      if (response?.data?.id) {
        try {
          await sendBookingOfflineConsultationEmails(response.data.id, token);
        } catch (emailErr) {
          console.error("Error sending booking emails:", emailErr.message);
        }
      }

      setShowCreateModal(false);
      setLoading(true);
      const consultationsRes = await viewOfflineConsultationsByCreatedBy(
        user.id,
        token
      );
      setConsultations(consultationsRes?.data || consultationsRes || []);
      setLoading(false);
      setSuccessMessage("Create Consultation Successful!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Create Consultation Fail!", err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
    setCreateLoading(false);
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

  const handleViewConsultation = async (consultation) => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const detail = await viewOfflineConsultationById(consultation.id, token);
      setEditConsultation(detail?.data || detail);

      // Initialize editable fields for periodic
      if ((detail?.data || detail)?.consultationType === "Periodic") {
        setEditFromMonth(
          (detail?.data || detail)?.fromMonth
            ? (() => {
                const d = new Date((detail?.data || detail).fromMonth);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                  2,
                  "0"
                )}`;
              })()
            : ""
        );

        setEditToMonth(
          (detail?.data || detail)?.toMonth
            ? (() => {
                const d = new Date((detail?.data || detail).toMonth);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                  2,
                  "0"
                )}`;
              })()
            : ""
        );
        setEditPeriodicDates(
          (
            (detail?.data || detail)?.schedule ||
            (detail?.data || detail)?.schedules ||
            []
          ).map((s) => ({
            date: s.slot?.startTime
              ? new Date(s.slot.startTime).toISOString().slice(0, 10)
              : "",
            startTime: s.slot?.startTime ? s.slot.startTime.slice(11, 16) : "",
            endTime: s.slot?.endTime ? s.slot.endTime.slice(11, 16) : "",
          }))
        );
      }
      setShowEditModal(true);
    } catch (err) {
      alert("Failed to fetch consultation detail.\n" + (err.message || ""));
    }
    setEditLoading(false);
  };

  const handleRemoveClick = async (id) => {
    if (window.confirm("Are you sure you want to remove this consultation?")) {
      try {
        const token = localStorage.getItem("token");
        await softDeleteOfflineConsultation(id, token);
        setConsultations((prev) => prev.filter((c) => c.id !== id));
        setSuccessMessage("Remove Consultation Successful!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setErrorMessage("Remove Consultation Fail!", err.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const healthNote = e.target.healthNotes.value;
    const consultationTypeValue = e.target.consultationType.value;

    let payload = {
      id: editConsultation.id,
      healthNote,
    };

    if (consultationTypeValue === "0") {
      // OneTime
      const startDate = e.target.consultationStartDate.value;
      const startTime = e.target.consultationStartTime.value;
      const endDate = e.target.consultationEndDate.value;
      const endTime = e.target.consultationEndTime.value;
      const slotStartTime = `${startDate}T${startTime}`;
      const slotEndTime = `${endDate}T${endTime}`;
      payload = {
        ...payload,
        startDate: slotStartTime,
        endDate: slotEndTime,
        schedule: [
          {
            slot: {
              startTime: slotStartTime,
              endTime: slotEndTime,
            },
          },
        ],
      };
    } else if (consultationTypeValue === "1") {
      // Periodic
      payload = {
        ...payload,
        fromMonth: `${editFromMonth}-01T00:00:00Z`,
        toMonth: `${editToMonth}-01T00:00:00Z`,
        schedule: editPeriodicDates
          .filter((d) => d.date && d.startTime && d.endTime)
          .map((d) => ({
            slot: {
              startTime: `${d.date}T${d.startTime}`,
              endTime: `${d.date}T${d.endTime}`,
            },
          })),
      };
    }

    try {
      const token = localStorage.getItem("token");
      const response = await updateOfflineConsultation(payload, token);
      if (response?.error === 1 && response?.message) {
        setErrorMessage(response.message);
        setTimeout(() => setErrorMessage(""), 4000);
        setEditLoading(false);
        return;
      }
      if (editAttachments.length > 0 && payload.id) {
        await addAttachmentsToOfflineConsultation(
          payload.id,
          editAttachments,
          token
        );
      }
      setEditAttachments([]);
      setShowEditModal(false);
      setLoading(true);
      const consultationsRes = await viewOfflineConsultationsByCreatedBy(
        user.id,
        token
      );
      setConsultations(consultationsRes?.data || consultationsRes || []);
      setLoading(false);
      setSuccessMessage("Update Consultation Successful!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage("Update Consultation Fail!", err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
    setEditLoading(false);
  };

  const clearCreateModalState = () => {
    setSelectedDoctor(null);
    setSelectedUserForConsultation(null);
    setConsultationType("");
    setFromMonth("");
    setToMonth("");
    setPeriodicDates([]);
    setCreateAttachments([]);
    setStep(1);
    setCreateForm({
      consultationType: "",
      healthNote: "",
      attachments: [],
      slotStartTime: "",
      slotEndTime: "",
      slotDayOfWeek: "",
    });
  };

  return (
    <div className="consultant-homepage">
      {successMessage && (
        <div className="notification-popup notification-success offline-consultation-notification-success">
          <span className="notification-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#34C759"
              />
            </svg>
          </span>
          <span className="notification-message">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div
          className="notification-popup offline-consultation-notification-success"
          style={{
            background: "#ffe6e6",
            color: "#d32f2f",
            border: "1px solid #d32f2f",
          }}
        >
          <span className="notification-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13v-4m0 8h.01"
                stroke="#d32f2f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="notification-message">{errorMessage}</span>
        </div>
      )}
      <motion.aside
        className={`consultant-sidebar ${isSidebarOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="consultant-sidebar-header">
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
              {/* <FaBars className="logo-svg" /> */}
            </motion.div>
            {isSidebarOpen && (
              <span className="logo-text">Consultant Panel</span>
            )}
          </Link>
          {isSidebarOpen && <h2 className="consultant-sidebar-title"></h2>}
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSidebarOpen ? (
              <FaChevronLeft size={24} />
            ) : (
              <FaChevronRight size={24} />
            )}
          </motion.button>
        </div>
        <motion.nav
          className="consultant-sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <FaChartLine size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              <FaCalendarAlt size={20} />
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <Link
              to="/consultant"
              onClick={() => setIsSidebarOpen(true)}
              title="Clients"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Clients</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <Link
              to="/consultant/support"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              <FaQuestionCircle size={20} />
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <Link
              to="/consultation/consultation-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Consultation Chat"
            >
              <FaUsers size={20} />
              {isSidebarOpen && <span>Patient Consultation</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item"
          >
            <button
              className="sidebar-action-button"
              title="Online Consultation"
              onClick={() =>
                navigate("/consultation/online-consultation-management")
              }
            >
              <FaClipboardList size={20} />
              {isSidebarOpen && <span>Online Consultation</span>}
            </button>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="consultant-sidebar-nav-item active"
          >
            <button
              className="active-nav-link"
              title="Offline Consultation"
              onClick={() =>
                navigate("/consultation/offline-consultation-management")
              }
            >
              <FaHospital size={20} />
              {isSidebarOpen && <span>Offline Consultation</span>}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item consultant-profile-section"
              >
                <Link
                  to="/profile"
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
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
        10 10 10-4.48 10-10S17.52 2 12 2zm0 
        3c1.66 0 3 1.34 3 3s-1.34 
        3-3 3-3-1.34-3-3 1.34-3 
        3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 
        4-3.08 6-3.08 1.99 0 5.97 1.09 
        6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--consultant-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="consultant-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="consultant-sidebar-nav-item"
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
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={navItemVariants}
              className="consultant-sidebar-nav-item"
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
                {isSidebarOpen && <span>Sign In</span>}
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
              Offline Consultant Management
            </h1>
            <p className="consultant-banner-subtitle">
              Manage your offline consultation here.
            </p>
          </motion.div>
        </section>
        <section>
          <h2 style={{ marginTop: 24, marginBottom: 12 }}>
            Offline Consultation List
          </h2>
          <div className="create-offline-consultation-section">
            <button
              className="create-offline-consultation-btn"
              onClick={handleAddOfflineConsultation}
            >
              <span>➕</span>
              Add Offline Consultation
            </button>
          </div>
          {/* Doctor List Modal */}
          {showDoctorListModal && (
            <div className="modal-overlay">
              <div
                id="selectDoctorModal"
                className="offline-consultation-modal"
              >
                <div className="offline-consultation-modal-content">
                  <div className="offline-consultation-modal-header">
                    <h3>
                      <span>👨‍⚕️</span> Select Doctor
                    </h3>
                    <div className="offline-consultation-step-indicator">
                      <span className={`step${step === 1 ? " active" : ""}`}>
                        Step 1
                      </span>
                      <span>→</span>
                      <span className={`step${step === 2 ? " active" : ""}`}>
                        Step 2
                      </span>
                      <span>→</span>
                      <span className={`step${step === 3 ? " active" : ""}`}>
                        Step 3
                      </span>
                      <span>→</span>
                      <span className={`step${step === 4 ? " active" : ""}`}>
                        Step 4
                      </span>
                    </div>
                    <span
                      className="close"
                      onClick={() => {
                        setShowDoctorListModal(false);
                        clearCreateModalState();
                      }}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="offline-consultation-modal-body">
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search doctors by name"
                        value={doctorSearch || ""}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                      />
                    </div>
                    <div className="card-grid">
                      {doctorListLoading ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                          Loading doctors...
                        </div>
                      ) : doctorList.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                          No doctors found
                        </div>
                      ) : (
                        (showAllDoctors ? doctorList : doctorList.slice(0, 5))
                          .filter(
                            (d) =>
                              !doctorSearch ||
                              d.user?.userName
                                ?.toLowerCase()
                                .includes(doctorSearch.toLowerCase())
                          )
                          .map((doctor) => (
                            <div
                              key={doctor.id}
                              className={`offline-consultation-doctor-card ${
                                selectedDoctor?.id === doctor.id
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => setSelectedDoctor(doctor)}
                            >
                              <div className="offline-consultation-doctor-card-header">
                                <div className="offline-consultation-doctor-avatar">
                                  {doctor.user.userName
                                    ? doctor.user.userName.split(" ").length >
                                        1 && doctor.user.userName.split(" ")[1]
                                      ? doctor.user.userName
                                          .split(" ")[1]
                                          .charAt(0)
                                      : doctor.user.userName.charAt(0)
                                    : "D"}
                                </div>
                                <div className="offline-consultation-doctor-card-info">
                                  <div className="offline-consultation-doctor-card-name">
                                    {doctor.user.userName}
                                  </div>
                                </div>
                              </div>
                              <div className="offline-consultation-doctor-card-details">
                                <div className="offline-consultation-doctor-card-detail-item">
                                  <span className="offline-consultation-doctor-card-detail-icon">
                                    📧
                                  </span>
                                  <span>{doctor.user.email}</span>
                                </div>
                                <div className="offline-consultation-doctor-card-detail-item">
                                  <span className="offline-consultation-doctor-card-detail-icon">
                                    📞
                                  </span>
                                  <span>{doctor.user.phoneNo ?? "N/A"}</span>
                                </div>
                                <div className="offline-consultation-doctor-card-detail-item">
                                  <span className="offline-consultation-doctor-card-detail-icon">
                                    🎓
                                  </span>
                                  <span>{doctor.experienceYear ?? "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                      {!showAllDoctors && doctorList.length > 5 && (
                        <div style={{ textAlign: "center", marginTop: "16px" }}>
                          <button
                            className="offline-consultation-modal-btn offline-consultation-btn-primary"
                            onClick={() => setShowAllDoctors(true)}
                          >
                            Show More
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="offline-consultation-modal-actions">
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-secondary"
                        onClick={() => {
                          setShowDoctorListModal(false);
                          clearCreateModalState();
                        }}
                      >
                        <span>❌</span> Cancel
                      </button>
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-primary"
                        disabled={!selectedDoctor}
                        onClick={() => {
                          setStep(2);
                          handleSelectDoctor(selectedDoctor);
                        }}
                      >
                        <span>👥</span> Select Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* User List Modal */}
          {showUserListModal && (
            <div className="modal-overlay">
              <div id="selectUserModal" className="offline-consultation-modal">
                <div className="offline-consultation-modal-content">
                  <div className="offline-consultation-modal-header">
                    <h3>
                      <span>🧑</span> Select Patient
                    </h3>
                    <div className="offline-consultation-step-indicator">
                      <span className={`step${step === 1 ? " active" : ""}`}>
                        Step 1
                      </span>
                      <span>→</span>
                      <span className={`step${step === 2 ? " active" : ""}`}>
                        Step 2
                      </span>
                      <span>→</span>
                      <span className={`step${step === 3 ? " active" : ""}`}>
                        Step 3
                      </span>
                      <span>→</span>
                      <span className={`step${step === 4 ? " active" : ""}`}>
                        Step 4
                      </span>
                    </div>
                    <span
                      className="close"
                      onClick={() => {
                        setShowUserListModal(false);
                        clearCreateModalState();
                      }}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="offline-consultation-modal-body">
                    <div className="selected-offline-consultaton-doctor-info">
                      <div className="selected-offline-consultaton-doctor-title">
                        <span>👨‍⚕️</span> Selected Doctor
                      </div>
                      <div className="selected-offline-consultaton-doctor-item">
                        <div className="selected-offline-consultaton-doctor-avatar">
                          {selectedDoctor?.user?.userName
                            ? selectedDoctor.user.userName.split(" ")[1]
                              ? selectedDoctor.user.userName
                                  .split(" ")[1]
                                  .charAt(0)
                              : selectedDoctor.user.userName.charAt(0)
                            : "D"}
                        </div>
                        <div>
                          <div className="offline-consultation-doctor-card-name">
                            {selectedDoctor?.user?.userName || "Dr. Name"}
                          </div>
                          <div className="offline-consultation-doctor-card-email">
                            {selectedDoctor?.user?.email || "Dr. Email"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search patients by name"
                        value={userSearch || ""}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    <div className="card-grid" id="userGrid">
                      {userListLoading ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                          Loading patients...
                        </div>
                      ) : userList.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px" }}>
                          No patients found
                        </div>
                      ) : (
                        userList
                          .filter(
                            (u) =>
                              !userSearch ||
                              u.userName
                                ?.toLowerCase()
                                .includes(userSearch.toLowerCase())
                          )
                          .map((user) => (
                            <div
                              key={user.id}
                              className={`offline-consultation-user-card${
                                selectedUserForConsultation?.id === user.id
                                  ? " selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedUserForConsultation(user)
                              }
                            >
                              <div className="offline-consultation-user-card-header">
                                <div className="offline-consultation-user-avatar">
                                  {user.userName
                                    ? user.userName.split(" ")[1]
                                      ? user.userName.split(" ")[1].charAt(0)
                                      : user.userName.charAt(0)
                                    : "U"}
                                </div>
                                <div className="offline-consultation-user-card-info">
                                  <div className="offline-consultation-user-card-name">
                                    {user.userName}
                                  </div>
                                  <div className="offline-consultation-user-card-email">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                              <div className="offline-consultation-user-card-details">
                                <div className="offline-consultation-user-card-detail-item">
                                  <span className="offline-consultation-user-card-detail-icon">
                                    📞
                                  </span>
                                  <span>{user.phoneNo ?? "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                    <div className="offline-consultation-modal-actions">
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-secondary"
                        onClick={() => {
                          setShowUserListModal(false);
                          setShowDoctorListModal(true);
                          setStep(1);
                        }}
                      >
                        <span>⬅️</span> Back to Doctor
                      </button>
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-primary"
                        disabled={!selectedUserForConsultation}
                        onClick={() =>
                          handleSelectUser(selectedUserForConsultation)
                        }
                      >
                        <span>📝</span> Select Consultation Type
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Consultation Type Modal */}
          {showConsultationTypeModal && (
            <div className="modal-overlay">
              <div className="offline-consultation-modal">
                <div className="offline-consultation-modal-content">
                  <div className="offline-consultation-modal-header">
                    <h3>
                      <span>📝</span> Select Consultation Type
                    </h3>
                    <div className="offline-consultation-step-indicator">
                      <span className={`step${step === 1 ? " active" : ""}`}>
                        Step 1
                      </span>
                      <span>→</span>
                      <span className={`step${step === 2 ? " active" : ""}`}>
                        Step 2
                      </span>
                      <span>→</span>
                      <span className={`step${step === 3 ? " active" : ""}`}>
                        Step 3
                      </span>
                      <span>→</span>
                      <span className={`step${step === 4 ? " active" : ""}`}>
                        Step 4
                      </span>
                    </div>
                    <span
                      className="close"
                      onClick={() => {
                        setShowConsultationTypeModal(false);
                        clearCreateModalState();
                      }}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="offline-consultation-modal-body">
                    <div className="offline-consultation-form-group">
                      <label htmlFor="consultationType">
                        Consultation Type *
                      </label>
                      <select
                        id="consultationType"
                        name="consultationType"
                        required
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value)}
                      >
                        <option value="">Select Type</option>
                        <option value="0">One Time</option>
                        <option value="1">Periodic</option>
                      </select>
                    </div>
                    <div className="offline-consultation-modal-actions">
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-secondary"
                        onClick={() => {
                          setShowConsultationTypeModal(false);
                          setShowUserListModal(true);
                          setStep(2);
                        }}
                      >
                        <span>⬅️</span> Back to Patient
                      </button>
                      <button
                        className="offline-consultation-modal-btn offline-consultation-btn-primary"
                        disabled={!consultationType}
                        onClick={() => {
                          setStep(4);
                          setShowConsultationTypeModal(false);
                          setShowCreateModal(true);
                        }}
                      >
                        <span>📝</span> Enter Consultation Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Create Offline Consultation Modal */}
          {showCreateModal && (
            <div className="modal-overlay">
              <div
                id="consultationFormModal"
                className="offline-consultation-modal"
              >
                <div className="offline-consultation-modal-content">
                  <div className="offline-consultation-modal-header">
                    <h3>
                      <span>📝</span> Consultation Information
                    </h3>
                    <div className="offline-consultation-step-indicator">
                      <span className="step">Step 1</span>
                      <span>→</span>
                      <span className="step">Step 2</span>
                      <span>→</span>
                      <span className="step">Step 3</span>
                      <span>→</span>
                      <span className="step active">Step 4</span>
                    </div>
                    <span
                      className="close"
                      onClick={() => {
                        setShowCreateModal(false);
                        setStep(1);
                        setCreateForm((prev) => ({
                          ...prev,
                          attachments: [],
                        }));
                        clearCreateModalState();
                      }}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="offline-consultation-modal-body">
                    <form
                      className="offline-consultation-form"
                      id="consultationForm"
                      onSubmit={handleCreateSubmit}
                    >
                      {consultationType === "0" ? (
                        <>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationStartDate">
                                Consultation Start Date *
                              </label>
                              <input
                                type="date"
                                id="consultationStartDate"
                                name="consultationStartDate"
                                required
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationStartTime">
                                Consultation Start Time *
                              </label>
                              <input
                                type="time"
                                id="consultationStartTime"
                                name="consultationStartTime"
                                required
                              />
                            </div>
                          </div>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationEndDate">
                                Consultation End Date *
                              </label>
                              <input
                                type="date"
                                id="consultationEndDate"
                                name="consultationEndDate"
                                required
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationEndTime">
                                Consultation End Time *
                              </label>
                              <input
                                type="time"
                                id="consultationEndTime"
                                name="consultationEndTime"
                                required
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="fromMonth">From Month *</label>
                              <input
                                type="month"
                                id="fromMonth"
                                name="fromMonth"
                                required
                                value={fromMonth}
                                onChange={(e) => setFromMonth(e.target.value)}
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="toMonth">To Month *</label>
                              <input
                                type="month"
                                id="toMonth"
                                name="toMonth"
                                required
                                value={toMonth}
                                onChange={(e) => setToMonth(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="offline-consultation-form-group">
                            <label>Consultation Dates *</label>
                            <div>
                              {periodicDates.map((d, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    marginBottom: 8,
                                  }}
                                >
                                  <input
                                    type="date"
                                    value={d.date}
                                    min={
                                      fromMonth ? `${fromMonth}-01` : undefined
                                    }
                                    max={toMonth ? `${toMonth}-31` : undefined}
                                    onChange={(e) => {
                                      const arr = [...periodicDates];
                                      arr[idx].date = e.target.value;
                                      setPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <input
                                    type="time"
                                    value={d.startTime}
                                    onChange={(e) => {
                                      const arr = [...periodicDates];
                                      arr[idx].startTime = e.target.value;
                                      setPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <input
                                    type="time"
                                    value={d.endTime}
                                    onChange={(e) => {
                                      const arr = [...periodicDates];
                                      arr[idx].endTime = e.target.value;
                                      setPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPeriodicDates(
                                        periodicDates.filter(
                                          (_, i) => i !== idx
                                        )
                                      )
                                    }
                                    style={{
                                      color: "#d32f2f",
                                      background: "none",
                                      border: "none",
                                      fontSize: "1.2em",
                                    }}
                                    title="Remove date"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="offline-consultation-modal-btn offline-consultation-btn-primary"
                                onClick={() =>
                                  setPeriodicDates([
                                    ...periodicDates,
                                    { date: "", startTime: "", endTime: "" },
                                  ])
                                }
                              >
                                Add Consultation Date
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="offline-consultation-form-group">
                        <label htmlFor="attachments">Attachments</label>
                        <input
                          type="file"
                          id="attachments"
                          name="attachments"
                          multiple
                          onChange={(e) =>
                            setCreateAttachments(Array.from(e.target.files))
                          }
                        />
                        {createAttachments.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <strong>Selected Attachments:</strong>
                            <ul>
                              {createAttachments.map((file, idx) => (
                                <li key={idx}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="offline-consultation-form-group">
                        <label htmlFor="healthNotes">Health Notes</label>
                        <textarea
                          id="healthNotes"
                          name="healthNotes"
                          placeholder="Any additional notes or special instructions..."
                        ></textarea>
                      </div>
                      <div className="offline-consultation-modal-actions">
                        <button
                          type="button"
                          className="offline-consultation-modal-btn offline-consultation-btn-secondary"
                          onClick={() => {
                            setShowCreateModal(false);
                            setShowConsultationTypeModal(true);
                            setCreateForm((prev) => ({
                              ...prev,
                              attachments: [],
                            }));
                            setStep(3);
                          }}
                        >
                          <span>←</span> Back to Consultation Type
                        </button>
                        <button
                          type="submit"
                          className="offline-consultation-modal-btn offline-consultation-btn-primary"
                          disabled={createLoading}
                        >
                          <span>✅</span> Create Consultation
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Edit Offline Consultation Modal */}
          {showEditModal && editConsultation && (
            <div className="modal-overlay">
              <div
                id="editConsultationModal"
                className="offline-consultation-modal"
              >
                <div className="offline-consultation-modal-content">
                  <div className="offline-consultation-modal-header">
                    <h3>
                      <span>📝</span> Consultation Information
                    </h3>
                    <span
                      className="close"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditAttachments([]);
                      }}
                    >
                      &times;
                    </span>
                  </div>
                  <div className="offline-consultation-modal-body">
                    {/* Doctor & Patient Info */}
                    <div className="selected-offline-consultaton-doctor-info">
                      <div className="selected-offline-consultaton-doctor-title">
                        <span>👨‍⚕️</span> Doctor
                      </div>
                      <div className="selected-offline-consultaton-doctor-item">
                        <div className="selected-offline-consultaton-doctor-avatar">
                          {editConsultation.doctor?.user?.userName
                            ? editConsultation.doctor.user.userName.split(
                                " "
                              )[1]
                              ? editConsultation.doctor.user.userName
                                  .split(" ")[1]
                                  .charAt(0)
                              : editConsultation.doctor.user.userName.charAt(0)
                            : "D"}
                        </div>
                        <div>
                          <div className="offline-consultation-doctor-card-name">
                            {editConsultation.doctor?.user?.userName ||
                              "Dr. Name"}
                          </div>
                          <div className="offline-consultation-doctor-card-email">
                            {editConsultation.doctor?.user?.email ||
                              "doctor@email.com"}
                          </div>
                          <div className="offline-consultation-doctor-card-email">
                            {editConsultation.doctor?.specialization ||
                              "Specialization"}
                          </div>
                        </div>
                      </div>
                      <div
                        className="selected-offline-consultaton-doctor-title"
                        style={{ marginTop: "12px" }}
                      >
                        <span>🧑</span> Patient
                      </div>
                      <div className="selected-offline-consultaton-doctor-item">
                        <div className="selected-offline-consultaton-doctor-avatar">
                          {editConsultation.user?.userName
                            ? editConsultation.user.userName.split(" ")[1]
                              ? editConsultation.user.userName
                                  .split(" ")[1]
                                  .charAt(0)
                              : editConsultation.user.userName.charAt(0)
                            : "U"}
                        </div>
                        <div>
                          <div className="offline-consultation-doctor-card-name">
                            {editConsultation.user?.userName || "Patient Name"}
                          </div>
                          <div className="offline-consultation-doctor-card-email">
                            {editConsultation.user?.email ||
                              "patient@email.com"}
                          </div>
                          <div className="offline-consultation-doctor-card-email">
                            {editConsultation.user?.phoneNo || "Phone"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Consultation Info Form */}
                    <form
                      className="offline-consultation-form"
                      id="editConsultationForm"
                      onSubmit={handleEditSubmit}
                    >
                      {editConsultation.consultationType === "OneTime" ? (
                        <>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationStartDate">
                                Start Date
                              </label>
                              <input
                                type="date"
                                id="consultationStartDate"
                                name="consultationStartDate"
                                required
                                defaultValue={
                                  editConsultation.startDate
                                    ? new Date(editConsultation.startDate)
                                        .toISOString()
                                        .slice(0, 10)
                                    : ""
                                }
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationStartTime">
                                Start Time
                              </label>
                              <input
                                type="time"
                                id="consultationStartTime"
                                name="consultationStartTime"
                                required
                                defaultValue={
                                  editConsultation.startDate
                                    ? editConsultation.startDate.slice(11, 16)
                                    : ""
                                }
                              />
                            </div>
                          </div>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationEndDate">
                                End Date
                              </label>
                              <input
                                type="date"
                                id="consultationEndDate"
                                name="consultationEndDate"
                                required
                                defaultValue={
                                  editConsultation.endDate
                                    ? new Date(editConsultation.endDate)
                                        .toISOString()
                                        .slice(0, 10)
                                    : ""
                                }
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="consultationEndTime">
                                End Time
                              </label>
                              <input
                                type="time"
                                id="consultationEndTime"
                                name="consultationEndTime"
                                required
                                defaultValue={
                                  editConsultation.endDate
                                    ? editConsultation.endDate.slice(11, 16)
                                    : ""
                                }
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="offline-consultation-form-row">
                            <div className="offline-consultation-form-group">
                              <label htmlFor="editFromMonth">From Month</label>
                              <input
                                type="month"
                                id="editFromMonth"
                                name="editFromMonth"
                                value={editFromMonth}
                                onChange={(e) =>
                                  setEditFromMonth(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div className="offline-consultation-form-group">
                              <label htmlFor="editToMonth">To Month</label>
                              <input
                                type="month"
                                id="editToMonth"
                                name="editToMonth"
                                value={editToMonth}
                                onChange={(e) => setEditToMonth(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="offline-consultation-form-group">
                            <label>Consultation Schedule</label>
                            <div>
                              {editPeriodicDates.map((d, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    marginBottom: 8,
                                  }}
                                >
                                  <input
                                    type="date"
                                    value={d.date}
                                    min={
                                      editFromMonth
                                        ? `${editFromMonth}-01`
                                        : undefined
                                    }
                                    max={
                                      editToMonth
                                        ? `${editToMonth}-31`
                                        : undefined
                                    }
                                    onChange={(e) => {
                                      const arr = [...editPeriodicDates];
                                      arr[idx].date = e.target.value;
                                      setEditPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <input
                                    type="time"
                                    value={d.startTime}
                                    onChange={(e) => {
                                      const arr = [...editPeriodicDates];
                                      arr[idx].startTime = e.target.value;
                                      setEditPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <input
                                    type="time"
                                    value={d.endTime}
                                    onChange={(e) => {
                                      const arr = [...editPeriodicDates];
                                      arr[idx].endTime = e.target.value;
                                      setEditPeriodicDates(arr);
                                    }}
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditPeriodicDates(
                                        editPeriodicDates.filter(
                                          (_, i) => i !== idx
                                        )
                                      )
                                    }
                                    style={{
                                      color: "#d32f2f",
                                      background: "none",
                                      border: "none",
                                      fontSize: "1.2em",
                                    }}
                                    title="Remove date"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="offline-consultation-modal-btn offline-consultation-btn-primary"
                                onClick={() =>
                                  setEditPeriodicDates([
                                    ...editPeriodicDates,
                                    { date: "", startTime: "", endTime: "" },
                                  ])
                                }
                              >
                                Add Consultation Date
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="offline-consultation-form-group">
                        <label htmlFor="consultationType">
                          Consultation Type *
                        </label>
                        <select
                          id="consultationType"
                          name="consultationType"
                          required
                          defaultValue={
                            editConsultation.consultationType === "OneTime"
                              ? "0"
                              : "1"
                          }
                          disabled
                          readOnly
                        >
                          <option value="">Select Type</option>
                          <option value="0">One Time</option>
                          <option value="1">Periodic</option>
                        </select>
                      </div>
                      <div className="offline-consultation-form-group">
                        <label htmlFor="attachments">Attachments</label>
                        {/* Show existing attachments if any */}
                        {editConsultation.attachments &&
                          editConsultation.attachments.length > 0 && (
                            <div>
                              <ul>
                                {editConsultation.attachments.map(
                                  (att, idx) => (
                                    <li key={idx}>
                                      {att.fileName ? (
                                        <a
                                          href={att.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {att.fileName}
                                        </a>
                                      ) : typeof att === "string" ? (
                                        att
                                      ) : (
                                        "Unknown file"
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                      <div className="offline-consultation-form-group">
                        <label htmlFor="editAttachments">Add Attachments</label>
                        <input
                          type="file"
                          id="editAttachments"
                          name="editAttachments"
                          multiple
                          onChange={(e) =>
                            setEditAttachments(Array.from(e.target.files))
                          }
                        />
                        {editAttachments.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <strong>Selected Attachments:</strong>
                            <ul>
                              {editAttachments.map((file, idx) => (
                                <li key={idx}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="offline-consultation-form-group">
                        <label htmlFor="healthNotes">Health Notes</label>
                        <textarea
                          id="healthNotes"
                          name="healthNotes"
                          defaultValue={editConsultation.healthNote || ""}
                          placeholder="Any additional notes or special instructions..."
                        ></textarea>
                      </div>
                      <div className="offline-consultation-modal-actions">
                        <button
                          type="button"
                          className="offline-consultation-modal-btn offline-consultation-btn-secondary"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditAttachments([]);
                          }}
                        >
                          <span>❌</span> Cancel
                        </button>
                        <button
                          type="submit"
                          className="offline-consultation-modal-btn offline-consultation-btn-primary"
                          disabled={editLoading}
                        >
                          <span>✅</span> Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Offline Consultation Table */}
          {loading ? (
            <div>Loading offline consultations...</div>
          ) : totalItems === 0 ? (
            <div>No offline consultations found.</div>
          ) : (
            <>
              <table className="offlineConsultation-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Start date</th>
                    <th>End date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedConsultations.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        {item.doctor?.user?.userName} <br />
                        <span className="offlineConsultation-table-email">
                          {item.doctor?.user?.email}
                        </span>
                      </td>
                      <td>
                        {item.user?.userName} <br />
                        <span className="offlineConsultation-table-email">
                          {item.user?.email}
                        </span>
                      </td>
                      <td>
                        {item.startDate
                          ? new Date(item.startDate).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </td>
                      <td>
                        {item.endDate
                          ? new Date(item.endDate).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </td>
                      <td>{item.status}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="action-btn view"
                            title="View Detail"
                            onClick={() => handleViewConsultation(item)}
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
                  className="offlineConsultation-pagination-btn"
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
                  className="offlineConsultation-pagination-btn"
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
      </main>
    </div>
  );
};

export default OfflineConsultationManagement;
