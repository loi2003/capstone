import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClinicById } from "../../apis/clinic-api";
import { startChatThread } from "../../apis/message-api";
import { createFeedback } from "../../apis/feedback-api";
import { getCurrentUser } from "../../apis/authentication-api";
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
  const half = stars - filled >= 0.5;
  return (
    <>
      {[...Array(5)].map((_, i) => {
        if (i < filled) {
          return (
            <span key={i} className="star" style={{ color: "#f7b801" }}>
              &#9733;
            </span>
          );
        } else if (i === filled && half) {
          return (
            <span
              key={i}
              className="star star-half"
              style={{ color: "#f7b801" }}
              aria-label="half star"
            >
              &#9733;
            </span>
          );
        } else {
          return (
            <span key={i} className="star star-empty" style={{ color: "#ccc" }}>
              &#9733;
            </span>
          );
        }
      })}
    </>
  );
};

// Floating chat box like Messenger
const ChatBox = ({ consultant, onClose, userId, chatThread }) => (
  <div className="floating-chatbox-container">
    <div className="floating-chatbox-window">
      <div className="floating-chatbox-header">
        <div className="floating-chatbox-header-left">
          <img
            className="floating-chatbox-avatar"
            src={
              consultant.user.avatar && consultant.user.avatar.fileUrl
                ? consultant.user.avatar.fileUrl
                : "/images/doctor-placeholder.png"
            }
            alt={consultant.user.userName}
          />
          <div>
            <div className="floating-chatbox-username">
              {consultant.user.userName}
            </div>
          </div>
        </div>
        <div className="floating-chatbox-header-actions">
          <button
            className="floating-chatbox-action-btn"
            title="Close"
            onClick={onClose}
          >
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
              <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12l-4.89 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
            </svg>
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
          <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24">
            <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zm-2 0H5V5h14zm-7-3l2.03 2.71a1 1 0 001.54 0L19 14.13V19H5v-2.87l3.47-4.6a1 1 0 011.54 0z" />
          </svg>
        </button>
        <input className="floating-chatbox-input" placeholder="Aa" />
        <button className="floating-chatbox-send-btn" title="Send">
          <svg width="22" height="22" fill="#2196f3" viewBox="0 0 24 24">
            <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

// Show username, phone, email for both doctors and consultants
const DoctorCard = ({ user }) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      <img
        src={
          user && user.avatar && user.avatar.fileUrl
            ? user.avatar.fileUrl
            : "/images/doctor-placeholder.png"
        }
        alt={user && user.userName}
      />
    </div>
    <div className="clinic-doctor-info">
      <div className="clinic-doctor-name">{user && user.userName}</div>
      <div className="clinic-doctor-contact">
        <div>
          <strong>Phone:</strong> {user && (user.phone || user.phoneNo)}
        </div>
        <div>
          <strong>Email:</strong> {user && user.email}
        </div>
      </div>
    </div>
  </div>
);

