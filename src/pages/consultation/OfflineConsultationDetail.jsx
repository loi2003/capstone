import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { viewOfflineConsultationById } from "../../apis/offline-consultation-api";
import MainLayout from "../../layouts/MainLayout";
import "../../styles/OfflineConsultationDetail.css";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaUserMd, 
  FaUser, 
  FaClinicMedical, 
  FaPhone, 
  FaEnvelope, 
  FaClock,
  FaNotesMedical,
  FaPaperclip
} from "react-icons/fa";

function formatDateTime(dt) {
  if (!dt) return "N/A";
  const date = new Date(dt);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatDuration(start, end) {
  if (!start || !end) return "";
  const ms = new Date(end) - new Date(start);
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms / (1000 * 60)) % 60);
  return `${h} hour${h !== 1 ? "s" : ""}${
    m > 0 ? ` ${m} minute${m !== 1 ? "s" : ""}` : ""
  }`;
}

// Helper function to check if file is an image
function isImageFile(fileName) {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

const OfflineConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await viewOfflineConsultationById(id, token);
        setConsultation(response?.data || response || null);
      } catch (error) {
        console.error("Error fetching consultation detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConsultation();
  }, [id]);

  return (
    <MainLayout>
      {loading ? (
        <div>Loading...</div>
      ) : !consultation ? (
        <div>Offline Consultation not found.</div>
      ) : (
        <>
          <div className="offline-consultation-detail-header">
            <h1>Offline Consultation Detail</h1>
            <div className="offline-consultation-detail-status-badge">
              Status: {consultation.status}
            </div>
          </div>

          <div className="offline-consultation-detail-content">
            <button
              className="offline-consultation-detail-back-btn"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft style={{ marginRight: "8px" }} />
              Back
            </button>

            <div className="offline-consultation-detail-consultation-period">
              <h3>
                <FaCalendarAlt style={{ marginRight: "8px" }} />
                Consultation Period
              </h3>
              <div className="offline-consultation-detail-info-item">
                <span className="offline-consultation-detail-info-label">
                  From:
                </span>
                <span className="offline-consultation-detail-info-value">
                  {formatDateTime(consultation.startDate)}
                </span>
              </div>
              <div className="offline-consultation-detail-info-item">
                <span className="offline-consultation-detail-info-label">
                  To:
                </span>
                <span className="offline-consultation-detail-info-value">
                  {formatDateTime(consultation.endDate)}
                </span>
              </div>
              <div className="offline-consultation-detail-info-item">
                <span className="offline-consultation-detail-info-label">
                  Type:
                </span>
                <span className="offline-consultation-detail-info-value">
                  {consultation.consultationType}
                </span>
              </div>
            </div>

            <div className="offline-consultation-detail-info-grid">
              <div className="offline-consultation-detail-info-card">
                <h2 className="offline-consultation-detail-card-title">
                  <FaUserMd style={{ marginRight: "10px" }} />
                  Doctor Information
                </h2>
                <div className="offline-consultation-detail-doctor-info">
                  {consultation?.doctor?.user?.avatar ? (
                    <img
                      src={consultation.doctor.user.avatar}
                      alt="Doctor Avatar"
                      className="offline-consultation-detail-avatar-placeholder"
                    />
                  ) : (
                    <div className="offline-consultation-detail-avatar-placeholder">
                      {consultation?.doctor?.user?.userName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <strong>{consultation?.doctor?.user?.userName}</strong>
                    <div>{consultation?.doctor?.workPosition}</div>
                  </div>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Gender:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.doctor?.gender}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Specialization:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.doctor?.specialization}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Certificate:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.doctor?.certificate}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Experience:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.doctor?.experienceYear} years
                  </span>
                </div>
                <div className="offline-consultation-detail-contact-info">
                  <FaPhone style={{ marginRight: "8px" }} />
                  {consultation?.doctor?.user?.phoneNo}
                </div>
                <div className="offline-consultation-detail-email-info">
                  <FaEnvelope style={{ marginRight: "8px" }} />
                  {consultation?.doctor?.user?.email}
                </div>
              </div>

              <div className="offline-consultation-detail-info-card">
                <h2 className="offline-consultation-detail-card-title">
                  <FaUser style={{ marginRight: "10px" }} />
                  Patient Information
                </h2>
                <div className="offline-consultation-detail-patient-info">
                  {consultation?.user?.avatar ? (
                    <img
                      src={consultation.user.avatar}
                      alt="Patient Avatar"
                      className="offline-consultation-detail-avatar-placeholder"
                    />
                  ) : (
                    <div className="offline-consultation-detail-avatar-placeholder">
                      {consultation?.user?.userName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <strong>{consultation?.user?.userName}</strong>
                    <div>Patient</div>
                  </div>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Email:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.user?.email}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    
                    Phone:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.user?.phoneNo}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  {/* <span className="offline-consultation-detail-info-label">
                    Status:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    ● {consultation?.user?.status}
                  </span> */}
                </div>
              </div>

              <div className="offline-consultation-detail-info-card">
                <h2 className="offline-consultation-detail-card-title">
                  <FaClinicMedical style={{ marginRight: "10px" }} />
                  Clinic Information
                </h2>
                <div>
                  <strong>{consultation?.clinic?.user?.userName}</strong>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Address:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.clinic?.address}
                  </span>
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Status:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.clinic?.user?.status}
                  </span>
                </div>
                <div className="offline-consultation-detail-contact-info">
                  <FaPhone style={{ marginRight: "8px" }} />
                  {consultation?.clinic?.user?.phoneNo}
                </div>
                <div className="offline-consultation-detail-email-info">
                  <FaEnvelope style={{ marginRight: "8px" }} />
                  {consultation?.clinic?.user?.email}
                </div>
                <div className="offline-consultation-detail-info-item">
                  <span className="offline-consultation-detail-info-label">
                    Specializations:
                  </span>
                  <span className="offline-consultation-detail-info-value">
                    {consultation?.clinic?.specializations
                      ? consultation.clinic.specializations
                          .split(";")
                          .map((spec, idx) => <div key={idx}>• {spec.trim()}</div>)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="offline-consultation-detail-schedules-section">
              <h2 className="offline-consultation-detail-schedules-title">
                <FaClock style={{ marginRight: "8px" }} />
                Scheduled Appointments
              </h2>
              {consultation.schedules && consultation.schedules.length > 0 ? (
                consultation.schedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="offline-consultation-detail-schedule-item"
                  >
                    <div className="offline-consultation-detail-schedule-time">
                      Session {idx + 1}
                    </div>
                    <div className="offline-consultation-detail-datetime">
                      Start: {formatDateTime(sch.slot.startTime)}
                    </div>
                    <div className="offline-consultation-detail-datetime">
                      End: {formatDateTime(sch.slot.endTime)}
                    </div>
                    <div className="offline-consultation-detail-datetime">
                      Duration:{" "}
                      {formatDuration(sch.slot.startTime, sch.slot.endTime)}
                    </div>
                  </div>
                ))
              ) : (
                <p>No scheduled appointments.</p>
              )}
            </div>

            <div className="offline-consultation-detail-health-note">
              <h3>
                <FaNotesMedical style={{ marginRight: "8px" }} />
                Health Note
              </h3>
              <p>{consultation?.healthNote || "No health note provided."}</p>
            </div>

            <div className="offline-consultation-detail-schedules-section">
              <h2 className="offline-consultation-detail-schedules-title">
                <FaPaperclip style={{ marginRight: "8px" }} />
                Attachments
              </h2>
              {consultation.attachments && consultation.attachments.length > 0 ? (
                <div>
                  {consultation.attachments.map((file, idx) => (
                    <div key={idx} style={{ marginBottom: "15px" }}>
                      {isImageFile(file.fileName) ? (
                        <div>
                          <p style={{ marginBottom: "8px", fontWeight: "500" }}>
                            {file.fileName || "Attachment"}
                          </p>
                          <img
                            src={file.fileUrl}
                            alt={file.fileName || "Attachment"}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "400px",
                              borderRadius: "8px",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </div>
                      ) : (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#1780a6",
                            textDecoration: "none",
                            fontWeight: "500",
                          }}
                        >
                          {file.fileName || "Attachment"}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No attachments.</p>
              )}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default OfflineConsultationDetail;
