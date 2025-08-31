import { useState } from "react";
import "./PregnancyOverview.css";
import {
  editGrowthDataProfile,
  getCurrentWeekGrowthData,
} from "../../apis/growthdata-api";

const PregnancyOverview = ({ pregnancyData, setPregnancyData, setError }) => {
  const [isEditing, setIsEditing] = useState(null); // "lmp" | "duedate" | null
  const [newDate, setNewDate] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatDateForInput = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTrimesterInfo = (trimester) => {
    const trimesterData = {
      1: { name: "First Trimester", weeks: "1-12 weeks", color: "#4caf50" },
      2: { name: "Second Trimester", weeks: "13-27 weeks", color: "#2196f3" },
      3: { name: "Third Trimester", weeks: "28-40 weeks", color: "#9c27b0" },
    };
    return trimesterData[trimester] || trimesterData[1];
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const growthDataId = pregnancyData?.id;

      if (!growthDataId || !userId) {
        setError?.("Missing growth data ID or user ID.");
        return;
      }

      const payload = {
        id: growthDataId,
        userId,
        firstDayOfLastMenstrualPeriod: isEditing === "lmp" ? newDate : null,
        estimatedDueDate: isEditing === "duedate" ? newDate : null,
      };

      await editGrowthDataProfile(payload, token);

      // refresh pregnancy data
      const currentDate = new Date().toISOString().split("T")[0];
      const { data: pregRes } = await getCurrentWeekGrowthData(
        userId,
        currentDate,
        token
      );
      if (pregRes?.error === 0 && pregRes?.data) {
        setPregnancyData(pregRes.data);
      }

      setIsEditing(null);
      setNewDate("");
    } catch (err) {
      console.error("Error editing growth data:", err);
      setError?.("Failed to update growth data. Please try again.");
    }
  };

  const trimesterInfo = getTrimesterInfo(pregnancyData.currentTrimester);

  return (
    <div className="pregnancy-overview">
      <div className="overview-header">
        <h2>Your Pregnancy Journey</h2>
        <p>Welcome back! Here's your current pregnancy status</p>
      </div>

      <div className="overview-cards">
        {/* Current Week Card */}
        <div className="overview-card highlight">
          <div className="card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            <h3>Week {pregnancyData.currentGestationalAgeInWeeks}</h3>
            <p>Current pregnancy week</p>
          </div>
        </div>
        {/* Trimester Card */}
        <div className="overview-card">
          <div
            className="overview-card-icon"
            style={{ color: trimesterInfo.color }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5C15.8 11.5 16.5 12.2 16.5 13S15.8 14.5 15 14.5 13.5 13.8 13.5 13 14.2 11.5 15 11.5M5 12C5.8 12 6.5 12.7 6.5 13.5S5.8 15 5 15 3.5 14.3 3.5 13.5 4.2 12 5 12Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            <h3>{trimesterInfo.name}</h3>
            <p>{trimesterInfo.weeks}</p>
          </div>
        </div>

        {/* Due Date Card */}
        <div
          className={`overview-card ${
            isEditing === "duedate" ? "editing" : "editable"
          }`}
          onClick={
            isEditing === "duedate"
              ? undefined
              : () => {
                  setIsEditing("duedate");
                  setNewDate(
                    formatDateForInput(pregnancyData.estimatedDueDate)
                  );
                }
          }
        >
          <div className="overview-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            {isEditing === "duedate" ? (
              <div className="preg-overview-date-input-container">
                <div className="preg-overview-date-input-wrapper">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="preg-overview-inline-edit-actions">
                  <button className="preg-overview-save-inline-btn" onClick={handleSave}>
                    ✓ Save
                  </button>
                  <button
                    className="preg-overview-cancel-inline-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(null);
                      setNewDate("");
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>{formatDate(pregnancyData.estimatedDueDate)}</h3>
                <p>Estimated due date</p>
                <div className="preg-overview-edit-indicator"></div>
              </>
            )}
          </div>
        </div>
        {/* LMP Card */}
        <div
          className={`overview-card ${
            isEditing === "lmp" ? "editing" : "editable"
          }`}
          onClick={
            isEditing === "lmp"
              ? undefined
              : () => {
                  setIsEditing("lmp");
                  setNewDate(
                    formatDateForInput(
                      pregnancyData.firstDayOfLastMenstrualPeriod
                    )
                  );
                }
          }
        >
          <div className="overview-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            {isEditing === "lmp" ? (
              <div className="preg-overview-date-input-container">
                <div className="preg-overview-date-input-wrapper">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="preg-overview-inline-edit-actions">
                  <button
                    className="preg-overview-save-inline-btn"
                    onClick={handleSave}
                  >
                    ✓ Save
                  </button>
                  <button
                    className="preg-overview-cancel-inline-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(null);
                      setNewDate("");
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>
                  {formatDate(pregnancyData.firstDayOfLastMenstrualPeriod)}
                </h3>
                <p>Last menstrual period</p>
                <div className="preg-overview-edit-indicator"></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PregnancyOverview;
