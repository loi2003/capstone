import React, { useState, useEffect } from "react";
import { getCurrentUser, uploadAvatar, editUserProfile } from "../apis/authentication-api";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    userName: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          console.log('API Response:', response); // Debugging log
          
          if (response.data?.data) {
            const user = response.data.data;
            console.log('User Data:', user); // Debugging log
            
            setCurrentUser(user);
            setUserData({
              userName: user.userName || '',
              phoneNumber: user.phoneNumber || '',
              dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
            });
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setStatus({ message: 'Failed to load user data', type: 'error' });
        }
      }
    };
    fetchUser();
  }, [token]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setStatus({ message: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Preview the new avatar
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentUser(prev => ({
          ...prev,
          avatar: {
            ...prev.avatar,
            fileUrl: event.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (!currentUser?.id) {
      throw new Error("Current user ID not available");
    }

    // Format the date properly for the backend
    const formattedDate = userData.dateOfBirth 
      ? new Date(userData.dateOfBirth).toISOString()
      : currentUser.dateOfBirth;

    console.log('Sending update with:', {
      Id: currentUser.id,
      UserName: userData.userName,
      PhoneNumber: userData.phoneNumber,
      DateOfBirth: formattedDate
    });

    const response = await editUserProfile({
      Id: currentUser.id,
      UserName: userData.userName,
      PhoneNumber: userData.phoneNumber,
      DateOfBirth: formattedDate
    }, token);

    console.log('Update response:', response.data);

    if (response.data?.error === 0) {
      setStatus({ message: 'Profile updated successfully!', type: 'success' });
      // Refetch user data
      const userResponse = await getCurrentUser(token);
      if (userResponse.data?.data) {
        setCurrentUser(userResponse.data.data);
        setUserData({
          userName: userResponse.data.data.userName || '',
          phoneNumber: userResponse.data.data.phoneNumber || '',
          dateOfBirth: userResponse.data.data.dateOfBirth?.split('T')[0] || '',
        });
      }
      setEditMode(false);
    } else {
      throw new Error(response.data?.message || 'Update failed');
    }
  } catch (error) {
    console.error("Update failed:", error);
    setStatus({ 
      message: `Update failed: ${error.response?.data?.message || error.message}`,
      type: 'error' 
    });
  }
};
  const handleAvatarUpload = async () => {
    try {
      if (avatarFile && currentUser?.id) {
        const response = await uploadAvatar(currentUser.id, avatarFile, token);
        console.log('Avatar Upload Response:', response); // Debugging log
        
        if (response.data?.error === 0) {
          setStatus({ message: 'Avatar uploaded successfully', type: 'success' });
          // Refetch user data
          const userResponse = await getCurrentUser(token);
          if (userResponse.data?.data) {
            setCurrentUser(userResponse.data.data);
          }
          setAvatarFile(null);
        } else {
          setStatus({ message: response.data?.message || 'Failed to upload avatar', type: 'error' });
        }
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setStatus({ message: error.response?.data?.message || 'Failed to upload avatar', type: 'error' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {status.message && (
            <div className={`status-alert ${status.type}`}>
              {status.message}
            </div>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img
                src={currentUser?.avatar?.fileUrl || 'images/Avatar.jpg'}
                alt="User Avatar"
                className="avatar-image"
                onError={(e) => {
                  e.target.src = 'images/Avatar.jpg';
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
                <button
                  onClick={handleAvatarUpload}
                  className="avatar-upload-button"
                >
                  Save Photo
                </button>
              )}
            </div>
          </div>

          <div className="profile-details-section">
            {/* <div className="profile-detail">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{currentUser?.id || 'N/A'}</span>
            </div> */}

            <div className="profile-detail">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{currentUser?.email || 'Not set'}</span>
            </div>

            <div className="profile-detail">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                {currentUser?.status || 'Not set'}
                {currentUser?.isVerified && (
                  <span className="verified-badge"> (Verified)</span>
                )}
              </span>
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} className="profile-form">
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
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-detail">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{currentUser?.userName || 'Not set'}</span>
                </div>
                <div className="profile-detail">
                  <span className="detail-label">Phone Number:</span>
                  <span className="detail-value">{currentUser?.phoneNumber || 'Not set'}</span>
                </div>
                <div className="profile-detail">
                  <span className="detail-label">Date of Birth:</span>
                  <span className="detail-value">
                    {formatDate(currentUser?.dateOfBirth)}
                  </span>
                </div>
                <button onClick={handleEditToggle} className="edit-button">
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default ProfilePage;