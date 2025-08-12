import { useEffect, useState } from "react";
import "./UpcomingAppointments.css";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
} from "../../utils/date.js";
import { viewAllOfflineConsultation } from "../../apis/offline-consultation-api";
import { IoTimeOutline } from "react-icons/io5";
import { HiOutlineLocationMarker } from "react-icons/hi";

const UpcomingAppointments = ({
  userId,
  token,
  status = null,
  expanded = false,
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
            name: consultation.checkupName || "Unknown name",
            note: consultation.healthNote || "No notes available",
            type: consultation.consultationType?.toLowerCase(),
            typecolor: getTypeColor(consultation.consultationType),
            doctor: consultation.doctor?.fullName || "Unknown Doctor",
            clinic: consultation.clinic?.name || "Unknown Clinic",
            address: consultation.clinic?.address,
            start,
            end,
            status: consultation.status?.toLowerCase(),
            color: getStatusColor(consultation.status),
          };
        });

        setAppointments(mappedAppointments);
      } catch (error) {
        console.error("Error loading offline consultations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
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
      default:
        return "gray";
    }
  };

  const displayedAppointments = expanded
    ? appointments
    : appointments.slice(0, 2);

  if (loading) {
    return <p>Loading upcoming appointments...</p>;
  }

  return (
    <div className="upcoming-appointments">
      <div className="section-header">
        <h3>Upcoming Appointments</h3>
        {!expanded && appointments.length > 2 && (
          <button className="view-all-btn">View All</button>
        )}
      </div>

      <div className="appointments-list">
        {displayedAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className={`appointment-card ${appointment.color}`}
          >
            <div className="appointment-info">
              <h4 className="appointment-name">{appointment.name}</h4>
              <p className="doctor-name">Dr. {appointment.doctor}</p>
              <div className="appointment-details">
                <span className="appointment-time">
                  <IoTimeOutline></IoTimeOutline>{" "}
                  {formatDateForDisplay(appointment.start)}{" "}
                  {formatTimeForDisplay(appointment.start)} -{" "}
                  {formatTimeForDisplay(appointment.end)}
                </span>
                <span className="clinic-address">
                  <HiOutlineLocationMarker></HiOutlineLocationMarker>{" "}
                  {appointment.address}
                </span>
              </div>

              {/* Notes with label */}
              <p className="notes-label">
                <strong>Notes:</strong> {appointment.note}
              </p>

              {/* Single type */}
              <div className="appointment-type-section">
                <span className={`appointment-type ${appointment.typecolor}`}>
                  {appointment.type}
                </span>
              </div>
            </div>

            <div className="appointment-actions">
              <button className="appointment-view-btn">View Details</button>
              <button className="appointment-reschedule-btn">Reschedule</button>
            </div>
          </div>
        ))}
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
