import "./UpcomingAppointments.css"
import { formatDateForDisplay, formatTimeForDisplay } from "../../utils/date.js"

const UpcomingAppointments = ({ expanded = false }) => {
  // Sample appointments data - in real app, this would come from API
  const appointments = [
    {
      id: 1,
      type: "Anatomy Scan Ultrasound",
      doctor: "Dr. Sarah Johnson",
      date: formatDateForDisplay(new Date("2023-05-16")),
      time: formatTimeForDisplay("10:30"),
      status: "scheduled",
      color: "blue",
    },
    {
      id: 2,
      type: "Glucose Screening Test",
      doctor: "Dr. Sarah Johnson",
      date: formatDateForDisplay(new Date("2023-05-23")),
      time: formatTimeForDisplay("14:00"),
      status: "pending",
      color: "yellow",
    },
    {
      id: 3,
      type: "Regular Checkup",
      doctor: "Dr. Sarah Johnson",
      date: formatDateForDisplay(new Date("2023-06-01")),
      time: formatTimeForDisplay("11:00"),
      status: "scheduled",
      color: "green",
    },
  ]

  const displayedAppointments = expanded ? appointments : appointments.slice(0, 2)

  return (
    <div className="upcoming-appointments">
      <div className="section-header">
        <h3>Upcoming Appointments</h3>
        {!expanded && appointments.length > 2 && <button className="view-all-btn">View All</button>}
      </div>

      <div className="appointments-list">
        {displayedAppointments.map((appointment) => (
          <div key={appointment.id} className={`appointment-card ${appointment.color}`}>
            <div className="appointment-info">
              <h4>{appointment.type}</h4>
              <p className="doctor">{appointment.doctor}</p>
              <div className="appointment-details">
                <span className="date">📅 {appointment.date}</span>
                <span className="time">🕐 {appointment.time}</span>
              </div>
            </div>
            <div className="appointment-actions">
              <button className="action-btn view">View Details</button>
              <button className="action-btn reschedule">Reschedule</button>
            </div>
          </div>
        ))}
      </div>

      {expanded && (
        <button className="schedule-new-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Schedule New Appointment
        </button>
      )}
    </div>
  )
}

export default UpcomingAppointments
