import "./BabyDevelopment.css";
import BabyDevelopmentData from "../../data/babyDevelopmentData";

const BabyDevelopment = ({ pregnancyData, selectedWeek }) => {
  const weekToShow =
    selectedWeek || pregnancyData?.currentGestationalAgeInWeeks || 22;

  if (weekToShow <= 4) {
    return (
      <div className="baby-development">
        <h3>Baby Development: Week {weekToShow}</h3>
        <p>
          During the first few weeks of pregnancy (weeks 1–4), a baby hasn't
          formed yet. These early stages involve ovulation, fertilization, and
          implantation. While you may not notice much physically, a lot is
          happening at a cellular level!
        </p>
      </div>
    );
  }

  const weekData = BabyDevelopmentData[weekToShow] || BabyDevelopmentData[22];

  return (
    <div className="baby-development">
      <h3>Baby Development: Week {weekToShow}</h3>

      <div className="development-overview">
        <div className="baby-illustration">
          <svg
            version="1.1"
            id="Icons"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 32 32"
            xmlSpace="preserve"
            width="80"
            height="80"
            fill="#04668D"
          >
            <style type="text/css">
              {`.st0 {
      fill: none;
      stroke: #04668D;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-miterlimit: 10;
    }`}
            </style>
            <path
              d="M27.4,13.3c-1-3.2-3.4-5.8-6.4-7.2c-0.4-1.4-1.2-2.6-2.4-3.6c-0.4-0.3-1.1-0.3-1.4,0.2c-0.3,0.4-0.3,1.1,0.2,1.4
    c2,1.6,2.6,4.4,1.4,6.7c-1,2-3.5,2.7-5.5,1.7c-1.5-0.8-2.1-2.6-1.3-4.1c0.3-0.5,0.7-0.9,1.3-1.1c0.6-0.2,1.2-0.1,1.7,0.2
    c0.4,0.2,0.7,0.5,0.8,0.9c0.1,0.4,0.1,0.8-0.1,1.2c-0.3,0.5-0.1,1.1,0.4,1.4c0.5,0.3,1.1,0.1,1.4-0.4c0.4-0.8,0.5-1.8,0.3-2.7
    s-0.9-1.7-1.8-2.1c-1-0.5-2.2-0.6-3.2-0.3c-0.4,0.1-0.8,0.3-1.1,0.6c-3.3,1.3-5.8,4-6.9,7.4C3.1,13.8,2,15.3,2,17
    c0,1.7,1.1,3.2,2.6,3.8C6.2,25.6,10.8,29,16,29s9.8-3.4,11.4-8.3c1.5-0.6,2.6-2.1,2.6-3.8C30,15.3,28.9,13.8,27.4,13.3z
     M12,17 c0-0.6,0.4-1,1-1s1,0.4,1,1v2c0,0.6-0.4,1-1,1s-1-0.4-1-1V17z
     M14,24c-1.7,0-3.2-1.1-3.8-2.7c-0.2-0.5,0.1-1.1,0.6-1.3
    c0.5-0.2,1.1,0.1,1.3,0.6c0.3,0.8,1,1.3,1.9,1.3c0.6,0,1,0.4,1,1S14.6,24,14,24z
     M20,19c0,0.6-0.4,1-1,1s-1-0.4-1-1v-2
    c0-0.6,0.4-1,1-1s1,0.4,1,1V19z"
            />
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
                <circle cx="12" cy="12" r="10" fill="#1A8474" opacity="0.2" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#1A8474"
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
  );
};

export default BabyDevelopment;
