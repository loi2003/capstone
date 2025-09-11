import { useState, useEffect } from "react";
import CheckupCalendar from "./CheckupCalendar";
import "./CheckupReminder.css";
import { getAllTailoredCheckupRemindersForGrowthData } from "../../apis/tailored-checkup-reminder-api";
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

    const recommended = [
      {
        id: 1,
        title: "Initial Prenatal Visit",
        description:
          "Confirm pregnancy, estimate due date, and run baseline tests (blood, urine, STIs, etc).",
        RecommendedStartWeek: 6,
        RecommendedEndWeek: 10,
        note: "First in-depth appointment—establish prenatal care baseline.",
        type: "recommended",
      },
      {
        id: 2,
        title: "Second Trimester Checkpoint",
        description:
          "Follow-up to monitor maternal and fetal health—typical physical exam.",
        RecommendedStartWeek: 10,
        RecommendedEndWeek: 12,
        note: "Short visit to revisit labs and check progress.",
        type: "recommended",
      },
      {
        id: 3,
        title: "Mid-Pregnancy Screening",
        description: "Detailed scan and fetal development assessment.",
        RecommendedStartWeek: 16,
        RecommendedEndWeek: 18,
        note: "Includes anatomy ultrasound and growth tracking.",
        type: "recommended",
      },
      {
        id: 4,
        title: "Gestational Diabetes Screening",
        description: "Glucose challenge test to check for gestational diabetes.",
        RecommendedStartWeek: 20,
        RecommendedEndWeek: 22,
        note: "Standard screening in mid-pregnancy.",
        type: "recommended",
      },
      {
        id: 5,
        title: "Routine Follow-up",
        description: "Regular wellness check to assess maternal and fetal status.",
        RecommendedStartWeek: 24,
        RecommendedEndWeek: 28,
        note: "Standard check-up during late second trimester.",
        type: "recommended",
      },
      {
        id: 6,
        title: "Early Third Trimester Visit",
        description: "Assessment around the beginning of the third trimester.",
        RecommendedStartWeek: 32,
        RecommendedEndWeek: 32,
        note: "Transition to more frequent visits begins soon.",
        type: "recommended",
      },
      {
        id: 7,
        title: "Late Third Trimester Check (36 weeks)",
        description: "Checkup for dilation, fetal position, and Group B strep culture.",
        RecommendedStartWeek: 36,
        RecommendedEndWeek: 36,
        note: "Key milestone before entering weekly visits.",
        type: "recommended",
      },
      {
        id: 8,
        title: "Weekly Monitoring (3 Weeks)",
        description: "Frequent monitoring leading up to labor and delivery.",
        RecommendedStartWeek: 38,
        RecommendedEndWeek: 40,
        note: "Weekly prenatal visits until birth.",
        type: "recommended",
      },
    ].map((r) => {
      const startDate = getDateFromWeek(lmpDate, r.RecommendedStartWeek);
      const endDate = getDateFromWeek(lmpDate, r.RecommendedEndWeek);

      return {
        ...r,
        startDate,
        endDate,
        startWeek: r.RecommendedStartWeek,
        endWeek: r.RecommendedEndWeek,
      };
    });

    setRecommendedReminders(recommended);

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

        const mappedEmergency = remindersArray
          .filter((r) => r.type === "Emergency" && r.isActive === 1)
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

    fetchEmergencyReminders();
  }, [token, userId]);

  const filterByTrimester = (reminder) => {
    if (selectedTrimester === "all") return true;
    if (selectedTrimester === "first")
      return reminder.startWeek <= 13;
    if (selectedTrimester === "second")
      return reminder.startWeek >= 14 && reminder.startWeek <= 27;
    if (selectedTrimester === "third")
      return reminder.startWeek >= 28;
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
            <option value="first">First Trimester</option>
            <option value="second">Second Trimester</option>
            <option value="third">Third Trimester</option>
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
