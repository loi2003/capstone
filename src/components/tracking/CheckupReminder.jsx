import { useState, useEffect } from "react";
import CheckupCalendar from "./CheckupCalendar";
import "./CheckupReminder.css";
import { getAllTailoredCheckupRemindersForGrowthData } from "../../apis/tailored-checkup-reminder-api";
import { ViewAllRecommendedCheckupReminders } from "../../apis/recommended-checkup-reminder-api";
import { useNavigate } from "react-router-dom";

const CheckupReminder = ({ token, userId, appointments = [] }) => {
  const [recommendedReminders, setRecommendedReminders] = useState([]);
  const [emergencyReminders, setEmergencyReminders] = useState([]);
  const [selectedTrimester, setSelectedTrimester] = useState("first");
  const navigate = useNavigate();

  const getDateFromWeek = (lmpDate, weekNumber) => {
    const start = new Date(lmpDate);
    const daysToAdd = (weekNumber - 1) * 7;
    start.setDate(start.getDate() + daysToAdd);
    return start;
  };

  useEffect(() => {
    const lmpDateStr = localStorage.getItem("lmpDate");
    const lmpDate = lmpDateStr ? new Date(lmpDateStr) : new Date();

    if (lmpDateStr) {
      const currentWeek = getCurrentPregnancyWeek(lmpDate);
      const currentTrimester = getCurrentTrimester(currentWeek);
      setSelectedTrimester(currentTrimester);
    }


    const fetchRecommendedReminders = async () => {
      try {
        const growthDataId = localStorage.getItem("growthDataId");
        if (!token || !growthDataId) return;

        const apiResponse = await ViewAllRecommendedCheckupReminders(
          growthDataId,
          token
        );

        const remindersArray = Array.isArray(apiResponse.data?.data)
          ? apiResponse.data.data
          : [];

        const mappedRecommended = remindersArray.map((r) => {
          const startDate = getDateFromWeek(lmpDate, r.recommendedStartWeek);
          const endDate = getDateFromWeek(lmpDate, r.recommendedEndWeek);

          return {
            id: r.id,
            title: r.title,
            description: r.description,
            startDate,
            endDate,
            startWeek: r.recommendedStartWeek,
            endWeek: r.recommendedEndWeek,
            note: r.note,
            type: "recommended",
          };
        });

        setRecommendedReminders(mappedRecommended);
      } catch (err) {
        console.error("Failed to fetch recommended reminders:", err);
      }
    };

    const fetchEmergencyReminders = async () => {
      try {
        const growthDataId = localStorage.getItem("growthDataId");
        if (!token || !growthDataId) return;

        const apiResponse = await getAllTailoredCheckupRemindersForGrowthData(
          growthDataId,
          token
        );

        const remindersArray = Array.isArray(apiResponse.data)
          ? apiResponse.data
          : [];

        const mappedEmergency = remindersArray
          .filter((r) => r.type === "Emergency" && r.isActive)
          .map((r) => {
            const startDate = getDateFromWeek(lmpDate, r.recommendedStartWeek);
            const endDate = getDateFromWeek(lmpDate, r.recommendedEndWeek);

            return {
              id: r.id,
              title: r.title,
              startDate,
              endDate,
              startWeek: r.recommendedStartWeek,
              endWeek: r.recommendedEndWeek,
              note: r.description,
              type: "emergency",
            };
          });

        setEmergencyReminders(mappedEmergency);
      } catch (err) {
        console.error("Failed to fetch tailored reminders:", err);
      }
    };

    fetchRecommendedReminders();
    fetchEmergencyReminders();
  }, [token, userId]);

  const filterByTrimester = (reminder) => {
    if (selectedTrimester === "all") return true;
    if (selectedTrimester === "first") return reminder.startWeek <= 13;
    if (selectedTrimester === "second")
      return reminder.startWeek >= 14 && reminder.startWeek <= 27;
    if (selectedTrimester === "third") return reminder.startWeek >= 28;
    return true;
  };

  const handleBookInside = (reminder) => {
    navigate("/clinic/list");
  };

  const handleBookOutside = (reminder) => {
    alert(`Booking outside platform for: ${reminder.title}`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderReminderCard = (reminder, isUrgent = false) => (
    <div
      key={reminder.id}
      className={`reminder-card ${isUrgent ? "red" : "blue"}`}
    >
      <div className="reminder-info">
        <h5>{reminder.title}</h5>
        <div className="reminder-date">
          Week {reminder.startWeek} – Week {reminder.endWeek}
          <br />
          {formatDate(reminder.startDate)} – {formatDate(reminder.endDate)}
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
      </div>
    </div>
  );

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

        <div className="reminder-trimester-filter">
          <label>Show: </label>
          <select
            value={selectedTrimester}
            onChange={(e) => setSelectedTrimester(e.target.value)}
          >
            <option value="all">All Trimesters</option>
            <option value="first">First Trimester (Weeks 1-13)</option>
            <option value="second">Second Trimester (Weeks 14-27)</option>
            <option value="third">Third Trimester (Weeks 28-40)</option>
          </select>
        </div>

        {recommendedReminders.length > 0 ? (
          recommendedReminders
            .filter(filterByTrimester)
            .map((reminder) => renderReminderCard(reminder))
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
