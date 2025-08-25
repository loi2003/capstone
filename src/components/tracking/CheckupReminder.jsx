import { useState, useEffect } from "react";
import CheckupCalendar from "./CheckupCalendar";
import "./CheckupReminder.css";
import { getAllTailoredCheckupRemindersForGrowthData } from "../../apis/tailored-checkup-reminder-api";

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// lmpDate: the first day of last menstrual period
// weekNumber: gestational week (integer)
const getDateFromWeek = (lmpDate, weekNumber) => {
  const start = new Date(lmpDate);
  // weekNumber starts at 1, so subtract 1 to get correct offset
  const daysToAdd = (weekNumber - 1) * 7;
  start.setDate(start.getDate() + daysToAdd);
  return start;
};

const getWeekNumber = (dateStr) => {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
};

const CheckupReminder = ({ token, userId, appointments = [] }) => {
  const [recommendedReminders, setRecommendedReminders] = useState([]);
  const [emergencyReminders, setEmergencyReminders] = useState([]);

  useEffect(() => {
    setRecommendedReminders([
      {
        id: 1,
        title: "Second Trimester Checkup",
        startDate: "2025-08-11",
        endDate: "2025-08-21",
        note: "Book a general prenatal checkup for the 16th week.",
        type: "recommended",
      },
      {
        id: 2,
        title: "Glucose Screening",
        startDate: "2025-09-05",
        endDate: "2025-09-11",
        note: "Check blood sugar level for gestational diabetes.",
        type: "recommended",
      },
    ]);

    const fetchEmergencyReminders = async () => {
      try {
        const token = localStorage.getItem("token");
        const growthDataId = localStorage.getItem("growthDataId");
        if (!token || !growthDataId) return;

        const apiResponse = await getAllTailoredCheckupRemindersForGrowthData(
          growthDataId,
          token
        );

        const remindersArray = Array.isArray(apiResponse.data)
          ? apiResponse.data
          : [];

        const lmpDateStr = localStorage.getItem("lmpDate"); // store this when user registers
        const lmpDate = lmpDateStr ? new Date(lmpDateStr) : new Date(); // fallback today

        const mappedEmergency = remindersArray.map((r) => {
          const startDate = getDateFromWeek(lmpDate, r.recommendedStartWeek);
          const endDate = getDateFromWeek(lmpDate, r.recommendedEndWeek);

          return {
            id: r.id,
            title: r.title,
            startDate, // real date, so calendar still works
            endDate,
            startWeek: r.recommendedStartWeek, // keep weeks!
            endWeek: r.recommendedEndWeek,
            note: r.description,
            type: r.type?.toLowerCase() || "emergency",
          };
        });

        setEmergencyReminders(mappedEmergency);
      } catch (err) {
        console.error("Failed to fetch tailored reminders:", err);
      }
    };

    fetchEmergencyReminders();
  }, [token, userId]);

  const handleBookInside = (reminder) => {
    alert(`Booking inside platform for: ${reminder.title}`);
  };

  const handleBookOutside = (reminder) => {
    alert(`Booking outside platform for: ${reminder.title}`);
  };

  const renderReminderCard = (reminder, isUrgent = false) => {
    return (
      <div
        key={reminder.id}
        className={`reminder-card ${isUrgent ? "red" : "blue"}`}
      >
        <div className="reminder-info">
          <h5>{reminder.title}</h5>
          <div className="reminder-date">
            {reminder.type === "emergency" ? (
              <>
                Week {reminder.startWeek} – Week {reminder.endWeek}
                <br />
                {new Date(reminder.startDate).toLocaleDateString(
                  "en-GB"
                )} – {new Date(reminder.endDate).toLocaleDateString("en-GB")}
              </>
            ) : (
              <>
                {formatDate(reminder.startDate)} –{" "}
                {formatDate(reminder.endDate)}
                <br />
                Week {getWeekNumber(reminder.startDate)} – Week{" "}
                {getWeekNumber(reminder.endDate)}
              </>
            )}
          </div>
          <p className="reminder-note">{reminder.note}</p>
        </div>
        <div className="reminder-actions">
          <button
            className={`book-btn ${isUrgent ? "emergency" : ""}`}
            onClick={() => handleBookInside(reminder)}
          >
            {isUrgent ? "Book Urgently" : "Schedule Consultation"}
          </button>
          {/* {!isUrgent && (
            <button
              className="outside-btn"
              onClick={() => handleBookOutside(reminder)}
            >
              Book Outside
            </button>
          )} */}
        </div>
      </div>
    );
  };

  return (
    <div className="checkup-reminder">
      <h3>Checkup Reminders</h3>
      <span>Setting up a reminder for your future checkup~</span>

      <CheckupCalendar
        reminders={[...recommendedReminders, ...emergencyReminders]}
        appointments={appointments}
      />

      <div className="reminder-section">
        <h3>Recommended Checkup</h3>
        {recommendedReminders.length > 0 ? (
          recommendedReminders.map((reminder) => renderReminderCard(reminder))
        ) : (
          <p className="empty-text">No recommended reminders at this time.</p>
        )}
      </div>

      <div className="reminder-section emergency">
        <h3>Emergency Checkup</h3>
        {emergencyReminders.length > 0 ? (
          emergencyReminders.map((reminder) =>
            renderReminderCard(reminder, true)
          )
        ) : (
          <p className="empty-text">No emergency reminders at this time.</p>
        )}
      </div>
    </div>
  );
};

export default CheckupReminder;
