import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { viewOfflineConsultationById } from "../../apis/offline-consultation-api";
import MainLayout from "../../layouts/MainLayout";
import "../../styles/OfflineConsultationDetail.css";

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

const OfflineConsultationDetail = () => {
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
        const response = await viewOfflineConsultationById(id, token);
        setConsultation(response?.data || response || null);
      } catch (error) {
        console.error("Error fetching consultation detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConsultation();
  }, [id, navigate]);

  return (
    <MainLayout>
      <div className="offline-consultation-detail-container">
        {loading ? (
          <div className="consultation-detail-loading">Loading...</div>
        ) : !consultation ? (
          <div className="consultation-detail-error">
            Offline Consultation not found.
          </div>
        ) : (
          <>
            <div className="offline-consultation-detail-header">
              <h1>Offline Consultation Detail</h1>
              <span className="offline-consultation-detail-status-badge">
                Status: {consultation.status}
              </span>
            </div>

            <div className="offline-consultation-detail-content">
              <button
                className="offline-consultation-detail-back-btn"
                onClick={() => navigate(-1)}
              >
                &larr; Back
              </button>

              <div className="offline-consultation-detail-consultation-period">
                <h3 style={{ color: "#067DAD", marginBottom: "15px" }}>
                  📅 Consultation Period
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
                    <strong>{consultation.consultationType}</strong>
                  </span>
                </div>
              </div>

              <div className="offline-consultation-detail-info-grid">
                <div className="offline-consultation-detail-info-card">
                  <h3 className="offline-consultation-detail-card-title">
                    👨‍⚕️ Doctor Information
                  </h3>
                  <div className="offline-consultation-detail-doctor-info">
                    <div className="offline-consultation-detail-avatar-placeholder">
                      {consultation?.doctor?.user?.avatar ? (
                        <img
                          src={consultation.doctor.user.avatar}
                          alt="Doctor Avatar"
                          style={{ width: 48, height: 48, borderRadius: "50%" }}
                        />
                      ) : (
                        <span className="avatar-initial">
                          {consultation?.doctor?.user?.userName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1em",
                          color: "#333",
                        }}
                      >
                        {consultation?.doctor?.user?.userName}
                      </div>
                      <div style={{ color: "#666" }}>
                        {consultation?.doctor?.workPosition}
                      </div>
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
                    {consultation?.doctor?.user?.phoneNo}
                  </div>
                  <div className="offline-consultation-detail-email-info">
                    {consultation?.doctor?.user?.email}
                  </div>
                </div>

                <div className="offline-consultation-detail-info-card">
                  <h3 className="offline-consultation-detail-card-title">
                    👤 Patient Information
                  </h3>
                  <div className="offline-consultation-detail-patient-info">
                    <div className="offline-consultation-detail-avatar-placeholder">
                      {consultation?.user?.avatar ? (
                        <img
                          src={consultation.user.avatar}
                          alt="Patient Avatar"
                          style={{ width: 48, height: 48, borderRadius: "50%" }}
                        />
                      ) : (
                        <span className="avatar-initial">
                          {consultation?.user?.userName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1em",
                          color: "#333",
                        }}
                      >
                        {consultation?.user?.userName}
                      </div>
                      <div style={{ color: "#666" }}>Patient</div>
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
                    <span className="offline-consultation-detail-info-label">
                      Status:
                    </span>
                    <span className="offline-consultation-detail-info-value">
                      <span style={{ color: "#00b894", fontWeight: "bold" }}>
                        ● {consultation?.user?.status}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="offline-consultation-detail-info-card">
                  <h3 className="offline-consultation-detail-card-title">
                    🏥 Clinic Information
                  </h3>
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: 15,
                      color: "#333",
                    }}
                  >
                    {consultation?.clinic?.user?.userName}
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
                      <span style={{ color: "#00b894", fontWeight: "bold" }}>
                        ✓ {consultation?.clinic?.user?.status}
                      </span>
                    </span>
                  </div>
                  <div className="offline-consultation-detail-contact-info">
                    {consultation?.clinic?.user?.phoneNo}
                  </div>
                  <div className="offline-consultation-detail-email-info">
                    {consultation?.clinic?.user?.email}
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      Specializations:
                    </div>
                    <div
                      style={{
                        fontSize: "0.9em",
                        lineHeight: 1.4,
                        color: "#555",
                      }}
                    >
                      {consultation?.clinic?.specializations
                        ? consultation.clinic.specializations
                            .split(";")
                            .map((spec, idx) => (
                              <div key={idx}>• {spec.trim()}</div>
                            ))
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="offline-consultation-detail-schedules-section">
                <h3 className="offline-consultation-detail-schedules-title">
                  📋 Scheduled Appointments
                </h3>
                {consultation.schedules && consultation.schedules.length > 0 ? (
                  consultation.schedules.map((sch, idx) => (
                    <div
                      className="offline-consultation-detail-schedule-item"
                      key={idx}
                    >
                      <div className="offline-consultation-detail-schedule-time">
                        🕐 Session {idx + 1}
                      </div>
                      <div className="offline-consultation-detail-datetime">
                        Start: {formatDateTime(sch.slot.startTime)}
                      </div>
                      <div className="offline-consultation-detail-datetime">
                        End: {formatDateTime(sch.slot.endTime)}
                      </div>
                      <div
                        className="offline-consultation-detail-duration"
                        style={{
                          marginTop: 10,
                          padding: "8px 12px",
                          background: "rgba(0, 184, 148, 0.1)",
                          borderRadius: 8,
                          color: "#00b894",
                          fontWeight: "bold",
                          display: "inline-block",
                        }}
                      >
                        Duration:{" "}
                        {formatDuration(sch.slot.startTime, sch.slot.endTime)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No scheduled appointments.</div>
                )}
              </div>

              <div className="offline-consultation-detail-health-note">
                <h3>📝 Health Note</h3>
                <p>{consultation?.healthNote || "No health note provided."}</p>
              </div>

              <div className="offline-consultation-detail-attachments-section">
                <h3>📎 Attachments</h3>
                <div className="offline-consultation-detail-attachments-list">
                  {consultation.attachments &&
                  consultation.attachments.length > 0 ? (
                    consultation.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url || file.attachmentUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="offline-consultation-detail-attachment-link"
                      >
                        {file.fileName || "Attachment"}
                      </a>
                    ))
                  ) : (
                    <span>No attachments.</span>
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

export default OfflineConsultationDetail;
