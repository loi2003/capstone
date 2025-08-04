import "./PregnancyOverview.css"

const PregnancyOverview = ({ pregnancyData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTrimesterInfo = (trimester) => {
    const trimesterData = {
      1: { name: "First Trimester", weeks: "1-12 weeks", color: "#4caf50" },
      2: { name: "Second Trimester", weeks: "13-27 weeks", color: "#2196f3" },
      3: { name: "Third Trimester", weeks: "28-40 weeks", color: "#9c27b0" },
    }
    return trimesterData[trimester] || trimesterData[1]
  }

  const trimesterInfo = getTrimesterInfo(pregnancyData.currentTrimester)

  return (
    <div className="pregnancy-overview">
      <div className="overview-header">
        <h2>Your Pregnancy Journey</h2>
        <p>Welcome back! Here's your current pregnancy status</p>
      </div>

      <div className="overview-cards">
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

        <div className="overview-card">
          <div className="overview-card-icon" style={{ color: trimesterInfo.color }}>
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

        <div className="overview-card">
          <div className="overview-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            <h3>{formatDate(pregnancyData.estimatedDueDate)}</h3>
            <p>Estimated due date</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="overview-card-content">
            <h3>{formatDate(pregnancyData.firstDayOfLastMenstrualPeriod)}</h3>
            <p>Last menstrual period</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PregnancyOverview
