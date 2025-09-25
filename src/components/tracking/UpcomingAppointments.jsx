import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingAppointments.css";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
} from "../../utils/date.js";
import { viewAllOfflineConsultation } from "../../apis/offline-consultation-api";
import { getAllOnlineConsultationsByUserId } from "../../apis/online-consultation-api";
import { IoTimeOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

const UpcomingAppointments = ({
  userId,
  token,
  status = null,
  expanded = false,
}) => {
  const [appointments, setAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOnline, setLoadingOnline] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await viewAllOfflineConsultation(
          userId,
          status,
          token
        );
        const consultations = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const mappedAppointments = consultations.map((consultation) => {
          const start = new Date(consultation.startDate);
          const end = new Date(consultation.endDate);

          return {
            id: consultation.id,
            note: consultation.healthNote || "No notes available",
            type: consultation.consultationType?.toLowerCase(),
            typecolor: getTypeColor(consultation.consultationType),
            doctor: consultation.doctor?.user?.userName || "Unknown Doctor",
            clinic: consultation.clinic?.name || "Unknown Clinic",
            address: consultation.clinic?.address,
            start,
            end,
            status: consultation.status?.toLowerCase(),
            color: getStatusColor(consultation.status),
            consultationType: consultation.consultationType,
            isOnline: false,
          };
        });

        setAppointments(mappedAppointments);
      } catch (error) {
        console.error("Error loading offline consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOnlineAppointments = async () => {
      try {
        setLoadingOnline(true);
        const response = await getAllOnlineConsultationsByUserId(userId, token);
        // Fix extraction of array from response
        const onlineConsults = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        const mappedOnline = onlineConsults.map((consultation) => {
          const start = new Date(consultation.date);
          const end = start;
          return {
            id: consultation.id,
            note: consultation.consultantNote || "No notes available",
            type: "online",
            typecolor: "green",
            doctor:
              consultation.consultant?.user?.userName || "Unknown Consultant",
            clinic:
              consultation.consultant?.clinic?.user?.userName ||
              "Unknown Clinic",
            address: consultation.consultant?.clinic?.address || "",
            start,
            end,
            status: consultation.status?.toLowerCase(),
            color: getStatusColor(consultation.status),
            consultationType: "Online",
            isOnline: true,
          };
        });
        setOnlineAppointments(mappedOnline);
      } catch (error) {
        console.error("Error loading online consultations:", error);
      } finally {
        setLoadingOnline(false);
      }
    };

    fetchAppointments();
    fetchOnlineAppointments();
  }, [userId, status, token]);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "confirmed":
        return "blue";
      case "pending":
        return "yellow";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };
  const getTypeColor = (type) => {
    switch ((type || "").toLowerCase()) {
      case "onetime":
        return "blue";
      case "periodic":
        return "yellow";
      case "online":
        return "green";
      default:
        return "gray";
    }
  };

  const displayedAppointments = expanded
    ? appointments
    : appointments.slice(0, 2);

  const displayedOnlineAppointments = expanded
    ? onlineAppointments
    : onlineAppointments.slice(0, 2);

  if (loading || loadingOnline) {
    return <p>Loading upcoming appointments...</p>;
  }

  return (
    <div className="upcoming-appointments">
      <div className="section-header">
        <h3>Offline Consultations</h3>
        {!expanded && appointments.length > 2 && (
          <button className="view-all-btn">View All</button>
        )}
      </div>

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p className="no-appointments">No Offline Consultations yet!</p>
        ) : (
          displayedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`appointment-card ${appointment.color}`}
            >
              <div className="appointment-info">
                <h4 className="doctor-name">{appointment.doctor}</h4>
                <div className="appointment-details">
                  <span className="appointment-time">
                    <IoTimeOutline /> {formatDateForDisplay(appointment.start)}{" "}
                    {formatTimeForDisplay(appointment.start)} -{" "}
                    {formatTimeForDisplay(appointment.end)}
                  </span>
                  <span className="clinic-address">
                    <HiOutlineLocationMarker /> {appointment.address}
                  </span>
                </div>

                <p className="notes-label">
                  <strong>Notes:</strong> {appointment.note}
                </p>

                <div className="appointment-type-section">
                  <span className={`appointment-type ${appointment.typecolor}`}>
                    {appointment.type}
                  </span>
                </div>
              </div>

              <div className="appointment-actions">
                <button
                  className="appointment-view-btn"
                  onClick={() => {
                    navigate(`/offline-consultation/${appointment.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="section-header" style={{ marginTop: "32px" }}>
        <h3>Online Consultations</h3>
        {!expanded && onlineAppointments.length > 2 && (
          <button className="view-all-btn">View All</button>
        )}
      </div>

      <div className="appointments-list">
        {onlineAppointments.length === 0 ? (
          <p className="no-appointments">No Online Consultations yet!</p>
        ) : (
          displayedOnlineAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`appointment-card ${appointment.color}`}
            >
              <div className="appointment-info">
                <h4 className="doctor-name">{appointment.doctor}</h4>
                <div className="appointment-details">
                  <span className="appointment-time">
                    <IoTimeOutline /> {formatDateForDisplay(appointment.start)}{" "}
                    {formatTimeForDisplay(appointment.start)} -{" "}
                    {formatTimeForDisplay(appointment.end)}
                  </span>
                  <span className="clinic-address">
                    <HiOutlineLocationMarker /> {appointment.address}
                  </span>
                </div>

                <p className="notes-label">
                  <strong>Notes:</strong> {appointment.note}
                </p>

                <div className="appointment-type-section">
                  <span className={`appointment-type ${appointment.typecolor}`}>
                    {appointment.consultationType}
                  </span>
                </div>
              </div>

              <div className="appointment-actions">
                <button
                  className="appointment-view-btn"
                  onClick={() => {
                    // Navigate to OnlineConsultationDetail page with the onlineConsultationId
                    navigate(`/online-consultation/${appointment.id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="appointment-instruction-legend">
        <span className="appointment confirmed">● Confirmed</span>
        <span className="appointment pending">● Pending</span>
        <span className="appointment canceled">● Canceled</span>
      </div>

      {expanded && (
        <button className="schedule-new-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Schedule New Appointment
        </button>
      )}
    </div>
  );
};

export default UpcomingAppointments;
