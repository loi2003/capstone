import "./JournalSection.css"

const JournalSection = ({ journalEntries }) => {
  if (!journalEntries || journalEntries.length === 0) {
    return (
      <div className="journal-section">
        <div className="section-header">
          <h3>Pregnancy Journal</h3>
          <p>Document your pregnancy journey week by week</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                fill="#bdc3c7"
              />
            </svg>
          </div>
          <h4>No journal entries yet</h4>
          <p>Start documenting your pregnancy journey by adding your first entry!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="journal-section">
      <div className="section-header">
        <h3>Pregnancy Journal</h3>
        <p>Your pregnancy journey documented week by week</p>
      </div>

      <div className="journal-entries">
        {journalEntries.map((entry) => (
          <div key={entry.id} className="journal-entry">
            <div className="entry-header">
              <div className="week-badge">Week {entry.currentWeek}</div>
              <div className="trimester-badge">Trimester {entry.currentTrimester}</div>
            </div>

            <div className="entry-content">
              {entry.note && (
                <div className="entry-field">
                  <h4>Notes</h4>
                  <p>{entry.note}</p>
                </div>
              )}

              <div className="entry-metrics">
                {entry.currentWeight > 0 && (
                  <div className="metric">
                    <span className="metric-icon">⚖️</span>
                    <span className="metric-value">{entry.currentWeight} kg</span>
                    <span className="metric-label">Current Weight</span>
                  </div>
                )}

                {entry.symptoms && (
                  <div className="entry-field">
                    <h4>Symptoms</h4>
                    <p>{entry.symptoms}</p>
                  </div>
                )}

                {entry.moodNotes && (
                  <div className="entry-field">
                    <h4>Mood & Feelings</h4>
                    <p>{entry.moodNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JournalSection
