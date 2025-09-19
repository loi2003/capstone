import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClinicById } from "../../apis/clinic-api";
import { createFeedback } from "../../apis/feedback-api";
import { getCurrentUser } from "../../apis/authentication-api";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi2";
import MainLayout from "../../layouts/MainLayout";
import ConsultationChat from "../../components/consultationchat/ConsultationChat";
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

const handleStartConsultation = (consultant) => {
  if (!currentUserId) {
    setShowLoginModal(true);
    return;
  }

  // Navigate to ConsultationChat with consultant data
  // The ConsultationChat component will handle checking for existing threads
  navigate("/consultation-chat", {
    state: {
      currentUserId,
      selectedConsultant: {
        ...consultant,
        clinic: {
          id: clinic.id,
          name: clinic.user?.userName || clinic.name,
          address: clinic.address,
        },
      },
    },
  });
};

// Star rendering helper (with half star support)
const renderStars = (stars) => {
  const filled = Math.floor(stars);

  return (
    <>
      {[...Array(5)].map((_, i) =>
        i < filled ? (
          <FaStar key={i} style={{ color: "#f7b801", marginRight: "2px" }} />
        ) : (
          <FaRegStar key={i} style={{ color: "#ccc", marginRight: "2px" }} />
        )
      )}
    </>
  );
};