// ConsultantCard with only "Send Message" button
const ConsultantCard = ({ consultant, onSendMessage, chatLoading }) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      <img
        src={
          consultant.user &&
          consultant.user.avatar &&
          consultant.user.avatar.fileUrl
            ? consultant.user.avatar.fileUrl
            : "/images/doctor-placeholder.png"
        }
        alt={consultant.user && consultant.user.userName}
      />
    </div>
    <div className="clinic-doctor-info">
      <div className="clinic-doctor-name">
        {consultant.user && consultant.user.userName}
      </div>
      <div className="clinic-doctor-contact">
        <div>
          <strong>Phone:</strong>{" "}
          {consultant.user &&
            (consultant.user.phone || consultant.user.phoneNo)}
        </div>
        <div>
          <strong>Email:</strong> {consultant.user && consultant.user.email}
        </div>
      </div>
      <button
        className="consultant-send-message-btn"
        title="Send Message & Start Chat"
        onClick={() => onSendMessage(consultant)}
        type="button"
        style={{ marginTop: 8 }}
        disabled={chatLoading}
      >
        <svg
          width="18"
          height="18"
          fill="#1976d2"
          style={{ marginRight: 4, verticalAlign: "middle" }}
          viewBox="0 0 24 24"
        >
          <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
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

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Pagination for doctors/consultants
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [showAllConsultants, setShowAllConsultants] = useState(false);

  // Chat state
  const [chatConsultant, setChatConsultant] = useState(null);
  const [chatThread, setChatThread] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [currentUserId, setCurrentUserId] = useState("");

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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserId("");
        return;
      }
      try {
        const userRes = await getCurrentUser(token);
        setCurrentUserId(userRes?.data?.id || userRes?.id || "");
      } catch (err) {
        setCurrentUserId("");
      }
    };
    fetchCurrentUser();
  }, []);

  // Handler for Send Message button
  const handleSendMessage = async (consultant) => {
    setChatLoading(true);
    try {
      const thread = await startChatThread({
        userId: userId,
        consultantId: consultant.user.id,
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

  const handleOpenFeedbackModal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    try {
      const userRes = await getCurrentUser(token);
      const userId = userRes?.data?.data.id || userRes?.data.id || "";
      if (!userId) {
        setShowLoginModal(true);
        return;
      }
      setCurrentUserId(userId);
      setShowFeedbackModal(true);
      setFeedbackRating(0);
      setFeedbackComment("");
      setFeedbackError("");
      setFeedbackSuccess("");
    } catch {
      setShowLoginModal(true);
    }
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackRating(0);
    setFeedbackComment("");
    setFeedbackError("");
    setFeedbackSuccess("");
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError("");
    setFeedbackSuccess("");
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      setFeedbackError("Please select a rating from 1 to 5.");
      setFeedbackLoading(false);
      return;
    }
    if (!currentUserId) {
      setFeedbackError("You must be logged in to submit feedback.");
      setFeedbackLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        clinicId: clinic.id,
        userId: currentUserId,
        rating: feedbackRating * 2,
        comment: feedbackComment,
      };
      await createFeedback(payload, token);
      setFeedbackSuccess("Feedback submitted successfully!");
      setTimeout(() => {
        setShowFeedbackModal(false);
        setFeedbackSuccess("");
      }, 1200);
    } catch (err) {
      setFeedbackError("Failed to submit feedback.");
    }
    setFeedbackLoading(false);
  };

  return (
    <div className="clinic-detail-background-container">
      <MainLayout>
        <button
          className="clinic-back-btn"
          onClick={() => navigate("/clinic/list")}
          type="button"
        >
          {/* Back arrow icon */}
          <svg
            width="20"
            height="20"
            fill="#1976d2"
            style={{ marginRight: 6, verticalAlign: "middle" }}
            viewBox="0 0 24 24"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Back
        </button>
        <div className="clinic-header-banner">
          <div className="clinic-header-logo">
            <img
              src={
                clinic.imageUrl && clinic.imageUrl.fileUrl
                  ? clinic.imageUrl.fileUrl
                  : "/images/clinic-placeholder.png"
              }
              alt={clinic.name}
            />
          </div>
          <div className="clinic-header-meta">
            <div className="clinic-header-title">{clinic.name}</div>
            <div className="clinic-header-address">
              <span className="clinic-header-location">
                {/* Location Icon */}
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
                {/* Phone Icon */}
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
                {/* Email Icon */}
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
                    <DoctorCard key={doctor.id} user={doctor.user} />
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
                              style={{
                                color: i < stars ? "#f7b801" : "#ccc",
                                fontSize: "1.2em",
                                marginRight: "2px",
                              }}
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
              <button
                className="clinic-detail-give-feedback-btn"
                onClick={handleOpenFeedbackModal}
              >
                Send Feedback
              </button>
            </div>
            {/* Feedback Modal */}
            {showFeedbackModal && (
              <div className="modal-overlay clinic-feedback-modal-overlay">
                <div className="clinic-feedback-modal">
                  <div className="clinic-feedback-modal-header">
                    <span>Send Feedback</span>
                    <span
                      className="close"
                      style={{ cursor: "pointer", fontSize: "1.5em" }}
                      onClick={handleCloseFeedbackModal}
                    >
                      &times;
                    </span>
                  </div>
                  <form
                    className="clinic-feedback-modal-body"
                    onSubmit={handleSubmitFeedback}
                  >
                    <div className="clinic-feedback-modal-group">
                      <label>Rating (1-5)</label>
                      <div className="clinic-feedback-modal-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${
                              feedbackRating >= star ? "selected" : ""
                            }`}
                            style={{
                              cursor: "pointer",
                              color:
                                feedbackRating >= star ? "#f7b801" : "#ccc",
                              fontSize: "2em",
                              marginRight: "4px",
                            }}
                            onClick={() => setFeedbackRating(star)}
                            aria-label={`Rate ${star}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="clinic-feedback-modal-rating-note">
                        Click to rate
                      </div>
                    </div>
                    <div className="clinic-feedback-modal-group">
                      <label>Comment</label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Write your feedback here..."
                        rows={4}
                        required
                      />
                    </div>
                    {feedbackError && (
                      <div className="clinic-feedback-modal-error">
                        {feedbackError}
                      </div>
                    )}
                    {feedbackSuccess && (
                      <div className="clinic-feedback-modal-success">
                        {feedbackSuccess}
                      </div>
                    )}
                    <div className="clinic-feedback-modal-actions">
                      <button
                        type="button"
                        className="clinic-detail-send-feedback-cancel-btn"
                        onClick={handleCloseFeedbackModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="clinic-detail-send-feedback-btn"
                        disabled={feedbackLoading}
                      >
                        {feedbackLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showLoginModal && (
              <div className="modal-overlay clinic-feedback-modal-overlay">
                <div className="clinic-feedback-modal">
                  <div className="clinic-feedback-modal-header">
                    <span>Login Required</span>
                    <span
                      className="close"
                      style={{ cursor: "pointer", fontSize: "1.5em" }}
                      onClick={() => setShowLoginModal(false)}
                    >
                      &times;
                    </span>
                  </div>
                  <div
                    className="clinic-feedback-modal-body"
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    <div style={{ marginBottom: "16px", fontSize: "1.1em" }}>
                      You need to log in to send feedback.
                    </div>
                    <button
                      className="clinic-detail-send-feedback-btn"
                      onClick={() => {
                        setShowLoginModal(false);
                        navigate("/signin");
                      }}
                    >
                      Go to Login
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            userId={currentUserId}
            chatThread={chatThread}
            onClose={() => {
              setChatConsultant(null);
              setChatThread(null);
            }}
          />
        )}
      </MainLayout>
    </div>
  );
};

export default ClinicDetail;
