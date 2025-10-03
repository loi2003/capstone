import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllOnlineConsultationsByUserId } from "../../apis/online-consultation-api";
import "../../styles/OnlineConsultationDetail.css";

function formatDateTime(dt) {
  if (!dt) return "N/A";
  const date = new Date(dt);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const OnlineConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
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
  }, [id, navigate]);

  return (
    <MainLayout>
      <div className="online-consultation-detail-container">
        {loading ? (
          <div className="consultation-detail-loading">Loading...</div>
        ) : !consultation ? (
          <div className="consultation-detail-error">
            Online Consultation not found.
          </div>
        ) : (
          <>
            <div className="online-consultation-detail-header">
              <div className="online-consultation-detail-trimester-indicator">
                {consultation.trimester
                  ? `${consultation.trimester}${
                      consultation.trimester === 1
                        ? "st"
                        : consultation.trimester === 2
                        ? "nd"
                        : "rd"
                    } Trimester`
                  : ""}
              </div>
              <h1>Online Consultation Record</h1>
              <div className="online-consultation-detail-consultation-date">
                📅 {formatDateTime(consultation.date)}
              </div>
            </div>

            <div className="online-consultation-detail-content">
              <button
                className="online-consultation-detail-back-btn"
                onClick={() => navigate(-1)}
              >
                &larr; Back
              </button>

              <div className="online-consultation-detail-pregnancy-info">
                <div className="online-consultation-detail-pregnancy-stat">
                  <div className="online-consultation-detail-number">
                    {consultation.trimester}
                  </div>
                  <div className="online-consultation-detail-label">
                    Trimester
                  </div>
                </div>
                <div className="online-consultation-detail-pregnancy-stat">
                  <div className="online-consultation-detail-number">
                    {consultation.gestationalWeek}
                  </div>
                  <div className="online-consultation-detail-label">
                    Gestational Week
                  </div>
                </div>
                {/* <div className="online-consultation-detail-pregnancy-stat">
                  <div className="online-consultation-detail-number">👶</div>
                  <div className="online-consultation-detail-label">
                    Early Pregnancy
                  </div>
                </div> */}
              </div>

              <div className="online-consultation-detail-info-grid">
                <div className="online-consultation-detail-info-card">
                  <h3 className="online-consultation-detail-card-title">
                    👩‍⚕️ Consultant Information
                  </h3>
                  <div className="online-consultation-detail-person-info">
                    <div className="online-consultation-detail-avatar-placeholder">
                      {consultation?.consultant?.user?.avatar ? (
                        <img
                          src={consultation.consultant.user.avatar}
                          alt="Consultant Avatar"
                          style={{ width: 48, height: 48, borderRadius: "50%" }}
                        />
                      ) : (
                        (consultation?.consultant?.user?.userName || "C")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.2em",
                          color: "#333",
                        }}
                      >
                        {consultation?.consultant?.user?.userName}
                      </div>
                      <div style={{ color: "#666", marginTop: "5px" }}>
                        {consultation?.consultant?.specialization}
                      </div>
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
                    🏆 {consultation?.consultant?.experienceYears} Years Expert
                  </div>
                  <div className="online-consultation-detail-contact-info email">
                    {consultation?.consultant?.user?.email}
                  </div>
                  <div className="online-consultation-detail-contact-info phone">
                    {consultation?.consultant?.user?.phoneNo}
                  </div>
                  <div style={{ marginTop: "15px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 8,
                        color: "#333",
                      }}
                    >
                      Specializations:
                    </div>
                    <div className="online-consultation-detail-specialization-list">
                      {consultation?.consultant?.specialization
                        ? consultation.consultant.specialization
                            .split("/")
                            .map((spec, idx) => (
                              <div key={idx} style={{ marginBottom: 4 }}>
                                • {spec.trim()}
                              </div>
                            ))
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="online-consultation-detail-info-card">
                  <h3 className="online-consultation-detail-card-title">
                    👤 Patient Information
                  </h3>
                  <div className="online-consultation-detail-person-info">
                    <div className="online-consultation-detail-avatar-placeholder">
                      {consultation?.user?.avatar ? (
                        <img
                          src={consultation.user.avatar}
                          alt="Patient Avatar"
                          style={{ width: 48, height: 48, borderRadius: "50%" }}
                        />
                      ) : (
                        (consultation?.user?.userName || "P").charAt(0)
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.2em",
                          color: "#333",
                        }}
                      >
                        {consultation?.user?.userName}
                      </div>
                      <div style={{ color: "#666", marginTop: "5px" }}>
                        Patient
                      </div>
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
                    <span className="online-consultation-detail-info-label">
                      Status:
                    </span>
                    <span className="online-consultation-detail-info-value status-active">
                      {consultation?.user?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="online-consultation-detail-info-card"
                style={{ marginBottom: "30px" }}
              >
                <h3 className="online-consultation-detail-card-title">
                  🏥 Hospital Information
                </h3>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#333",
                    fontSize: "1.2em",
                  }}
                >
                  {consultation?.consultant?.clinic?.user?.userName}
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
                  <span className="online-consultation-detail-info-value status-active">
                    {consultation?.consultant?.clinic?.isInsuranceAccepted
                      ? "Accepted"
                      : "Not Accepted"}
                  </span>
                </div>
                <div className="online-consultation-detail-contact-info email">
                  {consultation?.consultant?.clinic?.user?.email}
                </div>
                <div className="online-consultation-detail-contact-info phone">
                  {consultation?.consultant?.clinic?.user?.phoneNo}
                </div>
                <div className="online-consultation-detail-hospital-description">
                  <strong>About the Hospital:</strong>{" "}
                  {consultation?.consultant?.clinic?.description}
                </div>
                <div style={{ marginTop: "15px" }}>
                  <div
                    style={{ fontWeight: 600, marginBottom: 8, color: "#333" }}
                  >
                    Hospital Specializations:
                  </div>
                  <div className="online-consultation-detail-specialization-list">
                    {consultation?.consultant?.clinic?.specializations
                      ? consultation.consultant.clinic.specializations
                          .split(";")
                          .map((spec, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                              • {spec.trim()}
                            </div>
                          ))
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="online-consultation-detail-medical-section">
                <h3>📋 Consultation Summary</h3>
                <div className="online-consultation-detail-medical-content">
                  {consultation?.summary || "No summary provided."}
                </div>
              </div>

              <div className="online-consultation-detail-medical-section">
                <h3>👩‍⚕️ Consultant Notes</h3>
                <div className="online-consultation-detail-medical-content">
                  {consultation?.consultantNote ||
                    "No consultant note provided."}
                </div>
              </div>

              <div className="online-consultation-detail-medical-section">
                <h3>📝 Patient Notes</h3>
                <div className="online-consultation-detail-medical-content">
                  {consultation?.userNote || "No patient note provided."}
                </div>
              </div>

              <div className="online-consultation-detail-medical-section">
                <h3>🩺 Vital Signs</h3>
                <div className="online-consultation-detail-medical-content">
                  {consultation?.vitalSigns || "No vital signs provided."}
                </div>
              </div>

              <div className="online-consultation-detail-medical-section">
                <h3>💡 Recommendations</h3>
                <div className="online-consultation-detail-medical-content">
                  {consultation?.recommendations ||
                    "No recommendations provided."}
                </div>
              </div>

              <div className="online-consultation-detail-attachment-section">
                <h3 style={{ color: "#666", marginBottom: "15px" }}>
                  📎 Attachments
                </h3>
                <div className="online-consultation-detail-attachments-list">
                  {consultation.attachments &&
                  consultation.attachments.length > 0 ? (
                    consultation.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url || file.attachmentUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="online-consultation-detail-attachment-link"
                      >
                        {file.fileName || "Attachment"}
                      </a>
                    ))
                  ) : (
                    <span>No attachments available for this consultation</span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default OnlineConsultationDetail;