// Show username, phone, email for both doctors and consultants
const DoctorCard = ({
  user,
  onImageError,
  onImageLoad,
  imageErrors,
  imageLoading,
}) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      {imageLoading[`doctor-${user.id}`] && (
        <div className="image-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={
          imageErrors[`doctor-${user.id}`]
            ? imageErrors[`doctor-${user.id}`]
            : user?.avatar?.fileUrl || "https://placehold.co/400"
        }
        alt={user?.userName}
        className={imageErrors[`doctor-${user.id}`] ? "placeholder-image" : ""}
        onError={() => onImageError(`doctor-${user.id}`)}
        onLoad={() => onImageLoad(`doctor-${user.id}`)}
      />
      {(imageErrors[`doctor-${user.id}`] || !user?.avatar?.fileUrl) && (
        <div className="placeholder-overlay">
          <svg
            className="placeholder-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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

// ConsultantCard with "Start Consultation" button
const ConsultantCard = ({
  consultant,
  onStartConsultation,
  currentUserId,
  onImageError,
  onImageLoad,
  imageErrors,
  imageLoading,
}) => (
  <div className="clinic-doctor-card">
    <div className="clinic-doctor-avatar">
      {imageLoading[`consultant-${consultant.user.id}`] && (
        <div className="image-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <img
        src={
          imageErrors[`consultant-${consultant.user.id}`] ||
          !consultant.user?.avatar?.fileUrl
            ? "https://placehold.co/400"
            : consultant.user.avatar.fileUrl
        }
        alt={consultant.user?.userName}
        className={
          imageErrors[`consultant-${consultant.user.id}`]
            ? "placeholder-image"
            : ""
        }
        onError={() => onImageError(`consultant-${consultant.user.id}`)}
        onLoad={() => onImageLoad(`consultant-${consultant.user.id}`)}
      />
      {(imageErrors[`consultant-${consultant.user.id}`] ||
        !consultant.user?.avatar?.fileUrl) && (
        <div className="placeholder-overlay">
          <svg
            className="placeholder-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}
    </div>
    <div className="clinic-doctor-info">
      <div className="clinic-doctor-name">{consultant.user?.userName}</div>
      <div className="clinic-doctor-contact">
        <div>
          <strong>Phone:</strong>{" "}
          {consultant.user?.phone || consultant.user?.phoneNo}
        </div>
        <div>
          <strong>Email:</strong> {consultant.user?.email}
        </div>
      </div>
      <button
        className="consultant-send-message-btn"
        title="Start Consultation"
        onClick={() => onStartConsultation(consultant)}
        disabled={!currentUserId}
        type="button"
        style={{ marginTop: 8 }}
      >
        <HiPaperAirplane />
        Start Consultation
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  // MOVE handleStartConsultation INSIDE the component
  const handleStartConsultation = (consultant) => {
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }

    // Navigate to ConsultationChat page with consultant data, but don't auto-start
    navigate("/consultation-chat", {
      state: {
        selectedConsultant: {
          ...consultant,
          clinic: {
            id: clinic.id,
            name: clinic.user?.userName || clinic.name,
            address: clinic.address,
          },
        },
        currentUserId: currentUserId,
        autoStart: false, // Changed from true to false
      },
    });
  };

  // Image handling functions
  const handleImageError = (imageId) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageId]: "https://placehold.co/400",
    }));
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoad = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: true }));
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserId("");
        return;
      }
      try {
        const userRes = await getCurrentUser(token);
        // Try multiple possible response structures
        const userId =
          userRes?.data?.data?.id || userRes?.data?.id || userRes?.id || "";
        console.log("Extracted userId:", userId);
        setCurrentUserId(userId);
      } catch (err) {
        console.error("Failed to get user:", err);
        setCurrentUserId("");
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUserId("");
        return;
      }
      try {
        const userRes = await getCurrentUser(token);
        // Add console.log to debug the response structure
        console.log("User response:", userRes);

        // Try multiple possible response structures
        const userId =
          userRes?.data?.data?.id || userRes?.data?.id || userRes?.id || "";

        console.log("Extracted userId:", userId);
        setCurrentUserId(userId);
      } catch (err) {
        console.error("Failed to get user:", err);
        setCurrentUserId("");
      }
    };
    fetchCurrentUser();
  }, []);

  // // Handler to open chat window
  // const handleOpenChatWindow = () => {
  //   if (!currentUserId) {
  //     setShowLoginModal(true);
  //     return;
  //   }
  //   setShowChatWindow(true);
  // };

  const handleOpenFeedbackModal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    try {
      const userRes = await getCurrentUser(token);
      const userId = userRes?.data?.data?.id || userRes?.data?.id || "";
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
            {imageLoading["clinic-main"] && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            <img
              src={
                imageErrors["clinic-main"]
                  ? imageErrors["clinic-main"]
                  : clinic.imageUrl?.fileUrl || "https://placehold.co/400"
              }
              alt={clinic.name}
              onError={() => handleImageError("clinic-main")}
              onLoad={() => handleImageLoad("clinic-main")}
            />
            {(imageErrors["clinic-main"] || !clinic.imageUrl?.fileUrl) && (
              <div className="placeholder-overlay">
                <svg
                  className="placeholder-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-2 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
            )}
          </div>

          <div className="clinic-header-meta">
            <div className="clinic-header-title">{clinic?.user?.userName}</div>
            <div className="clinic-header-address">
              <span className="clinic-header-location">
                <FaMapMarkerAlt className="detail-icon" />
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
                  <strong>Specializations:</strong>{" "}
                  <div className="clinic-specializations">
                    {clinic.specializations
                      ? clinic.specializations
                          .split(";")
                          .filter((s) => s.trim() !== "")
                          .map((spec, idx) => (
                            <span key={idx} className="specialization-badge">
                              {spec.trim()}
                            </span>
                          ))
                      : "General Practice"}
                  </div>
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
                      onStartConsultation={handleStartConsultation} // Updated handler
                      currentUserId={currentUserId}
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
                          {[...Array(5)].map((_, i) =>
                            i < stars ? (
                              <FaStar
                                key={i}
                                style={{
                                  color: "#f7b801",
                                  fontSize: "1.2em",
                                  marginRight: "2px",
                                }}
                              />
                            ) : (
                              <FaRegStar
                                key={i}
                                style={{
                                  color: "#ccc",
                                  fontSize: "1.2em",
                                  marginRight: "2px",
                                }}
                              />
                            )
                          )}
                        </div>
                        <div style={{ color: "#848785", marginTop: 4 }}>
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

            {/* Feedback Modal - Removed duplicate */}
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
                            style={{
                              cursor: "pointer",
                              marginRight: "6px",
                              fontSize: "2em",
                            }}
                            onClick={() => setFeedbackRating(star)}
                            aria-label={`Rate ${star}`}
                          >
                            {feedbackRating >= star ? (
                              <FaStar color="#f7b801" />
                            ) : (
                              <FaRegStar color="#ccc" />
                            )}
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

        {/* ConsultationChat Integration */}
        {/* {showChatWindow && (
          <ConsultationChat
            userId={currentUserId}
            consultants={clinic.consultants || []}
            onClose={() => setShowChatWindow(false)}
            onImageError={handleImageError}
            onImageLoad={handleImageLoad}
            imageErrors={imageErrors}
            imageLoading={imageLoading}
          />
        )} */}

        {/* Login Modal Placeholder - You can implement this based on your needs */}
        {showLoginModal && (
          <div className="modal-overlay">
            <div className="login-modal">
              <p>Please log in to start a consultation</p>
              <button onClick={() => setShowLoginModal(false)}>Close</button>
            </div>
          </div>
        )}
      </MainLayout>
    </div>
  );
};

export default ClinicDetail;
