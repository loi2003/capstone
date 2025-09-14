import { useState, useEffect, useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import {
  getJournalByGrowthDataId,
  deleteJournal,
  getJournalDetail,
} from "../../apis/journal-api";
import "./JournalSection.css";
import editIcon from "../../assets/icons/edit-svgrepo-com.svg";
import viewIcon from "../../assets/icons/view-reveal-svgrepo-com.svg";
import moodIcon from "../../assets/icons/emoji-funny-square-svgrepo-com.svg";
import weightIcon from "../../assets/icons/weight-hanging-svgrepo-com.svg";
import { getCurrentWeekGrowthData } from "../../apis/growthdata-api";
// JournalSection.jsx (add near other imports)
const TRIMESTERS = {
  ALL: "all",
  FIRST: "first",
  SECOND: "second",
  THIRD: "third",
};

// helper to check trimester
const isInTrimester = (week, tri) => {
  if (tri === TRIMESTERS.ALL) return true;
  if (tri === TRIMESTERS.FIRST) return week >= 1 && week <= 12;
  if (tri === TRIMESTERS.SECOND) return week >= 13 && week <= 26;
  if (tri === TRIMESTERS.THIRD) return week >= 27; // up to currentWeek / 40
  return true;
};

const JournalSection = ({
  journalEntries,
  growthDataId,
  growthData,
  onError,
}) => {
  const [currentWeek, setCurrentWeek] = useState(null);

  const [entries, setEntries] = useState(journalEntries || []);
  const { notifications, showNotification } = useContext(NotificationContext);
  // inside component
  const [trimesterFilter, setTrimesterFilter] = useState(TRIMESTERS.ALL);
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'

  // derive visible entries
  const visibleEntries = (entries || [])
    .filter((e) => isInTrimester(e.currentWeek, trimesterFilter))
    .slice() // avoid mutating state when sorting
    .sort((a, b) => {
      const cmp = (a.currentWeek ?? 0) - (b.currentWeek ?? 0);
      return sortOrder === "desc" ? -cmp : cmp;
    });

  useEffect(() => {
    const lastMsg = notifications[notifications.length - 1];
    if (lastMsg?.type === "Journal") {
      const journal = lastMsg.payload;
      setEntries((prev) => [...prev, journal]);
    }
  }, [notifications]);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (growthDataId && token) {
      fetchJournals();
      fetchCurrentWeek();
    }
  }, [growthDataId, token]);

  const fetchJournals = async () => {
    try {
      const response = await getJournalByGrowthDataId(growthDataId, token);
      console.log("Fetch Journals Response:", response); // Debug
      if (response.data?.error === 0 && response.data?.data) {
        setEntries(response.data.data);
      } else {
        setEntries([]);
        setErrors({
          submit: response.data?.message || "Failed to fetch journals",
        });
        onError?.(response.data?.message || "Failed to fetch journals");
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch journals";
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    }
  };
  const fetchCurrentWeek = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const today = new Date().toISOString().split("T")[0];
      const response = await getCurrentWeekGrowthData(userId, today, token);
      const week = response?.data?.data?.currentGestationalAgeInWeeks || null;
      setCurrentWeek(week);
    } catch (error) {
      console.error("Failed to fetch current gestational week:", error);
    }
  };
  const getUndocumentedWeeks = () => {
    const documentedWeeks = entries.map((e) => e.currentWeek);
    const allWeeks = Array.from({ length: currentWeek }, (_, i) => i + 1);
    return allWeeks.filter((w) => !documentedWeeks.includes(w));
  };
  const undocumentedWeeks = currentWeek ? getUndocumentedWeeks() : [];

  const handleDelete = async (journalId) => {
    try {
      await deleteJournal(journalId, token);
      setEntries(entries.filter((entry) => entry.id !== journalId));
      showNotification(
        `Journal of week ${
          entries.find((e) => e.id === journalId)?.currentWeek
        } deleted successfully!`,
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete journal";
      showNotification(errorMessage, "error");
    }
  };

  const handleViewDetails = async (journalId) => {
    try {
      const response = await getJournalDetail(journalId, token);
      console.log("Journal Detail Response:", response);
      if (response.data?.error === 0 && response.data?.data) {
        navigate("/pregnancy-tracking/journal-section/journal-detail", {
          state: { journal: response.data },
        });
      } else {
        const errorMessage =
          response.data?.message || "Failed to fetch journal details";
        console.error("API Error:", errorMessage);
        setErrors({ submit: errorMessage });
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching journal details:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch journal details";
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    }
  };

  const getImageSrc = (image) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image.url || "";
  };

  // state for confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // open/close helpers
  const openConfirm = (journalId) => {
    setPendingDeleteId(journalId);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isDeleting) return; // prevent closing during deletion
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  // confirm action
  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      setIsDeleting(true);
      await handleDelete(pendingDeleteId);
      closeConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="journal-section">
        <div className="section-header">
          <h3>Pregnancy Journal</h3>
          <p>Your pregnancy journey documented week by week</p>

          {undocumentedWeeks.length > 0 ? (
            <Link
              to={`/pregnancy-tracking/journal-section/journal-form?growthDataId=${growthDataId}`}
            >
              <button className="add-entry-btn" disabled={!token}>
                Add Entry
              </button>
            </Link>
          ) : (
            <p
              className="info-message"
              style={{ color: "var(--color-text)", marginTop: "1rem" }}
            >
              You've already documented all weeks up to Week {currentWeek}.
            </p>
          )}
        </div>

        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                fill="var(--color-text)"
              />
            </svg>
          </div>
          <h4>No journal entries yet</h4>
          <p>
            Start documenting your pregnancy journey by adding your first entry!
          </p>
          <Link
            to={`/pregnancy-tracking/journal-section/journal-form?growthDataId=${growthDataId}`}
          >
            <button className="add-entry-btn" disabled={!token}>
              Add Entry
            </button>
          </Link>
        </div>
        {/* {errors.submit && <span className="error-message">{errors.submit}</span>} */}
      </div>
    );
  }

  return (
    <div className="journal-section">
      <div className="journal-list-controls">
        <select
          aria-label="Filter by trimester"
          value={trimesterFilter}
          onChange={(e) => setTrimesterFilter(e.target.value)}
        >
          <option value={TRIMESTERS.ALL}>All trimesters</option>
          <option value={TRIMESTERS.FIRST}>First (1–12)</option>
          <option value={TRIMESTERS.SECOND}>Second (13–26)</option>
          <option value={TRIMESTERS.THIRD}>Third (27+)</option>
        </select>

        <select
          aria-label="Sort by week"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Latest week first</option>
          <option value="asc">Oldest week first</option>
        </select>
      </div>
      <div className="section-header">
        <h3>Pregnancy Journal</h3>
        <p>Your pregnancy journey documented week by week</p>
        {undocumentedWeeks.length > 0 ? (
          <Link
            to={`/pregnancy-tracking/journal-section/journal-form?growthDataId=${growthDataId}`}
          >
            <button className="add-entry-btn" disabled={!token}>
              Add Entry
            </button>
          </Link>
        ) : (
          <p
            className="info-message"
            style={{ color: "var(--color-text)", marginTop: "1rem" }}
          >
            All Journals are up to date up to Week {currentWeek}.
          </p>
        )}
      </div>

      <div className="journal-entries">
        {visibleEntries.map((entry) => (
          <div key={entry.id} className="journal-entry">
            <div className="entry-header">
              <div className="entry-info">
                <div className="week-badge">
                  Week {entry.currentWeek || "N/A"}
                </div>
                <span className="entry-date">
                  {new Date().toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </span>
              </div>
              <div className="entry-actions">
                <Link
                  to={`/pregnancy-tracking/journal-section/edit-journal-form?growthDataId=${growthDataId}&entryId=${entry.id}`}
                >
                  <button className="journal-edit-btn" disabled={!token}>
                    <img src={editIcon} alt="Edit" className="journal-icon" />
                  </button>
                </Link>

                <button
                  className="journal-delete-btn"
                  onClick={() => openConfirm(entry.id)}
                  disabled={!token}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      fill="#e74c3c"
                    />
                  </svg>
                </button>
                <button
                  className="journal-view-btn"
                  onClick={() => handleViewDetails(entry.id)}
                  disabled={!token}
                >
                  <img src={viewIcon} alt="View" className="journal-icon" />
                </button>
              </div>
            </div>
            <div className="entry-content">
              {entry.note && (
                <div className="entry-field">
                  <h4>Notes</h4>
                  <p className="entry-text">{entry.note}</p>
                </div>
              )}
              <div className="entry-metrics">
                {entry.currentWeight > 0 && (
                  <div className="metric">
                    <span className="metric-icon">
                      <img
                        src={weightIcon}
                        alt="Weight"
                        className="journal-weight-icon"
                      />
                    </span>
                    <span className="metric-value">
                      {entry.currentWeight} kg
                    </span>
                    <span className="metric-label">Recorded Weight</span>
                  </div>
                )}
                {entry.mood && (
                  <div className="metric">
                    <span className="metric-icon">
                      <img
                        src={moodIcon}
                        alt="Mood"
                        className="journal-mood-icon"
                      />
                    </span>
                    <span className="metric-value">{entry.mood}</span>
                    <span className="metric-label">Mood</span>
                  </div>
                )}
                {entry.symptomNames?.length > 0 && (
                  <div className="entry-field">
                    <h4>Symptoms</h4>
                    <p className="entry-text">
                      {entry.symptomNames.join(", ") || "No symptoms"}
                    </p>
                  </div>
                )}
                {(entry.relatedImages?.length > 0 ||
                  entry.ultraSoundImages?.length > 0) && (
                  <div className="entry-field">
                    <h4>Images</h4>
                    <div className="image-gallery">
                      {entry.relatedImages?.map((img, index) => (
                        <img
                          key={`related-${index}`}
                          src={getImageSrc(img)}
                          alt={`Related ${index + 1}`}
                          className="journal-image"
                        />
                      ))}
                      {entry.ultraSoundImages?.map((img, index) => (
                        <img
                          key={`ultrasound-${index}`}
                          src={getImageSrc(img)}
                          alt={`Ultrasound ${index + 1}`}
                          className="journal-image"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {confirmOpen && (
        <div
          className="journal-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            // click outside to close (only if the backdrop itself was clicked)
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div
            className="journal-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journal-delete-dialog-title"
            aria-describedby="journal-delete-dialog-description"
            tabIndex={-1}
            onKeyDown={(e) => {
              // Escape to close
              if (e.key === "Escape") closeConfirm();
              // Simple focus trap: loop between the two buttons
              if (e.key === "Tab") {
                const focusables = e.currentTarget.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusables;
                const last = focusables[focusables.length - 1];
                if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                } else if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
              }
            }}
          >
            <h3 id="journal-delete-dialog-title">Delete journal entry?</h3>
            <p id="journal-delete-dialog-description">
              This action cannot be undone. The entry and its images will be
              permanently removed.
            </p>
            <div className="journal-modal-actions">
              <button
                type="button"
                className="journal-btn-outline"
                onClick={closeConfirm}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="journal-btn-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Yes, Delete it"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {errors.submit && <span className="error-message">{errors.submit}</span>} */}
    </div>
  );
};

export default JournalSection;
