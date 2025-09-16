import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClinicById } from "../../apis/clinic-api";
import { startChatThread } from "../../apis/message-api";
import MainLayout from "../../layouts/MainLayout";
import "../../styles/ClinicDetail.css";

// Helper to calculate average rating and convert to 5-star scale
function getStarRating(feedbacks) {
  if (!feedbacks || feedbacks.length === 0)
    return { avg: 0, stars: 0, count: 0 };
  const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  const avg10 = sum / feedbacks.length;
  const avg5 = avg10 / 2;
  return { avg: avg5, stars: avg5, count: feedbacks.length };
}

// Star rendering helper (with half star support)
const renderStars = (stars) => {
  const filled = Math.floor(stars);
  const half = stars - filled >= 0.25 && stars - filled < 0.75;
  return (
    <>
      {[...Array(5)].map((_, i) => {
        if (i < filled) {
          return (
            <span key={i} className="star">
              &#9733;
            </span>
          );
        } else if (i === filled && half) {
          return (
            <span key={i} className="star star-half" aria-label="half star">
              &#9733;
            </span>
          );
        } else {
          return (
            <span key={i} className="star star-empty">
              &#9733;
            </span>
          );
        }
      })}
    </>
  );
};

// Floating chat box like Messenger
const ChatBox = ({ consultant, onClose, userId, chatThread, onImageError, onImageLoad, imageErrors, imageLoading }) => (
  <div className="floating-chatbox-container">
    <div className="floating-chatbox-window">
      <div className="floating-chatbox-header">
        <div className="floating-chatbox-header-left">
          <div className="floating-chatbox-avatar-container">
            {imageLoading[`chat-${consultant.user.id}`] && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <img
              className={`floating-chatbox-avatar ${imageErrors[`chat-${consultant.user.id}`] ? 'placeholder-image' : ''}`}
              src={
                imageErrors[`chat-${consultant.user.id}`] || !consultant.user.avatar?.fileUrl
                  ? "/images/doctor-placeholder.png"
                  : consultant.user.avatar.fileUrl
              }
              alt={consultant.user.userName}
              onError={() => onImageError(`chat-${consultant.user.id}`)}
              onLoad={() => onImageLoad(`chat-${consultant.user.id}`)}
            />
            {(imageErrors[`chat-${consultant.user.id}`] || !consultant.user.avatar?.fileUrl) && (
              <div className="placeholder-overlay">
                <svg className="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="floating-chatbox-username">{consultant.user.userName}</div>
          </div>
        </div>
        <div className="floating-chatbox-header-actions">
          <button className="floating-chatbox-action-btn" title="Close" onClick={onClose}>
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12l-4.89 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z"/></svg>
          </button>
        </div>
      </div>
      <div className="floating-chatbox-body">
        <div className="floating-chatbox-loading">
          <div className="floating-chatbox-spinner"></div>
        </div>
      </div>
      <div className="floating-chatbox-footer">
        <button className="floating-chatbox-footer-btn" title="Image">
          <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zm-2 0H5V5h14zm-7-3l2.03 2.71a1 1 0 001.54 0L19 14.13V19H5v-2.87l3.47-4.6a1 1 0 011.54 0z"/></svg>
        </button>
        <input className="floating-chatbox-input" placeholder="Aa" />
        <button className="floating-chatbox-send-btn" title="Send">
          <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24">
            <path d="M2 21l21-9-21-9v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
);

// Show username, phone, email for both doctors and consultants
const DoctorCard = ({ user, onImageError, onImageLoad, imageErrors, imageLoading }) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      {imageLoading[`doctor-${user.id}`] && (
        <div className="image-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={
          imageErrors[`doctor-${user.id}`] || !user?.avatar?.fileUrl
            ? "/images/doctor-placeholder.png"
            : user.avatar.fileUrl
        }
        alt={user?.userName}
        className={imageErrors[`doctor-${user.id}`] ? 'placeholder-image' : ''}
        onError={() => onImageError(`doctor-${user.id}`)}
        onLoad={() => onImageLoad(`doctor-${user.id}`)}
      />
      {(imageErrors[`doctor-${user.id}`] || !user?.avatar?.fileUrl) && (
        <div className="placeholder-overlay">
          <svg className="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
    <div className="clinic-doctor-info">
      <div className="clinic-doctor-name">{user?.userName}</div>
      <div className="clinic-doctor-contact">
        <div>
          <strong>Phone:</strong> {user?.phone || user?.phoneNo}
        </div>
        <div>
          <strong>Email:</strong> {user?.email}
        </div>
      </div>
    </div>
  </div>
);

// ConsultantCard with only "Send Message" button
const ConsultantCard = ({ consultant, onSendMessage, chatLoading, onImageError, onImageLoad, imageErrors, imageLoading }) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      {imageLoading[`consultant-${consultant.user.id}`] && (
        <div className="image-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={
          imageErrors[`consultant-${consultant.user.id}`] || !consultant.user?.avatar?.fileUrl
            ? "/images/doctor-placeholder.png"
            : consultant.user.avatar.fileUrl
        }
        alt={consultant.user?.userName}
        className={imageErrors[`consultant-${consultant.user.id}`] ? 'placeholder-image' : ''}
        onError={() => onImageError(`consultant-${consultant.user.id}`)}
        onLoad={() => onImageLoad(`consultant-${consultant.user.id}`)}
      />
      {(imageErrors[`consultant-${consultant.user.id}`] || !consultant.user?.avatar?.fileUrl) && (
        <div className="placeholder-overlay">
          <svg className="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
    <div className="clinic-doctor-info">
      <div className="clinic-doctor-name">{consultant.user?.userName}</div>
      <div className="clinic-doctor-contact">
        <div>
          <strong>Phone:</strong> {consultant.user?.phone || consultant.user?.phoneNo}
        </div>
        <div>
          <strong>Email:</strong> {consultant.user?.email}
        </div>
      </div>
      <button
        className="consultant-send-message-btn"
        title="Send Message & Start Chat"
        onClick={() => onSendMessage(consultant)}
        type="button"
        style={{marginTop: 8}}
        disabled={chatLoading}
      >
        <svg width="18" height="18" fill="#1976d2" style={{marginRight: 4, verticalAlign: "middle"}} viewBox="0 0 24 24">
          <path d="M2 21l21-9-21-9v7l15 2-15 2z"/>
        </svg>
        {chatLoading ? "Starting..." : "Send Message"}
      </button>
    </div>
  </div>
);

const ClinicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image state management
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  // Pagination for doctors/consultants
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showAllConsultants, setShowAllConsultants] = useState(false);

  // Chat state
  const [chatConsultant, setChatConsultant] = useState(null);
  const [chatThread, setChatThread] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const userId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Replace with real user id

  // Image handling functions
  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoad = (imageId) => {
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId) => {
    setImageLoading(prev => ({ ...prev, [imageId]: true }));
  };

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await getClinicById(id);
        setClinic(data.data || data);
      } catch (err) {
        setError("Failed to fetch clinic details.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  // Handler for Send Message button
  const handleSendMessage = async (consultant) => {
    setChatLoading(true);
    try {
      const thread = await startChatThread({
        userId: userId,
        consultantId: consultant.user.id
      });
      setChatThread(thread);
      setChatConsultant(consultant);
    } catch (err) {
      alert("Failed to start chat thread.", err);
    }
    setChatLoading(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="main-content">
          <p className="loading-text">Loading clinic details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="main-content">
          <p className="error-text">{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!clinic) {
    return (
      <MainLayout>
        <div className="main-content">
          <p className="error-text">Clinic not found.</p>
        </div>
      </MainLayout>
    );
  }

  const { avg, count } = getStarRating(clinic.feedbacks);

  const doctorsToShow =
    clinic.doctors && !showAllDoctors
      ? clinic.doctors.slice(0, 9)
      : clinic.doctors;

  const consultantsToShow =
    clinic.consultants && !showAllConsultants
      ? clinic.consultants.slice(0, 9)
      : clinic.consultants;

  return (
    <div className="clinic-detail-background-container">
      <MainLayout>
        <button
          className="clinic-back-btn"
          onClick={() => navigate("/clinic/list")}
          type="button"
        >
          <svg width="20" height="20" fill="#1976d2" style={{marginRight: 6, verticalAlign: "middle"}} viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          Back
        </button>
        
        <div className="clinic-header-banner">
          <div className="clinic-header-logo">
            {imageLoading['clinic-main'] && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <img
              src={
                imageErrors['clinic-main'] || !clinic.imageUrl?.fileUrl
                  ? "/images/clinic-placeholder.png"
                  : clinic.imageUrl.fileUrl
              }
              alt={clinic.name}
              className={imageErrors['clinic-main'] ? 'placeholder-image' : ''}
              onError={() => handleImageError('clinic-main')}
              onLoad={() => handleImageLoad('clinic-main')}
              onLoadStart={() => handleImageLoadStart('clinic-main')}
            />
            {(imageErrors['clinic-main'] || !clinic.imageUrl?.fileUrl) && (
              <div className="placeholder-overlay">
                <svg className="placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-2 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="clinic-header-meta">
            <div className="clinic-header-title">{clinic.name}</div>
            <div className="clinic-header-address">
              <span className="clinic-header-location">
                <svg
                  width="18"
                  height="18"
                  fill="#757575"
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {clinic.address}
              </span>
            </div>
            <div className="clinic-header-contact-row">
              <span className="clinic-header-contact-item">
                <svg
                  width="18"
                  height="18"
                  fill="#757575"
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z" />
                </svg>
                {clinic.user.phoneNo}
              </span>
              <span className="clinic-header-contact-item">
                <svg
                  width="18"
                  height="18"
                  fill="#757575"
                  style={{ marginRight: 4, verticalAlign: "middle" }}
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z" />
                </svg>
                {clinic.user.email}
              </span>
            </div>
          </div>
        </div>

        <div className="clinic-main-content">
          <div className="clinic-main-left">
            <div className="clinic-section">
              <div className="clinic-section-title">About the Clinic</div>
              <div className="clinic-section-desc">{clinic.description}</div>
              <div className="clinic-section-info">
                <div>
                  <strong>Insurance Accepted:</strong>{" "}
                  {clinic.isInsuranceAccepted ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Specializations:</strong> {clinic.specializations}
                </div>
              </div>
            </div>

            <div className="clinic-section">
              <div className="clinic-section-title">Our Doctors</div>
              <div className="clinic-doctor-list">
                {doctorsToShow && doctorsToShow.length > 0 ? (
                  doctorsToShow.map((doctor) => (
                    <DoctorCard 
                      key={doctor.id} 
                      user={doctor.user} 
                      onImageError={handleImageError}
                      onImageLoad={handleImageLoad}
                      imageErrors={imageErrors}
                      imageLoading={imageLoading}
                    />
                  ))
                ) : (
                  <div className="clinic-doctor-card clinic-doctor-card-empty">
                    No doctors
                  </div>
                )}
              </div>
              {clinic.doctors &&
                clinic.doctors.length > 9 &&
                !showAllDoctors && (
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <button
                      className="clinic-see-more-btn"
                      onClick={() => setShowAllDoctors(true)}
                    >
                      See more
                    </button>
                  </div>
                )}
            </div>

            <div className="clinic-section">
              <div className="clinic-section-title">Our Consultants</div>
              <div className="clinic-doctor-list">
                {consultantsToShow && consultantsToShow.length > 0 ? (
                  consultantsToShow.map((consultant) => (
                    <ConsultantCard
                      key={consultant.id}
                      consultant={consultant}
                      onSendMessage={handleSendMessage}
                      chatLoading={chatLoading}
                      onImageError={handleImageError}
                      onImageLoad={handleImageLoad}
                      imageErrors={imageErrors}
                      imageLoading={imageLoading}
                    />
                  ))
                ) : (
                  <div className="clinic-doctor-card clinic-doctor-card-empty">
                    No consultants
                  </div>
                )}
              </div>
              {clinic.consultants &&
                clinic.consultants.length > 9 &&
                !showAllConsultants && (
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <button
                      className="clinic-see-more-btn"
                      onClick={() => setShowAllConsultants(true)}
                    >
                      See more
                    </button>
                  </div>
                )}
            </div>

            <div className="clinic-section">
              <div className="clinic-section-title">Feedback</div>
              <div className="clinic-feedback-rating">
                {renderStars(avg)}
                <span className="rating-value">{avg.toFixed(1)}</span>
                <span className="review-count">({count} reviews)</span>
              </div>
              <div className="clinic-feedback-list">
                {clinic.feedbacks && clinic.feedbacks.length > 0 ? (
                  clinic.feedbacks.map((feedback) => {
                    const stars = Math.round(feedback.rating / 2);
                    return (
                      <div className="clinic-feedback-card" key={feedback.id}>
                        <div className="feedback-stars">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < stars ? "" : "star-empty"}
                              style={{ color: i < stars ? "#f7b801" : "#ccc", fontSize: "1.2em", marginRight: "2px" }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <div style={{ color: "#1976d2", marginTop: 4 }}>
                          {feedback.comment}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>No feedback yet</div>
                )}
              </div>
            </div>
          </div>
          
          <aside className="clinic-main-right">
            <div className="clinic-booking-widget">
              <div className="clinic-booking-title">Book Appointment</div>
              <div className="clinic-booking-field">
                <label>Clinic</label>
                <input type="text" value={clinic.name} disabled />
              </div>
              <div className="clinic-booking-field">
                <label>Specialization</label>
                <input type="text" value={clinic.specializations} disabled />
              </div>
              <div className="clinic-booking-field">
                <label>Doctor</label>
                <input type="text" placeholder="Select doctor" disabled />
              </div>
              <button className="clinic-booking-btn" disabled>
                Book Now
              </button>
            </div>
          </aside>
        </div>
        
        {/* Floating ChatBox overlay */}
        {chatConsultant && (
          <ChatBox
            consultant={chatConsultant}
            userId={userId}
            chatThread={chatThread}
            onClose={() => {
              setChatConsultant(null);
              setChatThread(null);
            }}
            onImageError={handleImageError}
            onImageLoad={handleImageLoad}
            imageErrors={imageErrors}
            imageLoading={imageLoading}
          />
        )}
      </MainLayout>
    </div>
  );
};

export default ClinicDetail;
