import { useLocation, useNavigate } from "react-router-dom";
import "./JournalEntryDetail.css";

const JournalEntryDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const journal = state?.journal;
  const growthDataId = new URLSearchParams(location.search).get("growthDataId");

  console.log("Journal State Received:", journal); // Debug log for full state

  if (!journal || !journal.data) {
    navigate(`/pregnancy-tracking?growthDataId=${growthDataId}`);
    return null;
  }

  const journalData = journal.data;

  console.log("Related Images:", journalData.relatedImages); // Debug log for images
  console.log("Ultrasound Images:", journalData.ultraSoundImages); // Debug log for ultrasound images

  // Function to get image source (handles URLs directly from API)
  const getImageSrc = (image) => {
    return image || ""; // API provides full URLs
  };

  return (
    <div className="journal-entry-detail">
      <div className="detail-header">
        <h3>Journal Entry Details</h3>
        <button className="journal-detail-back-btn" onClick={() => navigate(`/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`)}>
          Back
        </button>
      </div>
      <div className="detail-content">
        <div className="detail-section-header">
          <p><strong>Week:</strong> {journalData.currentWeek || "N/A"}</p>
          <p><strong>Trimester:</strong> {journalData.currentTrimester || "N/A"}</p>
          <p><strong>Date:</strong> {new Date(journalData.createdAt || Date.now()).toLocaleDateString("en-US", { dateStyle: "medium" }) || "N/A"}</p>
          {/* <p><strong>Created By:</strong> {journalData.createdByUser?.userName || "Unknown"}</p> */}
        </div>
        {journalData.note && (
          <div className="detail-section">
            <h3>Notes</h3>
            <p className="detail-text">{journalData.note}</p>
          </div>
        )}
        {journalData.currentWeight && (
          <div className="detail-section">
            <h3>Weight</h3>
            <p><strong>Recorded Weight:</strong> {journalData.currentWeight} Kg</p>
          </div>
        )}
        {journalData.bloodPressure && (
            <div className="detail-section">
              <h3>Blood Pressure</h3>
              <p><strong>Blood Pressure:</strong> {journalData.SystolicBP || "N/A"}</p>
            </div>
        )}
        {
          journalData.heartRate && (
            <div className="detail-section">
              <h3>Heart Rate</h3>
              <p><strong>Heart Rate:</strong> {journalData.heartRate || "N/A"}</p>
            </div>
        )}
        {
          journalData.bloodSugar && (
            <div className="detail-section">
              <h3>Blood Sugar</h3>
              <p><strong>Blood Sugar:</strong> {journalData.bloodSugar || "N/A"}</p>
            </div>
          )
        }
        {journalData.mood && (
          <div className="detail-section">
            <h3>Mood</h3>
            <p><strong>Mood:</strong> {journalData.mood || "N/A"}</p>
          </div>
        )}
        {journalData.symptoms?.length > 0 && (
  <div className="detail-section">
    <h3>Symptoms</h3>
    {journalData.symptoms.filter((symptom) => !symptom.isTemplate).length > 0 ? (
      <ul className="detail-text">
        {journalData.symptoms
          .filter((symptom) => !symptom.isTemplate)
          .map((symptom, index) => (
            <li key={index}>{symptom.symptomName}</li>
          ))}
      </ul>
    ) : (
      <p className="detail-text">N/A.</p>
    )}
  </div>
)}
        {journalData.relatedImages?.length > 0 && (
  <div className="detail-section">
    <h3>Related Images</h3>
    <div className="image-gallery">
      {journalData.relatedImages.map((img, index) => (
        <img
          key={`related-${index}`}
          src={getImageSrc(img)}
          alt={`Related ${index + 1}`}
          className="detail-image"
          onError={(e) => {
            e.target.style.display = "none";
            console.log("Failed to load related image:", img);
          }}
        />
      ))}
    </div>
  </div>
)}

{journalData.ultraSoundImages?.length > 0 && (
  <div className="detail-section">
    <h3>Ultrasound Images</h3>
    <div className="image-gallery">
      {journalData.ultraSoundImages.map((img, index) => (
        <img
          key={`ultrasound-${index}`}
          src={getImageSrc(img)}
          alt={`Ultrasound ${index + 1}`}
          className="detail-image"
          onError={(e) => {
            e.target.style.display = "none";
            console.log("Failed to load ultrasound image:", img);
          }}
        />
      ))}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default JournalEntryDetail;