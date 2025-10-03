import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiClient from "../apis/url-api";
import {
  getCurrentUser,
  uploadAvatar,
  editUserProfile,
} from "../apis/authentication-api";
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

  const fetchUserSubscription = async (userId) => {
    try {
      const response = await apiClient.get(
        `/api/user-subscription/view-user-subscription-by-user-id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Define plan tier priority (same as other components)
        const planTierPriority = {
          Free: 1,
          free: 1,
          Plus: 2,
          plus: 2,
          Pro: 3,
          pro: 3,
        };

        // Filter active subscriptions (status = 1 or status = "Active")
        const activeSubscriptions = response.data.filter(
          (sub) => sub.status === 1 || sub.status === "Active"
        );

        if (activeSubscriptions.length > 0) {
          // Sort by tier priority (highest tier first)
          const sortedByTier = activeSubscriptions.sort((a, b) => {
            const planNameA = a.subscriptionPlan?.subscriptionName || "";
            const planNameB = b.subscriptionPlan?.subscriptionName || "";

            const tierA = planTierPriority[planNameA] || 0;
            const tierB = planTierPriority[planNameB] || 0;

            return tierB - tierA; // Descending order (highest tier first)
          });

          // Get the highest tier subscription
          const highestTierSubscription = sortedByTier[0];
          const planName =
            highestTierSubscription.subscriptionPlan?.subscriptionName || "N/A";

          console.log("ProfilePage - Selected highest tier subscription:", {
            id: highestTierSubscription.id,
            planName: planName,
            tier: planTierPriority[planName],
          });

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

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
            }
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setStatus({ message: "Failed to load user data", type: "error" });
        }
      }
    };
    fetchUser();
  }, [token]);

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
          avatar: { ...prev.avatar, fileUrl: event.target.result },
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
            message: "Avatar uploaded successfully",
            type: "success",
          });
          const userResponse = await getCurrentUser(token);
          if (userResponse.data?.data) {
            setCurrentUser(userResponse.data.data);
          }
          setAvatarFile(null);
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
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data?.error === 0) {
        setStatus({
          message: "Password changed successfully! Please log in again.",
          type: "success",
        });
        // Optionally clear token and redirect to login
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
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
          {status.message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`status-alert ${status.type}`}
            >
              {status.message}
            </motion.div>
          )}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="avatar-container"
              >
                <img
                  src={currentUser?.avatar?.fileUrl || "/images/Avatar.jpg"}
                  alt="User Avatar"
                  className="avatar-image"
                  onError={(e) => (e.target.src = "/images/Avatar.jpg")}
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
            <div className="profile-details-section">
              {!editMode && !passwordMode ? (
                <>
                  <div className="profile-detail">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {currentUser?.email || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">
                      {currentUser?.userName || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Phone Number:</span>
                    <span className="detail-value">
                      {currentUser?.phoneNumber || "Not set"}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">Date of Birth:</span>
                    <span className="detail-value">
                      {formatDate(currentUser?.dateOfBirth)}
                    </span>
                  </div>
                  <div className="profile-detail">
                    <span className="detail-label">
                      Current Subscription Plan:
                    </span>
                    <span className="detail-value">{subscriptionPlan}</span>
                  </div>

                  <div className="profile-detail">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {currentUser?.status || "Not set"}
                      {currentUser?.isVerified && (
                        <span className="verified-badge"> (Verified)</span>
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
                </>
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
              ) : (
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
                        aria-label={
                          showPasswords.oldPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPasswords.oldPassword ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
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
                        aria-label={
                          showPasswords.newPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPasswords.newPassword ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
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
                        aria-label={
                          showPasswords.confirmNewPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPasswords.confirmNewPassword ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--primary-color)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
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
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProfilePage;
