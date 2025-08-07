import { useState, useEffect } from "react"
import { format, addDays, addWeeks } from "date-fns"
import "./PregnancyProgressBar.css"

const PregnancyProgressBar = ({ pregnancyData, selectedWeek, setSelectedWeek }) => {
  const currentWeek = pregnancyData?.currentGestationalAgeInWeeks || 0
  const totalWeeks = 40

  useEffect(() => {
    setSelectedWeek(currentWeek) // reset when pregnancy data changes
  }, [currentWeek])

  const progressPercentage = Math.min((selectedWeek / totalWeeks) * 100, 100)
  const weeksToGo = Math.max(totalWeeks - selectedWeek, 0)

  const lmp = pregnancyData?.firstDayOfLastMenstrualPeriod
    ? new Date(pregnancyData.firstDayOfLastMenstrualPeriod)
    : null

  let weekStart = ""
  let weekEnd = ""

  if (lmp) {
    const startOfWeek = addWeeks(lmp, selectedWeek - 1)
    weekStart = format(startOfWeek, "MMM d")
    weekEnd = format(addDays(startOfWeek, 6), "MMM d, yyyy")
  }

  const trimesterLabel =
    selectedWeek <= 13
      ? "First Trimester"
      : selectedWeek <= 27
      ? "Second Trimester"
      : "Third Trimester"

  const generateWeekNumbers = () => {
    const weeks = []
    const startWeek = Math.max(1, selectedWeek - 4)
    const endWeek = Math.min(totalWeeks, selectedWeek + 5)
    for (let i = startWeek; i <= endWeek; i++) {
      weeks.push(i)
    }
    return weeks
  }

  const weekNumbers = generateWeekNumbers()

  return (
    <div className="pregnancy-progress-bar">
      <div className="progress-header">
        <div className="progress-info">
          <div>
            <span className="current-week">
              Week {selectedWeek}: {trimesterLabel}
            </span>
            {weekStart && weekEnd && (
              <div className="week-range">
                {weekStart} – {weekEnd}
              </div>
            )}
          </div>
          <span className="weeks-remaining">{weeksToGo} weeks to go</span>
        </div>
        {selectedWeek !== currentWeek && (
          <button
            className="back-to-current-btn"
            onClick={() => setSelectedWeek(currentWeek)}
          >
            Back to Current Week
          </button>
        )}
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <span>Week 1</span>
          <span>Week {totalWeeks}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          <div className="progress-marker" style={{ left: `${progressPercentage}%` }}></div>
        </div>
        <div className="milestone-labels">
          <span>First Day of Last Period</span>
          <span>
            Due Date:{" "}
            {pregnancyData?.estimatedDueDate
              ? format(new Date(pregnancyData.estimatedDueDate), "MMM dd, yyyy")
              : "—"}
          </span>
        </div>
      </div>

      <div className="week-calendar">
        {weekNumbers.map((week) => (
          <div
            key={week}
            className={`week-item ${week === selectedWeek ? "current" : ""}`}
            onClick={() => setSelectedWeek(week)}
          >
            <span className="week-label">Week</span>
            <span className="week-number">{week}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PregnancyProgressBar
