import "./BabyDevelopment.css"
import BabyDevelopmentData from "../../data/babyDevelopmentData"

const BabyDevelopment = ({ pregnancyData }) => {
  const currentWeek = pregnancyData?.currentGestationalAgeInWeeks || 22

  if (currentWeek <= 4) {
    return (
      <div className="baby-development">
        <h3>Baby Development: Week {currentWeek}</h3>
        <p>
          During the first few weeks of pregnancy (weeks 1–4), a baby hasn't formed yet. 
          These early stages involve ovulation, fertilization, and implantation. 
          While you may not notice much physically, a lot is happening at a cellular level!
        </p>
      </div>
    )
  }

  const weekData = BabyDevelopmentData[currentWeek] || BabyDevelopmentData[22]

  return (
    <div className="baby-development">
      <h3>Baby Development: Week {currentWeek}</h3>

      <div className="development-overview">
        <div className="baby-illustration">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="20" fill="var(--accent-color)" opacity="0.3" />
            <circle cx="50" cy="65" r="25" fill="var(--accent-color)" opacity="0.5" />
            <circle cx="45" cy="30" r="2" fill="var(--primary-bg)" />
            <circle cx="55" cy="30" r="2" fill="var(--primary-bg)" />
            <path d="M45 40 Q50 45 55 40" stroke="var(--primary-bg)" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="size-info">
          <div className="measurement">
            <h4>Length</h4>
            <span className="value">{weekData.length}</span>
            <span className="unit">head to heel</span>
          </div>
          <div className="measurement">
            <h4>Weight</h4>
            <span className="value">{weekData.weight}</span>
            <span className="unit">approximate</span>
          </div>
        </div>
      </div>

      <div className="size-comparison">
        <span>Size of a {weekData.size}</span>
      </div>

      <div className="developments">
        <h4>What's happening this week:</h4>
        <ul>
          {weekData.developments.map((development, index) => (
            <li key={index}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--accent-color)" opacity="0.2" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="var(--accent-color)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {development}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default BabyDevelopment
