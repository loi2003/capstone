import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./JournalEntryDetail.css";

const JournalEntryDetail = () => {
  
  const { state, search } = useLocation();
  const navigate = useNavigate();
  const journal = state?.journal;
  const journalData = journal.data;
  const growthDataId = new URLSearchParams(search).get("growthDataId");

  // Modal state & refs inside component
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const modalRef = useRef(null);

  const openPreview = (src, title) => {
    setModalSrc(src);
    setModalTitle(title);
    setModalOpen(true);
  };
  const closePreview = () => {
    setModalOpen(false);
    setModalSrc(null);
    setModalTitle("");
  };

  useEffect(() => {
    if (modalOpen && modalRef.current) modalRef.current.focus();
  }, [modalOpen]);

  if (!journal || !journal.data) {
    navigate(`/pregnancy-tracking?growthDataId=${growthDataId}`);
    return null;
  }
  
  const getImageSrc = (image) => image || "";

  const getAbnormalStatus = (bio) => {
    const results = {};

    // Blood Pressure: hypertension ≥140/90; severe ≥160/110 (urgent) [22][23]
    if (bio?.systolicBP && bio?.diastolicBP) {
      const sys = Number(bio.systolicBP);
      const dia = Number(bio.diastolicBP);
      if (sys >= 160 || dia >= 110) {
        results.bloodPressure = {
          abnormal: true,
          severity: "severe",
          message: `BP ${sys}/${dia} mmHg: severe (≥160/110)`,
        };
      } else if (sys >= 140 || dia >= 90) {
        results.bloodPressure = {
          abnormal: true,
          message: `BP ${sys}/${dia} mmHg: elevated (≥140/90)`,
        };
      } else if (sys < 90 || dia < 60) {
        results.bloodPressure = {
          abnormal: true,
          message: `BP ${sys}/${dia} mmHg: hypotension`,
        };
      }
    }

    // Blood sugar: common pregnancy targets fasting <95 mg/dL [24][25]
    if (bio?.bloodSugarLevelMgDl != null) {
      const sugar = Number(bio.bloodSugarLevelMgDl);
      if (sugar > 95) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood sugar ${sugar} mg/dL: above fasting target (>95)`,
        };
      } else if (sugar < 70) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood sugar ${sugar} mg/dL: hypoglycemia (<70)`,
        };
      }
    }

    // Heart rate: consider persistent >110 bpm as abnormal to investigate [26][27]
    if (bio?.heartRateBPM != null) {
      const hr = Number(bio.heartRateBPM);
      if (hr > 110) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart rate ${hr} bpm: elevated (>110)`,
        };
      } else if (hr < 50) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart rate ${hr} bpm: bradycardia (<50)`,
        };
      }
    }
    return results;
  };

  const bio = {
    systolicBP: journalData.systolicBP,
    diastolicBP: journalData.diastolicBP,
    heartRateBPM: journalData.heartRateBPM,
    bloodSugarLevelMgDl: journalData.bloodSugarLevelMgDl,
  };

  const abnormal = getAbnormalStatus(bio);

  return (
    <div className="journal-entry-detail">
      <div className="detail-header">
        <h3>Journal Entry Details</h3>
        <button
          className="journal-detail-back-btn"
          onClick={() =>
            navigate(
              `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
            )
          }
        >
          Back
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section-header">
          <p>
            <strong>Week:</strong> {journalData.currentWeek || "N/A"}
          </p>
          <p>
            <strong>Trimester:</strong> {journalData.currentTrimester || "N/A"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(journalData.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              { dateStyle: "medium" }
            ) || "N/A"}
          </p>
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
            <p>
              <strong>Recorded Weight:</strong> {journalData.currentWeight} Kg
            </p>
          </div>
        )}

        {/* Blood Pressure */}
        {(journalData.systolicBP || journalData.diastolicBP) && (
          <div
            className={`detail-section ${
              abnormal.bloodPressure?.abnormal ? "abnormal" : ""
            }`}
          >
            <h3>Blood Pressure</h3>
            <p>
              <strong>BP:</strong> {journalData.systolicBP ?? "N/A"}/
              {journalData.diastolicBP ?? "N/A"} mmHg
            </p>
            {abnormal.bloodPressure?.abnormal && (
              <p className="abnormal-note">{abnormal.bloodPressure.message}</p>
            )}
          </div>
        )}

        {/* Heart Rate */}
        {journalData.heartRateBPM != null && (
          <div
            className={`detail-section ${
              abnormal.heartRateBPM?.abnormal ? "abnormal" : ""
            }`}
          >
            <h3>Heart Rate</h3>
            <p>
              <strong>Heart Rate:</strong> {journalData.heartRateBPM} bpm
            </p>
            {abnormal.heartRateBPM?.abnormal && (
              <p className="abnormal-note">{abnormal.heartRateBPM.message}</p>
            )}
          </div>
        )}

        {/* Blood Sugar */}
        {journalData.bloodSugarLevelMgDl != null && (
          <div
            className={`detail-section ${
              abnormal.bloodSugarLevelMgDl?.abnormal ? "abnormal" : ""
            }`}
          >
            <h3>Blood Sugar</h3>
            <p>
              <strong>Blood Sugar:</strong> {journalData.bloodSugarLevelMgDl}{" "}
              mg/dL
            </p>
            {abnormal.bloodSugarLevelMgDl?.abnormal && (
              <p className="abnormal-note">
                {abnormal.bloodSugarLevelMgDl.message}
              </p>
            )}
          </div>
        )}

        {journalData.mood && (
          <div className="detail-section">
            <h3>Mood</h3>
            <p>
              <strong>Mood:</strong> {journalData.mood || "N/A"}
            </p>
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
                  onClick={() =>
                    openPreview(getImageSrc(img), `Related Image ${index + 1}`)
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPreview(
                        getImageSrc(img),
                        `Related Image ${index + 1}`
                      );
                    }
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
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
                  onClick={() =>
                    openPreview(
                      getImageSrc(img),
                      `Ultrasound Image ${index + 1}`
                    )
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPreview(
                        getImageSrc(img),
                        `Ultrasound Image ${index + 1}`
                      );
                    }
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="image-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePreview();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closePreview();
          }}
        >
          <div
            className="image-modal-content"
            ref={modalRef}
            tabIndex={-1}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="image-modal-header">
              <h4 id="preview-title">{modalTitle}</h4>
              <button
                className="image-modal-close"
                onClick={closePreview}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="image-modal-body">
              <img src={modalSrc} alt={modalTitle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryDetail;
