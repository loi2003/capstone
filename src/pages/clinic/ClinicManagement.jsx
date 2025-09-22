import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/ClinicManagement.css";
import { FaEye, FaTrash } from "react-icons/fa";
import {
  createDoctor,
  updateDoctor,
  softDeleteDoctor,
  viewClinicByUserId,
} from "../../apis/doctor-api";
import { updateClinic } from "../../apis/clinic-api";

const ClinicManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    specialization: "",
    certificate: "",
    experienceYear: "",
    workPosition: "",
    description: "",
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [clinic, setClinic] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editDetailForm, setEditDetailForm] = useState({});
  const [showEditClinicModal, setShowEditClinicModal] = useState(false);
  const [editClinicForm, setEditClinicForm] = useState({
    address: "",
    description: "",
    specializations: "",
  });
  const [doctorPage, setDoctorPage] = useState(1);
  const doctorsPerPage = 10;
  const paginatedDoctors = clinic?.doctors
    ? clinic.doctors.slice(
        (doctorPage - 1) * doctorsPerPage,
        doctorPage * doctorsPerPage
      )
    : [];

  useEffect(() => {
    const fetchUserAndDoctors = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 5) {
          setUser(userData);
          const clinicRes = await viewClinicByUserId(userData.id, token);
          const clinicData = clinicRes.data || clinicRes || null;
          setClinic(clinicData);
          setDoctors(clinicData?.doctors || []);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user/clinic:", error.message);
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
      setLoading(false);
    };
    fetchUserAndDoctors();
  }, [navigate]);

  // Add this helper function at the top of your file:
  function toInputDateFormat(dateStr) {
    if (!dateStr) return "";
    // If already in yyyy-mm-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // If in dd/mm/yyyy or mm/dd/yyyy
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        // Try dd/mm/yyyy
        const [d1, d2, d3] = parts;
        // If d3 is year
        if (d3.length === 4) {
          return `${d3}-${d2.padStart(2, "0")}-${d1.padStart(2, "0")}`;
        }
      }
    }
    // Try parsing with Date
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (showDetailModal && selectedDoctor) {
      setEditDetailForm({
        userName: selectedDoctor.user?.userName || "",
        email: selectedDoctor.user?.email || "",
        phoneNumber: selectedDoctor.user?.phoneNo || "",
        gender: selectedDoctor.gender || "",
        dateOfBirth: toInputDateFormat(
          selectedDoctor.dateOfBirth || selectedDoctor.user?.dateOfBirth || ""
        ),
        specialization: selectedDoctor.specialization || "",
        certificate: selectedDoctor.certificate || "",
        experienceYear: selectedDoctor.experienceYear || "",
        workPosition: selectedDoctor.workPosition || "",
        description: selectedDoctor.description || "",
        id: selectedDoctor.id,
        userId: selectedDoctor.user?.id,
        clinicId: selectedDoctor.clinicId,
        status: selectedDoctor.user?.status || "",
      });
    }
  }, [showDetailModal, selectedDoctor]);

  useEffect(() => {
    if (showEditClinicModal && clinic) {
      setEditClinicForm({
        address: clinic.address || "",
        description: clinic.description || "",
        specializations: clinic.specializations || "",
      });
    }
  }, [showEditClinicModal, clinic]);

  const handleEditClinicChange = (e) => {
    const { name, value } = e.target;
    setEditClinicForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClinicSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await updateClinic(
        {
          id: clinic.id,
          name: clinic.user?.userName,
          address: editClinicForm.address,
          description: editClinicForm.description,
          phone: clinic.user?.phoneNo,
          email: clinic.user?.email,
          isInsuranceAccepted: clinic.insuranceAccepted,
          specializations: editClinicForm.specializations,
        },
        token
      );
      setShowEditClinicModal(false);
      setSuccessMessage("Clinic updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      // Refresh clinic info
      const clinicRes = await viewClinicByUserId(user.id, token);
      const clinicData = clinicRes.data || clinicRes || null;
      setClinic(clinicData);
    } catch (err) {
      setErrorMessage("Update clinic failed!");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDetailEditChange = (e) => {
    const { name, value } = e.target;
    setEditDetailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      // Compose doctor object for update
      const doctorUpdate = {
        ...selectedDoctor,
        ...editDetailForm,
        user: {
          ...selectedDoctor.user,
          userName: editDetailForm.userName,
          email: editDetailForm.email,
          phoneNumber: editDetailForm.phoneNumber,
          status: selectedDoctor.user?.status,
          id: selectedDoctor.user?.id,
        },
        gender: editDetailForm.gender,
        dateOfBirth: editDetailForm.dateOfBirth,
        specialization: editDetailForm.specialization,
        certificate: editDetailForm.certificate,
        experienceYear: editDetailForm.experienceYear,
        workPosition: editDetailForm.workPosition,
        description: editDetailForm.description,
        clinicId: selectedDoctor.clinicId,
        id: selectedDoctor.id,
      };
      await updateDoctor(doctorUpdate, token);
      setIsEditingDetail(false);
      setShowDetailModal(false);
      setSuccessMessage("Doctor updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      // Refresh doctor list
      const clinicRes = await viewClinicByUserId(user.id, token);
      const clinicData = clinicRes.data || clinicRes || null;
      setClinic(clinicData);
      setDoctors(clinicData?.doctors || []);
    } catch (err) {
      setErrorMessage("Update doctor failed!", err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  // Create doctor
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const doctorData = {
        ...createForm,
        clinicId: clinic?.id,
      };
      await createDoctor(doctorData, token);
      setShowCreateModal(false);
      setSuccessMessage("Doctor created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      const clinicRes = await viewClinicByUserId(user.id, token);
      const clinicData = clinicRes.data || clinicRes || null;
      setClinic(clinicData);
      setDoctors(clinicData?.doctors || []);
    } catch (err) {
      setErrorMessage("Create doctor failed!", err.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Remove doctor
  const handleRemoveClick = async (id) => {
    if (window.confirm("Are you sure you want to remove this doctor?")) {
      try {
        const token = localStorage.getItem("token");
        await softDeleteDoctor(id, token);
        setSuccessMessage("Doctor removed successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);

        // Fetch updated doctors after remove
        const clinicRes = await viewClinicByUserId(user.id, token);
        const clinicData = clinicRes.data || clinicRes || null;
        setClinic(clinicData);
        setDoctors(clinicData?.doctors || []);
      } catch (err) {
        setErrorMessage("Remove doctor failed!", err.message);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  function formatDateDMY(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function renderStars(rating) {
    // rating: 1-10, show 5 stars (half star for 0.5 steps)
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1 ? true : false;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} style={{ color: "#fbbf24", fontSize: "18px" }}>
          ★
        </span>
      );
    }
    if (halfStar) {
      stars.push(
        <span key="half" style={{ color: "#fbbf24", fontSize: "18px" }}>
          ☆
        </span>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} style={{ color: "#e5e7eb", fontSize: "18px" }}>
          ★
        </span>
      );
    }
    return stars;
  }

  function getAverageRating() {
    if (!clinic?.feedbacks || clinic.feedbacks.length === 0) return "0.0";
    const total = clinic.feedbacks.reduce(
      (sum, fb) => sum + (Number(fb.rating) || 0),
      0
    );
    return (total / clinic.feedbacks.length).toFixed(1);
  }

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

  return (
    <div className="doctor-management">
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
          <span className="notification-message">
            {errorMessage || successMessage}
          </span>
        </div>
      )}
      <motion.aside
        className={`doctor-management-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial="open"
      >
        <div className="sidebar-header">
          <Link
            to="/clinic"
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
                aria-label="Clinic icon for logo"
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 11h6m-9-9h12"
                  fill="var(--clinic-color3)"
                  stroke="var(--clinic-color4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Clinic Panel</span>}
          </Link>
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
                stroke="var(--clinic-background)"
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
              to="/clinic/dashboard"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Clinic icon for dashboard"
              >
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm6 11h6m-9-9h12"
                  fill="var(--clinic-color1)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Clinic Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/schedule"
              onClick={() => setIsSidebarOpen(true)}
              title="Schedule"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Calendar icon for schedule"
              >
                <path
                  d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
                  fill="var(--clinic-color2)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Schedule</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/patients"
              onClick={() => setIsSidebarOpen(true)}
              title="Patients"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Users icon for patients"
              >
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm6 10v-2a4 4 0 00-3-3.87m4-5.13a4 4 0 100-8 4 4 0 000 8z"
                  fill="var(--clinic-color3)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Patients</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/support"
              onClick={() => setIsSidebarOpen(true)}
              title="Support"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Support icon"
              >
                <path
                  d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728M12 9v3m0 3h.01"
                  fill="var(--clinic-color4)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Support</span>}
            </Link>
          </motion.div>
          <motion.div variants={navItemVariants} className="sidebar-nav-item">
            <Link
              to="/clinic/clinic-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Doctor Management"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Clipboard plus icon for doctors management"
              >
                <path
                  d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m4 6v6m-3-3h6"
                  fill="var(--clinic-background)"
                  stroke="var(--clinic-color4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Clinic Management</span>}
            </Link>
          </motion.div>
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
                aria-label="Book icon for blog management"
              >
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20m-16-13h13.5c1.38 0 2.5 1.12 2.5 2.5v13c0 1.38-1.12 2.5-2.5 2.5H4m2.5-13v13"
                  fill="var(--clinic-color5)"
                  stroke="var(--clinic-text)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isSidebarOpen && <span>Blog Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item clinic-profile-section"
              >
                <div
                  className="clinic-profile-info"
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
                      fill="var(--clinic-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="clinic-profile-email">{user.email}</span>
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
                      stroke="var(--clinic-logout)"
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
                  aria-label="Sign in icon"
                >
                  <path
                    stroke="var(--clinic-background)"
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
      <main className="doctor-management-content">
        <section className="doctor-management-banner">
          {/* Header */}
          <div className="clinic-management-header-content">
            <div className="clinic-management-info">
              <div className="clinic-management-icon">
                <div className="clinic-manegement-building-icon"></div>
              </div>
              <div>
                <h1 className="clinic-management-name">
                  {clinic?.user?.userName}
                </h1>
                <div className="clinic-management-meta">
                  <div className="clinic-management-rating">
                    {renderStars(getAverageRating())}
                    <span className="clinic-management-rating-text">
                      {getAverageRating()}/10
                    </span>
                  </div>
                  <div className="clinic-management-insurance">
                    <div className="clinic-management-insurance-icon"></div>
                    <span>
                      {clinic?.insuranceAccepted
                        ? "Health insurance accepted"
                        : "Health insurance not accepted"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="clinic-management-header-actions">
              <div className="clinic-management-contact-info">
                <div className="clinic-management-contact-item">
                  <div className="clinic-management-contact-icon"></div>
                  <span>{clinic?.user?.phoneNo || "N/A"}</span>
                </div>
                <div className="clinic-management-contact-item">
                  <div className="clinic-management-contact-icon"></div>
                  <span>{clinic?.user?.email || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>
          {/* Navigation Tabs */}
          <div className="clinic-management-tab-container">
            <div className="clinic-management-tabs">
              {[
                { id: "overview", label: "Overview" },
                { id: "doctors", label: "Doctor" },
                { id: "consultants", label: "Consultant" },
                { id: "feedback", label: "Feedback" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`clinic-management-tab${
                    activeTab === tab.id ? " clinic-management-active-tab" : ""
                  }`}
                >
                  <span className="clinic-management-tab-icon"></span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className="clinic-management-tab-content">
            {activeTab === "overview" && (
              <div>
                <div className="clinic-management-section-header">
                  <button
                  className="clinic-management-add-button"
                  onClick={() => setShowEditClinicModal(true)}
                >
                  Update Clinic
                </button>
                </div>
                <div className="clinic-management-overview-grid">
                  <div className="clinic-management-info-card">
                    <h3 className="clinic-management-card-title">Address</h3>
                    <div className="clinic-management-card-text">
                      {clinic?.address
                        ? clinic.address
                            .split(";")
                            .map((addr, idx) => (
                              <div key={idx}>• {addr.trim()}</div>
                            ))
                        : "N/A"}
                    </div>
                  </div>

                  <div className="clinic-management-info-card">
                    <h3 className="clinic-management-card-title">
                      Description
                    </h3>
                    <p className="clinic-management-card-text">
                      {clinic?.description || "N/A"}
                    </p>
                  </div>

                  <div className="clinic-management-info-card clinic-management-specialization-card">
                    <h3 className="clinic-management-card-title">
                      Specializations
                    </h3>
                    <div className="clinic-management-specialization-grid">
                      {clinic?.specializations.split(";").map((spec, index) => (
                        <div
                          key={index}
                          className="clinic-management-specialization-item"
                        >
                          {spec.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "doctors" && (
              <div>
                <div className="clinic-management-section-header">
                  <div>
                    <h2 className="clinic-management-section-title">
                      Doctor Management
                    </h2>
                    <p className="clinic-management-section-subtitle">
                      List {clinic?.doctors.length} Doctors
                    </p>
                  </div>
                  <button
                    className="clinic-management-add-button"
                    onClick={() => setShowCreateModal(true)}
                    onMouseEnter={(e) => {
                      e.target.classList.add(
                        "clinic-management-add-button-hover"
                      );
                    }}
                    onMouseLeave={(e) => {
                      e.target.classList.remove(
                        "clinic-management-add-button-hover"
                      );
                    }}
                  >
                    Add Doctor
                  </button>
                </div>

                <div className="clinic-management-table-container">
                  <table className="clinic-management-table">
                    <thead className="clinic-management-table-head">
                      <tr>
                        <th className="clinic-management-table-header">
                          Doctor
                        </th>
                        <th className="clinic-management-table-header">
                          Specialization
                        </th>
                        <th className="clinic-management-table-header">
                          Experience
                        </th>
                        <th className="clinic-management-table-header">
                          Contact
                        </th>
                        <th className="clinic-management-table-header">
                          Status
                        </th>
                        <th className="clinic-management-table-header">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDoctors.length > 0 ? (
                        paginatedDoctors.map((doctor) => (
                          <tr
                            key={doctor.id}
                            className="clinic-management-table-row"
                          >
                            <td className="clinic-management-table-cell">
                              <div className="clinic-management-doctor-name">
                                {doctor.user?.userName}
                              </div>
                              <div className="clinic-management-doctor-cert">
                                {doctor.certificate}
                              </div>
                            </td>
                            <td className="clinic-management-table-cell">
                              <div className="clinic-management-doctor-name">
                                {doctor.specialization}
                              </div>
                              <div className="clinic-management-doctor-cert">
                                {doctor.workPosition}
                              </div>
                            </td>
                            <td className="clinic-management-table-cell">
                              <div className="clinic-management-doctor-name">
                                {doctor.experienceYear}
                              </div>
                              <div className="clinic-management-doctor-cert">
                                {doctor.gender}
                              </div>
                            </td>
                            <td className="clinic-management-table-cell">
                              <div className="clinic-management-doctor-name">
                                {doctor.user?.email}
                              </div>
                              <div className="clinic-management-doctor-cert">
                                {doctor.user?.phoneNo}
                              </div>
                            </td>
                            <td className="clinic-management-table-cell">
                              <span className="clinic-management-status-badge">
                                {doctor.user?.status}
                              </span>
                            </td>
                            <td className="clinic-management-table-cell">
                              <div className="clinic-management-actions">
                                <button
                                  className="clinic-management-action-button"
                                  title="View"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setShowDetailModal(true);
                                  }}
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="clinic-management-action-button"
                                  title="Remove"
                                  onClick={() => handleRemoveClick(doctor.id)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            className="clinic-management-table-cell"
                            colSpan={6}
                            style={{ textAlign: "center" }}
                          >
                            No doctors found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {clinic?.doctors &&
                    clinic.doctors.length > doctorsPerPage && (
                      <div className="clinic-management-pagination">
                        <button
                          className="clinic-management-pagination-btn"
                          onClick={() =>
                            setDoctorPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={doctorPage === 1}
                        >
                          Prev
                        </button>
                        <span className="clinic-management-pagination-info">
                          Page {doctorPage} of{" "}
                          {Math.ceil(clinic.doctors.length / doctorsPerPage)}
                        </span>
                        <button
                          className="clinic-management-pagination-btn"
                          onClick={() =>
                            setDoctorPage((prev) =>
                              prev <
                              Math.ceil(clinic.doctors.length / doctorsPerPage)
                                ? prev + 1
                                : prev
                            )
                          }
                          disabled={
                            doctorPage ===
                            Math.ceil(clinic.doctors.length / doctorsPerPage)
                          }
                        >
                          Next
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Consultants Tab */}
            {activeTab === "consultants" && (
              <div>
                <div className="clinic-management-section-header">
                  <div>
                    <h2 className="clinic-management-section-title">
                      Consultant
                    </h2>
                    <p className="clinic-management-section-subtitle">
                      List {clinic?.consultants.length} Consultants
                    </p>
                  </div>
                </div>

                <div className="clinic-management-consultant-grid">
                  {clinic?.consultants && clinic.consultants.length > 0 ? (
                    clinic.consultants.map((consultant) => (
                      <div
                        key={consultant.id}
                        className="clinic-management-consultant-card"
                      >
                        <div className="clinic-management-consultant-header">
                          <div className="clinic-management-consultant-avatar"></div>
                          <div>
                            <div className="clinic-management-consultant-name">
                              {consultant.user?.userName}
                            </div>
                            <div className="clinic-management-consultant-cert">
                              {consultant.certificate}
                            </div>
                          </div>
                        </div>
                        <div className="clinic-management-consultant-info">
                          <div className="clinic-management-consultant-detail">
                            <span>Specialization:</span>{" "}
                            {consultant.specialization}
                          </div>
                          <div className="clinic-management-consultant-detail">
                            <span>Experience:</span>{" "}
                            {consultant.experienceYears} years
                          </div>
                          <div className="clinic-management-consultant-detail">
                            <span>Email:</span> {consultant.user?.email}
                          </div>
                          <div className="clinic-management-consultant-detail">
                            <span>Phone:</span> {consultant.user?.phoneNo}
                          </div>
                        </div>
                        <div className="clinic-management-consultant-status">
                          <span className="clinic-management-status-badge">
                            {consultant.user?.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      No consultants found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === "feedback" && (
              <div>
                <div className="clinic-management-section-header">
                  <div>
                    <h2 className="clinic-management-section-title">
                      Patient Reviews
                    </h2>
                    <p className="clinic-management-section-subtitle">
                      Average score: {getAverageRating()}/10 (
                      {clinic?.feedbacks.length || 0} reviews)
                    </p>
                  </div>
                </div>

                <div className="clinic-management-feedback-list">
                  {clinic?.feedbacks && clinic.feedbacks.length > 0 ? (
                    clinic.feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="clinic-management-feedback-card"
                      >
                        <div className="clinic-management-feedback-header">
                          <div className="clinic-management-feedback-rating">
                            {renderStars(feedback.rating)}
                            <span className="clinic-management-rating-number">
                              {feedback.rating}/10
                            </span>
                          </div>
                        </div>
                        <p className="clinic-management-feedback-comment">
                          {feedback.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      No feedbacks found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Doctor Modal */}
          {showCreateModal && (
            <div className="clinic-management-modal">
              <div className="clinic-management-modal-content">
                <div className="clinic-management-modal-header">
                  <h2 className="clinic-management-modal-title">
                    Add New Doctor
                  </h2>
                  <span
                    className="clinic-management-close-button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    &times;
                  </span>
                </div>

                <form
                  className="clinic-management-form"
                  onSubmit={handleCreateSubmit}
                >
                  <div className="clinic-management-form-grid">
                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="userName"
                        className="clinic-management-input"
                        placeholder="Enter full name"
                        value={createForm.userName}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            userName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="clinic-management-input"
                        placeholder="Enter email address"
                        value={createForm.email}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phoneNumber"
                        className="clinic-management-input"
                        placeholder="Enter phone number"
                        value={createForm.phoneNumber}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">Gender</label>
                      <select
                        name="gender"
                        className="clinic-management-select"
                        value={createForm.gender}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            gender: e.target.value,
                          }))
                        }
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">
                        Experience Year
                      </label>
                      <input
                        type="number"
                        name="experienceYear"
                        className="clinic-management-input"
                        placeholder="Enter experience year"
                        value={createForm.experienceYear}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            experienceYear: e.target.value,
                          }))
                        }
                        min="0"
                      />
                    </div>

                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">
                        Work Position
                      </label>
                      <input
                        type="text"
                        name="workPosition"
                        className="clinic-management-input"
                        placeholder="Enter work position"
                        value={createForm.workPosition}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            workPosition: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="clinic-management-form-field">
                      <label className="clinic-management-label">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        className="clinic-management-input"
                        value={createForm.dateOfBirth || ""}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="clinic-management-form-field">
                    <label className="clinic-management-label">
                      Specialization
                    </label>
                    <textarea
                      name="specialization"
                      className="clinic-management-input"
                      placeholder="Enter specialization"
                      value={createForm.specialization}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          specialization: e.target.value,
                        }))
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="clinic-management-form-field">
                    <label className="clinic-management-label">
                      Certificate
                    </label>
                    <textarea
                      name="certificate"
                      className="clinic-management-input"
                      placeholder="Enter certificate details"
                      value={createForm.certificate}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          certificate: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="clinic-management-form-field">
                    <label className="clinic-management-label">
                      Description
                    </label>
                    <textarea
                      name="description"
                      className="clinic-management-textarea"
                      placeholder="Enter description"
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>
                  <div className="clinic-management-modal-actions">
                    <button
                      type="button"
                      className="clinic-management-cancel-button"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="clinic-management-save-button"
                    >
                      Add Doctor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Doctor Detail Modal */}
          {showDetailModal && selectedDoctor && (
            <div className="clinic-management-modal">
              <div className="clinic-management-modal-content">
                <div className="clinic-management-modal-header">
                  <h2 className="clinic-management-modal-title">
                    Doctor Detail
                  </h2>
                  <span
                    className="clinic-management-close-button"
                    onClick={() => {
                      setShowDetailModal(false);
                      setIsEditingDetail(false);
                    }}
                  >
                    &times;
                  </span>
                </div>
                <div className="clinic-management-header-actions">
                  {!isEditingDetail && (
                    <button
                      className="clinic-management-edit-button"
                      onClick={() => setIsEditingDetail(true)}
                    >
                      Update
                    </button>
                  )}
                </div>
                <form
                  className="clinic-management-form"
                  onSubmit={handleDetailSave}
                >
                  <div className="clinic-management-form-grid">
                    <div className="clinic-management-detail-section">
                      <h3 className="clinic-management-section-title">
                        Personal Information
                      </h3>
                      <div className="clinic-management-section-content">
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Full Name
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="text"
                              name="userName"
                              className="clinic-management-input"
                              value={editDetailForm.userName}
                              onChange={handleDetailEditChange}
                              required
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.user?.userName}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Email
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="email"
                              name="email"
                              className="clinic-management-input"
                              value={editDetailForm.email}
                              onChange={handleDetailEditChange}
                              required
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.user?.email}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Phone Number
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="text"
                              name="phoneNumber"
                              className="clinic-management-input"
                              value={editDetailForm.phoneNumber}
                              onChange={handleDetailEditChange}
                              required
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.user?.phoneNo}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Gender
                          </label>
                          {isEditingDetail ? (
                            <select
                              name="gender"
                              className="clinic-management-select"
                              value={editDetailForm.gender}
                              onChange={handleDetailEditChange}
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.gender}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Date of Birth
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="date"
                              name="dateOfBirth"
                              className="clinic-management-input"
                              value={editDetailForm.dateOfBirth || ""}
                              onChange={handleDetailEditChange}
                              required
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {formatDateDMY(
                                selectedDoctor.dateOfBirth ||
                                  selectedDoctor.user?.dateOfBirth
                              )}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Status
                          </label>
                          <span className="clinic-management-status-badge">
                            {selectedDoctor.user?.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="clinic-management-detail-section">
                      <h3 className="clinic-management-section-title">
                        Professional Information
                      </h3>
                      <div className="clinic-management-section-content">
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Specialization
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="text"
                              name="specialization"
                              className="clinic-management-input"
                              value={editDetailForm.specialization}
                              onChange={handleDetailEditChange}
                              required
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.specialization}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Certificate
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="text"
                              name="certificate"
                              className="clinic-management-input"
                              value={editDetailForm.certificate}
                              onChange={handleDetailEditChange}
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.certificate}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Experience Year
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="number"
                              name="experienceYear"
                              className="clinic-management-input"
                              value={editDetailForm.experienceYear}
                              onChange={handleDetailEditChange}
                              min="0"
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.experienceYear}
                            </p>
                          )}
                        </div>
                        <div className="clinic-management-detail-field">
                          <label className="clinic-management-detail-label">
                            Work Position
                          </label>
                          {isEditingDetail ? (
                            <input
                              type="text"
                              name="workPosition"
                              className="clinic-management-input"
                              value={editDetailForm.workPosition}
                              onChange={handleDetailEditChange}
                            />
                          ) : (
                            <p className="clinic-management-detail-value">
                              {selectedDoctor.workPosition}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="clinic-management-detail-section clinic-management-detail-section-full">
                    <h3 className="clinic-management-section-title">
                      Description
                    </h3>
                    {isEditingDetail ? (
                      <textarea
                        name="description"
                        className="clinic-management-textarea"
                        value={editDetailForm.description}
                        onChange={handleDetailEditChange}
                        rows={3}
                      />
                    ) : (
                      <p className="clinic-management-detail-value">
                        {selectedDoctor.description}
                      </p>
                    )}
                  </div>
                  {isEditingDetail && (
                    <div className="clinic-management-modal-actions">
                      <button
                        type="button"
                        className="clinic-management-cancel-button"
                        onClick={() => setIsEditingDetail(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="clinic-management-save-button"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Edit Clinic Modal */}
          {showEditClinicModal && (
            <div className="clinic-management-modal-overlay">
              <div className="clinic-management-modal">
                <div className="clinic-management-modal-content">
                  <div className="clinic-management-modal-header">
                    <h2 className="clinic-management-modal-title">
                      Edit Clinic Info
                    </h2>
                    <span
                      className="clinic-management-close-button"
                      onClick={() => setShowEditClinicModal(false)}
                    >
                      &times;
                    </span>
                  </div>
                  <form
                    className="clinic-management-form"
                    onSubmit={handleEditClinicSave}
                  >
                    <div className="clinic-management-form-grid">
                      <div className="clinic-management-detail-section clinic-management-detail-section-full">
                        <h3 className="clinic-management-section-title">
                          Address
                        </h3>
                        <textarea
                          name="address"
                          className="clinic-management-textarea"
                          value={editClinicForm.address}
                          onChange={handleEditClinicChange}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="clinic-management-detail-section clinic-management-detail-section-full">
                        <h3 className="clinic-management-section-title">
                          Description
                        </h3>
                        <textarea
                          name="description"
                          className="clinic-management-textarea"
                          value={editClinicForm.description}
                          onChange={handleEditClinicChange}
                          rows={2}
                          required
                        />
                      </div>
                      <div className="clinic-management-detail-section clinic-management-detail-section-full">
                        <h3 className="clinic-management-section-title">
                          Specializations
                        </h3>
                        <textarea
                          name="specializations"
                          className="clinic-management-textarea"
                          value={editClinicForm.specializations}
                          onChange={handleEditClinicChange}
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                    <div className="clinic-management-modal-actions">
                      <button
                        type="button"
                        className="clinic-management-cancel-button"
                        onClick={() => setShowEditClinicModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="clinic-management-save-button"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ClinicManagement;
