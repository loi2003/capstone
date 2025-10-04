import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiClient from "../apis/url-api";
import {
  getCurrentUser,
  uploadAvatar,
  editUserProfile,
} from "../apis/authentication-api";
import {
  getAllergiesAndDiseasesByUserId,
  addDiseaseToUser,
  addAllergyToUser,
  removeDiseaseFromUser,
  removeAllergyFromUser,
  updateDiseaseToUser,
  updateAllergyToUser,
} from "../apis/user-api";
import { viewAllAllergies, viewAllergyById } from "../apis/allergy-api";
import { viewAllDiseases, viewDiseaseById } from "../apis/disease-api";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [userData, setUserData] = useState({
    userName: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [subscriptionPlan, setSubscriptionPlan] = useState("N/A");

  // New states for allergies and diseases
  const [allergiesAndDiseases, setAllergiesAndDiseases] = useState({
    diseases: [],
    allergies: [],
  });
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalMode, setModalMode] = useState("");
  const [newMedicalData, setNewMedicalData] = useState({});
  const [allAllergies, setAllAllergies] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUserSubscription = async (userId) => {
    try {
      const response = await apiClient.get(
        `/api/user-subscription/view-user-subscription-by-user-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const planTierPriority = {
          Free: 1,
          free: 1,
          Plus: 2,
          plus: 2,
          Pro: 3,
          pro: 3,
        };

        const activeSubscriptions = response.data.filter(
          (sub) => sub.status === 1 || sub.status === "Active"
        );

        if (activeSubscriptions.length > 0) {
          const sortedByTier = [...activeSubscriptions].sort((a, b) => {
            const planNameA = a.subscriptionPlan?.subscriptionName;
            const planNameB = b.subscriptionPlan?.subscriptionName;
            const tierA = planTierPriority[planNameA] || 0;
            const tierB = planTierPriority[planNameB] || 0;
            return tierB - tierA;
          });

          const highestTierSubscription = sortedByTier[0];
          const planName =
            highestTierSubscription.subscriptionPlan?.subscriptionName || "N/A";
          setSubscriptionPlan(planName);
        } else {
          setSubscriptionPlan("N/A");
        }
      } else {
        setSubscriptionPlan("N/A");
      }
    } catch (error) {
      console.error("Failed to fetch user subscription:", error);
      setSubscriptionPlan("N/A");
    }
  };

  // Fetch all allergies and diseases for dropdowns
  const fetchAllAllergiesAndDiseases = async () => {
    try {
      const [allergiesResponse, diseasesResponse] = await Promise.all([
        viewAllAllergies(token),
        viewAllDiseases(token),
      ]);

      if (allergiesResponse.data?.data) {
        setAllAllergies(allergiesResponse.data.data);
      }
      if (diseasesResponse.data?.data) {
        setAllDiseases(diseasesResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch allergies and diseases:", error);
    }
  };

  // Fetch user's allergies and diseases
  const fetchAllergiesAndDiseases = async (userId) => {
    try {
      const response = await getAllergiesAndDiseasesByUserId(userId);
      if (response.error === 0 && response.data) {
        setAllergiesAndDiseases({
          diseases: response.data.diseases || [],
          allergies: response.data.allergies || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch allergies and diseases:", error);
      setStatus({
        message: "Failed to load medical information",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          if (response.data?.data) {
            const user = response.data.data;
            setCurrentUser(user);
            setUserData({
              userName: user.userName || "",
              phoneNumber: user.phoneNumber || "",
              dateOfBirth: user.dateOfBirth?.split("T")[0] || "",
            });
            if (user.id) {
              await fetchUserSubscription(user.id);
              await fetchAllergiesAndDiseases(user.id);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setStatus({ message: "Failed to load user data", type: "error" });
        }
      }
    };
    fetchUser();
    fetchAllAllergiesAndDiseases();
  }, [token]);

  // Get allergy or disease name by ID
  const getAllergyName = (allergyId) => {
    const allergy = allAllergies.find((a) => a.id === allergyId);
    return allergy?.name || allergyId;
  };

  const getDiseaseName = (diseaseId) => {
    const disease = allDiseases.find((d) => d.id === diseaseId);
    return disease?.name || diseaseId;
  };

  // Existing handlers...
  const handleEditToggle = () => {
    setEditMode(!editMode);
    setPasswordMode(false);
    setStatus({ message: "", type: "" });
  };

  const handlePasswordToggle = () => {
    setPasswordMode(!passwordMode);
    setEditMode(false);
    setStatus({ message: "", type: "" });
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowPasswords({
      oldPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentUser((prev) => ({
          ...prev,
          avatar: {
            ...prev.avatar,
            fileUrl: event.target.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      if (avatarFile && currentUser?.id) {
        const response = await uploadAvatar(currentUser.id, avatarFile, token);
        if (response.data?.error === 0) {
          setStatus({
            message: "Avatar uploaded successfully!",
            type: "success",
          });
          const userResponse = await getCurrentUser(token);
          if (userResponse.data?.data) {
            setCurrentUser(userResponse.data.data);
            setAvatarFile(null);
          }
        } else {
          setStatus({
            message: response.data?.message || "Failed to upload avatar",
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setStatus({
        message: error.response?.data?.message || "Failed to upload avatar",
        type: "error",
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser?.id) {
        throw new Error("Current user ID not available");
      }

      const formattedDate = userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toISOString()
        : currentUser.dateOfBirth;

      const response = await editUserProfile(
        {
          Id: currentUser.id,
          UserName: userData.userName,
          PhoneNumber: userData.phoneNumber,
          DateOfBirth: formattedDate,
        },
        token
      );

      if (response.data?.error === 0) {
        setStatus({
          message: "Profile updated successfully!",
          type: "success",
        });
        const userResponse = await getCurrentUser(token);
        if (userResponse.data?.data) {
          setCurrentUser(userResponse.data.data);
          setUserData({
            userName: userResponse.data.data.userName || "",
            phoneNumber: userResponse.data.data.phoneNumber || "",
            dateOfBirth:
              userResponse.data.data.dateOfBirth?.split("T")[0] || "",
          });
        }
        setEditMode(false);
      } else {
        throw new Error(response.data?.message || "Update failed");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setStatus({
        message: `Update failed: ${
          error.response?.data?.message || error.message
        }`,
        type: "error",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setStatus({ message: "New passwords do not match", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("OldPassword", passwordData.oldPassword);
      formData.append("NewPassword", passwordData.newPassword);

      const response = await apiClient.post(
        "/api/auth/user/password/change",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.error === 0) {
        setStatus({
          message: "Password changed successfully! Please log in again.",
          type: "success",
        });
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
        setPasswordMode(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setShowPasswords({
          oldPassword: false,
          newPassword: false,
          confirmNewPassword: false,
        });
      } else {
        setStatus({
          message: response.data?.message || "Password change failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Password change failed:", error);
      setStatus({
        message: `Password change failed: ${
          error.response?.data?.message || error.message
        }`,
        type: "error",
      });
    }
  };

  // New handlers for medical information
  const handleMedicalToggle = () => {
    setShowMedicalInfo(!showMedicalInfo);
    setEditMode(false);
    setPasswordMode(false);
  };

  const openModal = (type, mode, data = null) => {
    setModalType(type);
    setModalMode(mode);
    setShowModal(true);

    if (mode === "add") {
      if (type === "disease") {
        setNewMedicalData({
          diseaseId: "",
          diagnosedAt: "",
          isBeforePregnancy: false,
          expectedCuredAt: "",
          actualCuredAt: "",
          diseaseType: 0,
          isCured: false,
        });
      } else {
        setNewMedicalData({
          allergyId: "",
          severity: "",
          notes: "",
          diagnosedAt: "",
          isActive: true,
        });
      }
    } else if (mode === "edit" && data) {
      setNewMedicalData(data);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setModalMode("");
    setNewMedicalData({});
  };

  const handleMedicalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedicalData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveMedical = async () => {
    try {
      if (!currentUser?.id) return;

      let response;
      if (modalMode === "add" && modalType === "disease") {
        response = await addDiseaseToUser(currentUser.id, newMedicalData);
      } else if (modalMode === "add" && modalType === "allergy") {
        response = await addAllergyToUser(currentUser.id, newMedicalData);
      } else if (modalMode === "edit" && modalType === "disease") {
        response = await updateDiseaseToUser(currentUser.id, newMedicalData);
      } else if (modalMode === "edit" && modalType === "allergy") {
        response = await updateAllergyToUser(currentUser.id, newMedicalData);
      }

      if (response && response.error === 0) {
        setStatus({
          message: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} ${
            modalMode === "add" ? "added" : "updated"
          } successfully!`,
          type: "success",
        });
        await fetchAllergiesAndDiseases(currentUser.id);
        closeModal();
      } else {
        setStatus({
          message: response?.message || "Operation failed",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving medical information:", error);
      setStatus({
        message: "Failed to save medical information",
        type: "error",
      });
    }
  };

  const handleDeleteMedical = async (type, id) => {
    try {
      if (!currentUser?.id) return;

      if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
        let response;
        if (type === "disease") {
          response = await removeDiseaseFromUser(currentUser.id, id);
        } else {
          response = await removeAllergyFromUser(currentUser.id, id);
        }

        if (response.error === 0) {
          setStatus({
            message: `${
              type.charAt(0).toUpperCase() + type.slice(1)
            } removed successfully!`,
            type: "success",
          });
          await fetchAllergiesAndDiseases(currentUser.id);
        } else {
          setStatus({ message: response.message, type: "error" });
        }
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setStatus({
        message: `Failed to delete ${type}`,
        type: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="profile-page">
      <section className="profile-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="profile-container"
        >
          {/* Header */}
          <div className="profile-header">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.button>
            <h1 className="section-title">My Profile</h1>
          </div>

          {/* Status Alert */}
          {status.message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={`status-alert ${status.type}`}>
                {status.message}
              </div>
            </motion.div>
          )}

          {/* Profile Card */}
          <div className="profile-card">
            {/* Avatar Section */}
            <div className="profile-avatar-section">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="avatar-container"
              >
                <img
                  src={currentUser?.avatar?.fileUrl || "/images/Avatar.jpg"}
                  alt="User Avatar"
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = "/images/Avatar.jpg";
                  }}
                />
                <label className="avatar-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="avatar-upload-input"
                  />
                  <span className="avatar-upload-text">Change Photo</span>
                </label>
                {avatarFile && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarUpload}
                    className="avatar-upload-button"
                  >
                    Save Photo
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Details Section */}
            <div className="profile-details-section">
              {!editMode && !passwordMode && !showMedicalInfo ? (
                <div>
                  <div className="profile-detail">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {currentUser?.email || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Username</span>
                    <span className="detail-value">
                      {currentUser?.userName || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Phone Number</span>
                    <span className="detail-value">
                      {currentUser?.phoneNumber || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">
                      {formatDate(currentUser?.dateOfBirth)}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">
                      Current Subscription Plan
                    </span>
                    <span className="detail-value">{subscriptionPlan}</span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      {currentUser?.status || "Not set"}
                      {currentUser?.isVerified && (
                        <span className="verified-badge"> ✓ Verified</span>
                      )}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditToggle}
                    className="profile-button"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePasswordToggle}
                    className="profile-button secondary"
                  >
                    Change Password
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMedicalToggle}
                    className="profile-button secondary"
                  >
                    View Medical Information
                  </motion.button>
                </div>
              ) : editMode ? (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleProfileSubmit}
                  className="profile-form"
                >
                  <div className="form-group">
                    <label htmlFor="userName">Username</label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={userData.userName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={userData.phoneNumber}
                      onChange={handleInputChange}
                      pattern="[0-9]{10,15}"
                      title="Please enter a valid phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={userData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="form-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="profile-button"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleEditToggle}
                      className="profile-button secondary"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              ) : passwordMode ? (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handlePasswordSubmit}
                  className="profile-form"
                >
                  <div className="form-group">
                    <label htmlFor="oldPassword">Old Password</label>
                    <div className="password-input-container">
                      <input
                        type={showPasswords.oldPassword ? "text" : "password"}
                        id="oldPassword"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="password-input"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => toggleShowPassword("oldPassword")}
                      >
                        {showPasswords.oldPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input-container">
                      <input
                        type={showPasswords.newPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="password-input"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => toggleShowPassword("newPassword")}
                      >
                        {showPasswords.newPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">
                      Confirm New Password
                    </label>
                    <div className="password-input-container">
                      <input
                        type={
                          showPasswords.confirmNewPassword ? "text" : "password"
                        }
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        required
                        className="password-input"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => toggleShowPassword("confirmNewPassword")}
                      >
                        {showPasswords.confirmNewPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                  <div className="form-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="profile-button"
                    >
                      Change Password
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handlePasswordToggle}
                      className="profile-button secondary"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                // Medical Information Section
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: "1.5rem", color: "#1e3a5f" , fontSize: "2rem"}}>
                    Medical Information
                  </h2>

                  {/* Diseases Section */}
                  <div style={{ marginBottom: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h3 style={{ color: "#2e6da4" }}>Diseases</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal("disease", "add")}
                        className="profile-button"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                          width: "200px",
                        }}
                      >
                        + Add Disease
                      </motion.button>
                    </div>

                    {allergiesAndDiseases.diseases.length > 0 ? (
                      allergiesAndDiseases.diseases.map((disease, index) => (
                        <div key={index} className="profile-detail">
                          <div style={{ flex: 1 }}>
                            <div>
                              <strong>Disease:</strong>{" "}
                              {getDiseaseName(disease.diseaseId)}
                            </div>
                            <div>
                              <strong>Diagnosed:</strong>{" "}
                              {formatDate(disease.diagnosedAt)}
                            </div>
                            <div>
                              <strong>Before Pregnancy:</strong>{" "}
                              {disease.isBeforePregnancy ? "Yes" : "No"}
                            </div>
                            <div>
                              <strong>Type:</strong>{" "}
                              {disease.diseaseType === 0
                                ? "Temporary"
                                : "Chronic"}
                            </div>
                            <div>
                              <strong>Cured:</strong>{" "}
                              {disease.isCured ? "Yes" : "No"}
                            </div>
                            {disease.expectedCuredAt && (
                              <div>
                                <strong>Expected Cure:</strong>{" "}
                                {formatDate(disease.expectedCuredAt)}
                              </div>
                            )}
                            {disease.actualCuredAt && (
                              <div>
                                <strong>Actual Cure:</strong>{" "}
                                {formatDate(disease.actualCuredAt)}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() =>
                                openModal("disease", "edit", disease)
                              }
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#2e6da4",
                                height: "60px",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMedical(
                                  "disease",
                                  disease.diseaseId
                                )
                              }
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#e74c3c",
                                height: "60px",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#64748b" }}>No diseases recorded</p>
                    )}
                  </div>

                  {/* Allergies Section */}
                  <div style={{ marginBottom: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h3 style={{ color: "#2e6da4" }}>Allergies</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal("allergy", "add")}
                        className="profile-button"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                          width: "200px",
                        }}
                      >
                        + Add Allergy
                      </motion.button>
                    </div>

                    {allergiesAndDiseases.allergies.length > 0 ? (
                      allergiesAndDiseases.allergies.map((allergy, index) => (
                        <div key={index} className="profile-detail">
                          <div style={{ flex: 1 }}>
                            <div>
                              <strong>Allergy:</strong>{" "}
                              {getAllergyName(allergy.allergyId)}
                            </div>
                            <div>
                              <strong>Severity:</strong> {allergy.severity}
                            </div>
                            <div>
                              <strong>Diagnosed:</strong>{" "}
                              {formatDate(allergy.diagnosedAt)}
                            </div>
                            <div>
                              <strong>Active:</strong>{" "}
                              {allergy.isActive ? "Yes" : "No"}
                            </div>
                            {allergy.notes && (
                              <div>
                                <strong>Notes:</strong> {allergy.notes}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() =>
                                openModal("allergy", "edit", allergy)
                              }
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#2e6da4",
                                color: "white",
                                height: "60px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteMedical(
                                  "allergy",
                                  allergy.allergyId
                                )
                              }
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#e74c3c",
                                color: "white",
                                height: "60px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#64748b" }}>No allergies recorded</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMedicalToggle}
                    className="profile-button secondary"
                    style={{ marginTop: "2rem" }}
                  >
                    Back to Profile
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
              >
                <h2 style={{ marginBottom: "1.5rem", color: "#1e3a5f" }}>
                  {modalMode === "add" ? "Add" : "Edit"}{" "}
                  {modalType === "disease" ? "Disease" : "Allergy"}
                </h2>

                <div className="profile-form">
                  {modalType === "disease" ? (
                    <>
                      <div className="form-group">
                        <label>
                          Select Disease
                          <span className="must-enter-info">* (Required)</span>
                        </label>
                        <select
                          name="diseaseId"
                          value={newMedicalData.diseaseId || ""}
                          onChange={handleMedicalInputChange}
                          disabled={modalMode === "edit"}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0f2f7",
                            fontSize: "1rem",
                          }}
                        >
                          <option value="">Select a disease</option>
                          {allDiseases.map((disease) => (
                            <option key={disease.id} value={disease.id}>
                              {disease.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Diagnosed Date (Optional)</label>
                        <input
                          type="date"
                          name="diagnosedAt"
                          value={
                            newMedicalData.diagnosedAt?.split("T")[0] ||
                            newMedicalData.diagnosedAt ||
                            ""
                          }
                          onChange={handleMedicalInputChange}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          Before Pregnancy (Optional)
                          <input
                            type="checkbox"
                            name="isBeforePregnancy"
                            checked={newMedicalData.isBeforePregnancy || false}
                            onChange={handleMedicalInputChange}
                            style={{ marginRight: "0.5rem", width: "40px" }}
                          />
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Disease Type <span className="must-enter-info">* (Required)</span></label>
                        <select
                          name="diseaseType"
                          value={newMedicalData.diseaseType || 0}
                          onChange={handleMedicalInputChange}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0f2f7",
                          }}
                        >
                          <option value={2}>Temporary</option>
                          <option value={1}>Chronic</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Expected Cure Date (Optional)</label>
                        <input
                          type="date"
                          name="expectedCuredAt"
                          value={
                            newMedicalData.expectedCuredAt?.split("T")[0] ||
                            newMedicalData.expectedCuredAt ||
                            ""
                          }
                          onChange={handleMedicalInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Actual Cure Date (Optional)</label>
                        <input
                          type="date"
                          name="actualCuredAt"
                          value={
                            newMedicalData.actualCuredAt?.split("T")[0] ||
                            newMedicalData.actualCuredAt ||
                            ""
                          }
                          onChange={handleMedicalInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          Cured
                          <input
                            type="checkbox"
                            name="isCured"
                            checked={newMedicalData.isCured || false}
                            onChange={handleMedicalInputChange}
                            style={{ marginRight: "0.5rem", width: "40px" }}
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>
                          Select Allergy
                          <span className="must-enter-info">* (Required)</span>
                        </label>
                        <select
                          name="allergyId"
                          value={newMedicalData.allergyId || ""}
                          onChange={handleMedicalInputChange}
                          disabled={modalMode === "edit"}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0f2f7",
                            fontSize: "1rem",
                          }}
                        >
                          <option value="">Select an allergy</option>
                          {allAllergies.map((allergy) => (
                            <option key={allergy.id} value={allergy.id}>
                              {allergy.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>
                          Severity
                          <span className="must-enter-info">* (Required)</span>
                        </label>
                        <select
                          name="severity"
                          value={newMedicalData.severity || ""}
                          onChange={handleMedicalInputChange}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0f2f7",
                          }}
                        >
                          <option value="">Select severity</option>
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>
                          Diagnosed Date
                          <span className="must-enter-info">* (Required)</span>
                        </label>
                        <input
                          type="date"
                          name="diagnosedAt"
                          value={
                            newMedicalData.diagnosedAt?.split("T")[0] ||
                            newMedicalData.diagnosedAt ||
                            ""
                          }
                          onChange={handleMedicalInputChange}
                          max={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div className="form-group">
                        <label>Notes</label>
                        <textarea
                          name="notes"
                          placeholder="Optional - tell us more about the allergy"
                          value={newMedicalData.notes || ""}
                          onChange={handleMedicalInputChange}
                          rows="3"
                          style={{
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0f2f7",
                            fontSize: "1rem",
                            resize: "vertical",
                          }}
                        />
                      </div>
                      {/* <div className="form-group">
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          Active
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={newMedicalData.isActive || false}
                            onChange={handleMedicalInputChange}
                            style={{ marginRight: "0.5rem", width: "40px" }}
                          />
                        </label>
                      </div> */}
                    </>
                  )}

                  <div className="form-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveMedical}
                      className="profile-button"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="profile-button secondary"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default ProfilePage;
