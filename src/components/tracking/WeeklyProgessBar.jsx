import "./PregnancyProgressBar.css"

const PregnancyProgressBar = ({ pregnancyData }) => {
  const currentWeek = pregnancyData?.currentGestationalAgeInWeeks || 0
  const totalWeeks = 40
  const progressPercentage = Math.min((currentWeek / totalWeeks) * 100, 100)
  const weeksToGo = Math.max(totalWeeks - currentWeek, 0)

  // Generate week numbers for calendar view (similar to reference image)
  const generateWeekNumbers = () => {
    const weeks = []
    const startWeek = Math.max(1, currentWeek - 4)
    const endWeek = Math.min(totalWeeks, currentWeek + 5)

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
          <span className="current-week">Week {currentWeek}</span>
          <span className="weeks-remaining">{weeksToGo} weeks to go</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-labels">
          <span>Week 1</span>
          <span>Week {currentWeek}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          <div className="progress-marker" style={{ left: `${progressPercentage}%` }}></div>
        </div>
        <div className="milestone-labels">
          <span>First Day of Last Period</span>
          <span>Due Date</span>
        </div>
      </div>

      {/* Week Calendar similar to reference image */}
      <div className="week-calendar">
        {weekNumbers.map((week) => (
          <div key={week} className={`week-item ${week === currentWeek ? "current" : ""}`}>
            <span className="week-label">Week</span>
            <span className="week-number">{week}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PregnancyProgressBar
