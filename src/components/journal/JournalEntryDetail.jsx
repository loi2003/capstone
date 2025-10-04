import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaWeight,
  FaHeartbeat,
  FaThermometer,
  FaTint,
  FaStethoscope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaExpand,
  FaImage,
  FaWeightHanging,
  FaCube,
  FaHandHoldingHeart,
  FaNotesMedical,
  FaBandAid,
  // Mood Icons
  FaSadTear,
  FaDizzy,
  FaMeh,
  FaSmile,
  FaGrinBeam,
  FaFrown,
  FaGrinStars,
} from "react-icons/fa";
import "./JournalEntryDetail.css";

const JournalEntryDetail = () => {
  const { state, search } = useLocation();
  const navigate = useNavigate();
  const journal = state?.journal;
  const journalData = journal?.data;
  const growthDataId = new URLSearchParams(search).get("growthDataId");

  // Modal state & refs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef(null);

  const openPreview = (src, title, index = 0) => {
    setModalSrc(src);
    setModalTitle(title);
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closePreview = () => {
    setModalOpen(false);
    setModalSrc(null);
    setModalTitle("");
  };

  useEffect(() => {
    if (modalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [modalOpen]);

  if (!journal || !journal.data) {
    navigate(`/pregnancy-tracking?growthDataId=${growthDataId}`);
    return null;
  }

  const getImageSrc = (image) => image;

  const getMoodConfig = (mood) => {
    const moodConfigs = {
      sad: {
        icon: FaSadTear,
        // emoji: '😢',
        color: "#6b7280",
        bgColor: "rgba(107, 114, 128, 0.1)",
        label: "Sad Mood",
      },
      terrible: {
        icon: FaDizzy,
        // emoji: '😵',
        color: "#dc2626",
        bgColor: "rgba(220, 38, 38, 0.1)",
        label: "Terrible Mood",
      },
      neutral: {
        icon: FaMeh,
        // emoji: '😐',
        color: "#64748b",
        bgColor: "rgba(100, 116, 139, 0.1)",
        label: "Neutral Mood",
      },
      normal: {
        icon: FaSmile,
        // emoji: '🙂',
        color: "#059669",
        bgColor: "rgba(5, 150, 105, 0.1)",
        label: "Normal Mood",
      },
      happy: {
        icon: FaGrinBeam,
        // emoji: '😊',
        color: "#0ea5e9",
        bgColor: "rgba(14, 165, 233, 0.1)",
        label: "Happy Mood",
      },
      anxious: {
        icon: FaFrown,
        // emoji: '😰',
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        label: "Anxious Mood",
      },
      excited: {
        icon: FaGrinStars,
        // emoji: '🤩',
        color: "#8b5cf6",
        bgColor: "rgba(139, 92, 246, 0.1)",
        label: "Excited Mood",
      },
    };

    const moodKey = mood?.toLowerCase();
    return moodConfigs[moodKey] || moodConfigs["neutral"];
  };

  const getAbnormalStatus = (bio) => {
    const results = {};

    // Blood Pressure analysis
    if (bio?.systolicBP && bio?.diastolicBP) {
      const sys = Number(bio.systolicBP);
      const dia = Number(bio.diastolicBP);

      if (sys >= 160 || dia >= 110) {
        results.bloodPressure = {
          abnormal: true,
          severity: "severe",
          message: `BP ${sys}/${dia} mmHg (severe ≥160/110)`,
        };
      } else if (sys >= 140 || dia >= 90) {
        results.bloodPressure = {
          abnormal: true,
          message: `BP ${sys}/${dia} mmHg (elevated ≥140/90)`,
        };
      } else if (sys < 90 || dia < 60) {
        results.bloodPressure = {
          abnormal: true,
          message: `BP ${sys}/${dia} mmHg (hypotension)`,
        };
      }
    }

    // Blood sugar analysis
    if (bio?.bloodSugarLevelMgDl != null) {
      const sugar = Number(bio.bloodSugarLevelMgDl);
      if (sugar > 95) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood sugar ${sugar} mg/dL (above fasting target >95)`,
        };
      } else if (sugar < 70) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood sugar ${sugar} mg/dL (hypoglycemia <70)`,
        };
      }
    }

    // Heart rate analysis
    if (bio?.heartRateBPM != null) {
      const hr = Number(bio.heartRateBPM);
      if (hr > 120) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart rate ${hr} bpm (elevated >120)`,
        };
      } else if (hr < 50) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart rate ${hr} bpm (bradycardia <50)`,
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
  const moodConfig = getMoodConfig(journalData.mood);

  const allImages = [
    ...(journalData.relatedImages || []),
    ...(journalData.ultraSoundImages || []),
  ];

  return (
    <div className="journal-detail-page">
      <div className="journal-detail-container">
        {/* Enhanced Back Button */}
        <motion.div
          className="journal-detail-back"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            className="journal-detail-back-btn"
            onClick={() =>
              navigate(
                `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
              )
            }
          >
            {/* <FaArrowLeft /> */}
            <span>Back</span>
          </button>
        </motion.div>

        {/* Enhanced Journal Content */}
        <motion.article
          className="journal-detail-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Journal Header */}
          <header className="journal-detail-header">
            <div className="journal-detail-meta-top">
              <div className="journal-week-badge">
                Week {journalData.currentWeek || "N/A"}
              </div>
              <div className="journal-trimester-badge">
                {journalData.currentTrimester || "N/A"} Trimester
              </div>
            </div>

            <h1 className="journal-detail-title">Journal Detail</h1>

            <div className="journal-detail-meta">
              <div className="journal-detail-meta-item">
                <FaCalendarAlt className="meta-icon" />
                <span>
                  {new Date(
                    journalData.createdAt || Date.now()
                  ).toLocaleDateString("en-US", {
                    dateStyle: "full",
                  })}
                </span>
              </div>
            </div>
          </header>

          {/* Journal Notes */}
          {journalData.note && (
            <motion.section
              className="journal-detail-section notes-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="section-header">
                <h2>Notes</h2>
              </div>
              <div className="notes-content">
                <p>{journalData.note}</p>
              </div>
            </motion.section>
          )}
          {journalData.symptoms && journalData.symptoms.length > 0 && (
            <div className="symptoms-section">
              <div className="section-header">
                {/* <FaBandAid className="section-icon" /> */}
                <h2>Recorded Symptoms</h2>
              </div>
              <div className="symptoms-list">
                {journalData.symptoms.map((symptom, index) => (
                  <div key={index} className="symptom-tag">
                    <span className="symptom-name">{symptom.symptomName}</span>
                    {/* {!symptom.isTemplate && (
                      <span className="custom-badge">Custom</span>
                    )} */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Metrics Grid */}
          <div className="health-metrics-grid">
            {/* Weight */}
            {journalData.currentWeight && (
              <motion.div
                className="metric-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="metric-header">
                  <FaWeightHanging className="metric-icon" />
                  <h3>Recorded Weight</h3>
                </div>
                <div className="metric-value">
                  {journalData.currentWeight} <span className="unit">Kg</span>
                </div>
              </motion.div>
            )}

            {/* Blood Pressure */}
            {(journalData.systolicBP || journalData.diastolicBP) && (
              <motion.div
                className={`metric-card ${
                  abnormal.bloodPressure?.abnormal ? "abnormal" : "normal"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="metric-header">
                  <FaHeartbeat className="metric-icon" />
                  <h3>Blood Pressure</h3>
                  {abnormal.bloodPressure?.abnormal && (
                    <FaExclamationTriangle className="warning-icon" />
                  )}
                </div>
                <div className="metric-value">
                  {journalData.systolicBP || "N/A"}/
                  {journalData.diastolicBP || "N/A"}
                  <span className="unit"> mmHg</span>
                </div>
                {abnormal.bloodPressure?.abnormal && (
                  <div className="abnormal-note">
                    {abnormal.bloodPressure.message}
                  </div>
                )}
              </motion.div>
            )}

            {/* Heart Rate */}
            {journalData.heartRateBPM != null && (
              <motion.div
                className={`metric-card ${
                  abnormal.heartRateBPM?.abnormal ? "abnormal" : "normal"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="metric-header">
                  <FaHandHoldingHeart className="metric-icon" />
                  <h3>Heart Rate</h3>
                  {abnormal.heartRateBPM?.abnormal && (
                    <FaExclamationTriangle className="warning-icon" />
                  )}
                </div>
                <div className="metric-value">
                  {journalData.heartRateBPM} <span className="unit">bpm</span>
                </div>
                {abnormal.heartRateBPM?.abnormal && (
                  <div className="abnormal-note">
                    {abnormal.heartRateBPM.message}
                  </div>
                )}
              </motion.div>
            )}

            {/* Blood Sugar */}
            {journalData.bloodSugarLevelMgDl != null && (
              <motion.div
                className={`metric-card ${
                  abnormal.bloodSugarLevelMgDl?.abnormal ? "abnormal" : "normal"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="metric-header">
                  <FaCube className="metric-icon" />
                  <h3>Blood Sugar</h3>
                  {abnormal.bloodSugarLevelMgDl?.abnormal && (
                    <FaExclamationTriangle className="warning-icon" />
                  )}
                </div>
                <div className="metric-value">
                  {journalData.bloodSugarLevelMgDl}{" "}
                  <span className="unit">mg/dL</span>
                </div>
                {abnormal.bloodSugarLevelMgDl?.abnormal && (
                  <div className="abnormal-note">
                    {abnormal.bloodSugarLevelMgDl.message}
                  </div>
                )}
              </motion.div>
            )}

            {/* Enhanced Mood Card with React Icons */}
            {journalData.mood && (
              <motion.div
                className="metric-card mood-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  background: moodConfig.bgColor,
                  borderColor: moodConfig.color,
                }}
              >
                <div className="metric-header">
                  <div
                    className="mood-header-icon"
                    style={{ color: moodConfig.color }}
                  >
                    {/* <moodConfig.icon /> */}
                  </div>
                  {/* <h3>Mood</h3> */}
                </div>
                <div className="mood-content">
                  <div
                    className="mood-icon-container"
                    style={{
                      color: moodConfig.color,
                      background: `linear-gradient(135deg, ${moodConfig.color}20, transparent)`,
                    }}
                  >
                    <moodConfig.icon className="mood-react-icon" />
                  </div>
                  <div className="mood-details">
                    <span className="mood-emoji" style={{ fontSize: "2rem" }}>
                      {moodConfig.emoji}
                    </span>
                    <span
                      className="mood-text"
                      style={{ color: moodConfig.color }}
                    >
                      {moodConfig.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Image Galleries */}
          {allImages.length > 0 && (
            <motion.section
              className="journal-images-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="section-header">
                {/* <FaImage className="section-icon" /> */}
                <h2>Images</h2>
              </div>

              <div className="images-tabs">
                {journalData.relatedImages?.length > 0 && (
                  <div className="image-category">
                    <h3>Related Images</h3>
                    <div className="image-gallery">
                      {journalData.relatedImages.map((img, index) => (
                        <motion.div
                          key={`related-${index}`}
                          className="image-card"
                          whileHover={{ y: -5 }}
                          onClick={() =>
                            openPreview(
                              getImageSrc(img),
                              `Related Image ${index + 1}`,
                              index
                            )
                          }
                        >
                          <img
                            src={getImageSrc(img)}
                            alt={`Related ${index + 1}`}
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                          <div className="image-overlay">
                            <FaExpand />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {journalData.ultraSoundImages?.length > 0 && (
                  <div className="image-category">
                    <h3>Ultrasound Images</h3>
                    <div className="image-gallery">
                      {journalData.ultraSoundImages.map((img, index) => (
                        <motion.div
                          key={`ultrasound-${index}`}
                          className="image-card"
                          whileHover={{ y: -5 }}
                          onClick={() =>
                            openPreview(
                              getImageSrc(img),
                              `Ultrasound Image ${index + 1}`,
                              index
                            )
                          }
                        >
                          <img
                            src={getImageSrc(img)}
                            alt={`Ultrasound ${index + 1}`}
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                          <div className="image-overlay">
                            <FaExpand />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </motion.article>
      </div>

      {/* Enhanced Image Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <motion.div
              className="image-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              ref={modalRef}
              tabIndex={-1}
            >
              <div className="image-modal-header">
                <h4>{modalTitle}</h4>
                <button className="image-modal-close" onClick={closePreview}>
                  <FaTimes />
                </button>
              </div>
              <div className="image-modal-body">
                <img src={modalSrc} alt={modalTitle} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEntryDetail;
