import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllOnlineConsultationsByUserId } from "../../apis/online-consultation-api";
import "../../styles/OnlineConsultationDetail.css";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUserMd,
  FaUser,
  FaHospital,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaClipboardList,
  FaHeartbeat,
  FaLightbulb,
  FaPaperclip,
  FaBaby,
  FaAward
} from "react-icons/fa";

function formatDateTime(dt) {
  if (!dt) return "N/A";
  const date = new Date(dt);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// Helper function to check if file is an image
function isImageFile(fileName) {
  if (!fileName) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

const OnlineConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const response = await getAllOnlineConsultationsByUserId(userId, token);
        const consultations = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        const found = consultations.find((c) => c.id === id);
        setConsultation(found || null);
      } catch (error) {
        console.error("Error fetching online consultation detail:", error);
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
        <div>Online Consultation not found.</div>
      ) : (
        <>
          <div className="online-consultation-detail-header">
            {consultation.trimester && (
              <div className="online-consultation-detail-trimester-indicator">
                {consultation.trimester}
                {consultation.trimester === 1
                  ? "st"
                  : consultation.trimester === 2
                  ? "nd"
                  : "rd"}{" "}
                Trimester
              </div>
            )}
            <h1>Online Consultation Record</h1>
            <div className="online-consultation-detail-consultation-date">
              <FaCalendarAlt style={{ marginRight: "8px" }} />
              {formatDateTime(consultation.date)}
            </div>
          </div>

          <div className="online-consultation-detail-content">
            <button
              className="online-consultation-detail-back-btn"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft style={{ marginRight: "8px" }} />
              Back
            </button>

            {/* Pregnancy Information */}
            <div className="online-consultation-detail-pregnancy-info">
              <div className="online-consultation-detail-pregnancy-stat">
                <div className="number">{consultation.trimester}</div>
                <div className="label">Trimester</div>
              </div>
              <div className="online-consultation-detail-pregnancy-stat">
                <div className="number">{consultation.gestationalWeek}</div>
                <div className="label">Gestational Week</div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="online-consultation-detail-info-grid">
              {/* Consultant Information */}
              <div className="online-consultation-detail-info-card">
                <h2 className="online-consultation-detail-card-title">
                  <FaUserMd style={{ marginRight: "10px" }} />
                  Consultant Information
                </h2>
                <div className="online-consultation-detail-person-info">
                  {consultation?.consultant?.user?.avatar ? (
                    <img
                      src={consultation.consultant.user.avatar}
                      alt="Consultant Avatar"
                      className="online-consultation-detail-avatar-placeholder"
                    />
                  ) : (
                    <div className="online-consultation-detail-avatar-placeholder">
                      {(consultation?.consultant?.user?.userName || "C")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                  )}
                  <div>
                    <strong>{consultation?.consultant?.user?.userName}</strong>
                    <div>{consultation?.consultant?.specialization}</div>
                  </div>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Gender:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.consultant?.gender}
                  </span>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Certificate:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.consultant?.certificate}
                  </span>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Experience:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.consultant?.experienceYears} years
                  </span>
                </div>
                <div className="online-consultation-detail-experience-badge">
                  <FaAward style={{ marginRight: "5px" }} />
                  {consultation?.consultant?.experienceYears} Years Expert
                </div>
                <div className="online-consultation-detail-contact-info online-consultation-detail-email">
                  <FaEnvelope style={{ marginRight: "8px" }} />
                  {consultation?.consultant?.user?.email}
                </div>
                <div className="online-consultation-detail-contact-info online-consultation-detail-phone">
                  <FaPhone style={{ marginRight: "8px" }} />
                  {consultation?.consultant?.user?.phoneNo}
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Specializations:
                  </span>
                  <div className="online-consultation-detail-specialization-list">
                    {consultation?.consultant?.specialization
                      ? consultation.consultant.specialization
                          .split("/")
                          .map((spec, idx) => <div key={idx}>• {spec.trim()}</div>)
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="online-consultation-detail-info-card">
                <h2 className="online-consultation-detail-card-title">
                  <FaUser style={{ marginRight: "10px" }} />
                  Patient Information
                </h2>
                <div className="online-consultation-detail-person-info">
                  {consultation?.user?.avatar ? (
                    <img
                      src={consultation.user.avatar}
                      alt="Patient Avatar"
                      className="online-consultation-detail-avatar-placeholder"
                    />
                  ) : (
                    <div className="online-consultation-detail-avatar-placeholder">
                      {(consultation?.user?.userName || "P").charAt(0)}
                    </div>
                  )}
                  <div>
                    <strong>{consultation?.user?.userName}</strong>
                    <div>Patient</div>
                  </div>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Email:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.user?.email}
                  </span>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Phone:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.user?.phoneNo}
                  </span>
                </div>
                <div className="online-consultation-detail-info-item">
                  {/* <span className="online-consultation-detail-info-label">
                    Status:
                  </span>
                  <span className="online-consultation-detail-info-value online-consultation-detail-status-active">
                    {consultation?.user?.status}
                  </span> */}
                </div>
              </div>

              {/* Hospital Information */}
              <div className="online-consultation-detail-info-card">
                <h2 className="online-consultation-detail-card-title">
                  <FaHospital style={{ marginRight: "10px" }} />
                  Hospital Information
                </h2>
                <div>
                  <strong>{consultation?.consultant?.clinic?.user?.userName}</strong>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Address:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.consultant?.clinic?.address}
                  </span>
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Insurance:
                  </span>
                  <span className="online-consultation-detail-info-value">
                    {consultation?.consultant?.clinic?.isInsuranceAccepted
                      ? "Accepted"
                      : "Not Accepted"}
                  </span>
                </div>
                <div className="online-consultation-detail-contact-info online-consultation-detail-email">
                  <FaEnvelope style={{ marginRight: "8px" }} />
                  {consultation?.consultant?.clinic?.user?.email}
                </div>
                <div className="online-consultation-detail-contact-info online-consultation-detail-phone">
                  <FaPhone style={{ marginRight: "8px" }} />
                  {consultation?.consultant?.clinic?.user?.phoneNo}
                </div>
                <div className="online-consultation-detail-hospital-description">
                  <strong>About the Hospital: </strong>
                  {consultation?.consultant?.clinic?.description}
                </div>
                <div className="online-consultation-detail-info-item">
                  <span className="online-consultation-detail-info-label">
                    Hospital Specializations:
                  </span>
                  <div className="online-consultation-detail-specialization-list">
                    {consultation?.consultant?.clinic?.specializations
                      ? consultation.consultant.clinic.specializations
                          .split(";")
                          .map((spec, idx) => <div key={idx}>• {spec.trim()}</div>)
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Sections */}
            <div className="online-consultation-detail-medical-section">
              <h3>
                <FaClipboardList style={{ marginRight: "8px" }} />
                Consultation Summary
              </h3>
              <div className="online-consultation-detail-medical-content">
                {consultation?.summary || "No summary provided."}
              </div>
            </div>

            <div className="online-consultation-detail-medical-section">
              <h3>
                <FaNotesMedical style={{ marginRight: "8px" }} />
                Consultant Notes
              </h3>
              <div className="online-consultation-detail-medical-content">
                {consultation?.consultantNote || "No consultant note provided."}
              </div>
            </div>

            <div className="online-consultation-detail-medical-section">
              <h3>
                <FaUser style={{ marginRight: "8px" }} />
                Patient Notes
              </h3>
              <div className="online-consultation-detail-medical-content">
                {consultation?.userNote || "No patient note provided."}
              </div>
            </div>

            <div className="online-consultation-detail-medical-section">
              <h3>
                <FaHeartbeat style={{ marginRight: "8px" }} />
                Vital Signs
              </h3>
              <div className="online-consultation-detail-medical-content">
                {consultation?.vitalSigns || "No vital signs provided."}
              </div>
            </div>

            <div className="online-consultation-detail-medical-section">
              <h3>
                <FaLightbulb style={{ marginRight: "8px" }} />
                Recommendations
              </h3>
              <div className="online-consultation-detail-medical-content">
                {consultation?.recommendations || "No recommendations provided."}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="online-consultation-detail-attachment-section">
              <h3>
                <FaPaperclip style={{ marginRight: "8px" }} />
                Attachments
              </h3>
              {consultation.attachments && consultation.attachments.length > 0 ? (
                <div style={{ textAlign: "left", marginTop: "20px" }}>
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
                <div className="online-consultation-detail-no-attachments">
                  No attachments available for this consultation
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default OnlineConsultationDetail;
