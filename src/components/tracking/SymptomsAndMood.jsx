"use client";

import { useState, useEffect } from "react";
import {
  getSymptomsForUser,
  addNewCustomSymptom 
} from "../../apis/recorded-symptom-api";

import "./SymptomsAndMood.css";

const SymptomsAndMood = ({
  selectedMood,
  onMoodChange,
  selectedSymptoms = [], 
  onSymptomsChange,      
  userId,
  token
}) => {
  const [symptoms, setSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [showInput, setShowInput] = useState(false);

  const moods = [
    {
      id: "sad",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z"
            fill="currentColor"
          />
          <path
            d="M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z"
            fill="currentColor"
          />
          <path
            d="M15.1091 16.4588C15.3597 16.9443 15.9548 17.1395 16.4449 16.8944C16.9388 16.6474 17.1391 16.0468 16.8921 15.5528C16.8096 15.3884 16.7046 15.2343 16.5945 15.0875C16.4117 14.8438 16.1358 14.5299 15.7473 14.2191C14.9578 13.5875 13.7406 13 11.9977 13C10.2547 13 9.03749 13.5875 8.24796 14.2191C7.85954 14.5299 7.58359 14.8438 7.40078 15.0875C7.29028 15.2348 7.1898 15.3889 7.10376 15.5517C6.85913 16.0392 7.06265 16.6505 7.55044 16.8944C8.04053 17.1395 8.63565 16.9443 8.88619 16.4588C8.9 16.4339 9.08816 16.1082 9.49735 15.7809C9.95782 15.4125 10.7406 15 11.9977 15C13.2547 15 14.0375 15.4125 14.498 15.7809C14.9072 16.1082 15.0953 16.4339 15.1091 16.4588Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Sad",
    },
    {
      id: "terrible",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 14C7.44771 14 7 14.4477 7 15C7 15.5523 7.44771 16 8 16H15.9991C16.5514 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14H8Z"
            fill="currentColor"
          />
          <path
            d="M10.7041 7.2924C10.3141 6.90253 9.68178 6.90253 9.29176 7.2924L8.49735 8.0865L7.70797 7.29743C7.31795 6.90756 6.68561 6.90756 6.29559 7.29743C5.90557 7.6873 5.90556 8.3194 6.29558 8.70926L7.08496 9.49833L6.29251 10.2905C5.9025 10.6803 5.90249 11.3124 6.29251 11.7023C6.68254 12.0922 7.31488 12.0922 7.7049 11.7023L8.49735 10.9102L9.2951 11.7076C9.68512 12.0975 10.3175 12.0975 10.7075 11.7076C11.0975 11.3177 11.0975 10.6856 10.7075 10.2958L9.90974 9.49833L10.7041 8.70424C11.0942 8.31437 11.0942 7.68227 10.7041 7.2924Z"
            fill="currentColor"
          />
          <path
            d="M16.2918 7.2924C16.6818 6.90253 17.3141 6.90253 17.7041 7.2924C18.0942 7.68227 18.0942 8.31437 17.7041 8.70424L16.9097 9.49833L17.7075 10.2958C18.0975 10.6856 18.0975 11.3177 17.7075 11.7076C17.3175 12.0975 16.6851 12.0975 16.2951 11.7076L15.4974 10.9102L14.7049 11.7023C14.3149 12.0922 13.6825 12.0922 13.2925 11.7023C12.9025 11.3124 12.9025 10.6803 13.2925 10.2905L14.085 9.49833L13.2956 8.70926C12.9056 8.3194 12.9056 7.6873 13.2956 7.29743C13.6856 6.90756 14.318 6.90756 14.708 7.29743L15.4974 8.0865L16.2918 7.2924Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Terrible",
    },
    {
      id: "neutral",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 9.5C10 10.3284 9.32843 11 8.5 11C7.67157 11 7 10.3284 7 9.5C7 8.67157 7.67157 8 8.5 8C9.32843 8 10 8.67157 10 9.5Z"
            fill="currentColor"
          />
          <path
            d="M15.5 11C16.3284 11 17 10.3284 17 9.5C17 8.67157 16.3284 8 15.5 8C14.6716 8 14 8.67157 14 9.5C14 10.3284 14.6716 11 15.5 11Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Neutral",
    },
    {
      id: "normal",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z"
            fill="currentColor"
          />
          <path
            d="M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z"
            fill="currentColor"
          />
          <path
            d="M8 14C7.44772 14 7 14.4477 7 15C7 15.5523 7.44772 16 8 16H15.9991C16.5514 16 17 15.5523 17 15C17 14.4477 16.5523 14 16 14H8Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Normal",
    },
    {
      id: "happy",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z"
            fill="currentColor"
          />
          <path
            d="M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z"
            fill="currentColor"
          />
          <path
            d="M8.88875 13.5414C8.63822 13.0559 8.0431 12.8607 7.55301 13.1058C7.05903 13.3528 6.8588 13.9535 7.10579 14.4474C7.18825 14.6118 7.29326 14.7659 7.40334 14.9127C7.58615 15.1565 7.8621 15.4704 8.25052 15.7811C9.04005 16.4127 10.2573 17.0002 12.0002 17.0002C13.7431 17.0002 14.9604 16.4127 15.7499 15.7811C16.1383 15.4704 16.4143 15.1565 16.5971 14.9127C16.7076 14.7654 16.8081 14.6113 16.8941 14.4485C17.1387 13.961 16.9352 13.3497 16.4474 13.1058C15.9573 12.8607 15.3622 13.0559 15.1117 13.5414C15.0979 13.5663 14.9097 13.892 14.5005 14.2194C14.0401 14.5877 13.2573 15.0002 12.0002 15.0002C10.7431 15.0002 9.96038 14.5877 9.49991 14.2194C9.09071 13.892 8.90255 13.5663 8.88875 13.5414Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Happy",
    },
    {
      id: "anxious",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z"
            fill="currentColor"
          />
          <path
            d="M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z"
            fill="currentColor"
          />
          <path
            d="M6.55279 15.8944C7.03804 16.1371 7.62626 15.9481 7.88102 15.4731C8.11023 15.1132 8.60518 15 9 15C9.44724 15 9.61844 15.1141 9.94058 15.3289L9.9453 15.3321C10.3701 15.6153 10.9494 16 12 16C13.0506 16 13.6299 15.6153 14.0547 15.3321L14.0594 15.3289C14.3816 15.1141 14.5528 15 15 15C15.3948 15 15.8898 15.1132 16.119 15.4731C16.3737 15.9481 16.962 16.1371 17.4472 15.8944C17.9287 15.6537 18.1343 15.0286 17.8922 14.5484C17.8451 14.4558 17.7934 14.3704 17.6984 14.2437C17.5859 14.0938 17.4194 13.9049 17.1872 13.7191C16.7102 13.3375 15.9929 13 15 13C13.9494 13 13.3701 13.3847 12.9453 13.6679L12.9406 13.6711C12.6184 13.8859 12.4472 14 12 14C11.5528 14 11.3816 13.8859 11.0594 13.6711L11.0547 13.6679C10.6299 13.3847 10.0506 13 9 13C8.00708 13 7.28983 13.3375 6.81281 13.7191C6.58063 13.9049 6.41406 14.0938 6.30156 14.2437C6.20582 14.3714 6.15379 14.4572 6.10665 14.5506C5.86386 15.0337 6.06922 15.6526 6.55279 15.8944Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Anxious",
    },
    {
      id: "excited",
      emoji: (
        <svg
          width="36px"
          height="36px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z"
            fill="currentColor"
          />
          <path
            d="M17 9.5C17 10.3284 16.3284 11 15.5 11C14.6716 11 14 10.3284 14 9.5C14 8.67157 14.6716 8 15.5 8C16.3284 8 17 8.67157 17 9.5Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.2 13C7.56149 13 6.9436 13.5362 7.01666 14.2938C7.06054 14.7489 7.2324 15.7884 7.95483 16.7336C8.71736 17.7313 9.99938 18.5 12 18.5C14.0006 18.5 15.2826 17.7313 16.0452 16.7336C16.7676 15.7884 16.9395 14.7489 16.9833 14.2938C17.0564 13.5362 16.4385 13 15.8 13H8.2ZM9.54387 15.5191C9.41526 15.3509 9.31663 15.1731 9.2411 15H14.7589C14.6834 15.1731 14.5847 15.3509 14.4561 15.5191C14.0981 15.9876 13.4218 16.5 12 16.5C10.5782 16.5 9.90187 15.9876 9.54387 15.5191Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12 20.9932C7.03321 20.9932 3.00683 16.9668 3.00683 12C3.00683 7.03321 7.03321 3.00683 12 3.00683C16.9668 3.00683 20.9932 7.03321 20.9932 12C20.9932 16.9668 16.9668 20.9932 12 20.9932Z"
            fill="currentColor"
          />
        </svg>
      ),
      label: "Excited",
    },
  ];

  // Load both template + custom symptoms
  useEffect(() => {
    if (!userId || !token) return;

    getSymptomsForUser(userId, token)
      .then((res) => {
        const allSymptoms =
          (res.data?.data || []).map((s) => ({
            id: String(s.id),                // normalize id to string
            label: s.symptomName,
            isTemplate: !!s.isTemplate       // use the backend flag directly
          }));
        setSymptoms(allSymptoms);
      })
      .catch((err) => {
        console.error("Failed to load symptoms", err);
        setSymptoms([]);
      });
  }, [userId, token]);

  // Normalize selected ids to strings for safe comparisons
  const selectedIds = (selectedSymptoms || []).map(String);

  // Helper: return selected symptom names given a list of ids
  const getSelectedSymptomNames = (ids) => {
    const idSet = new Set((ids || []).map(String));
    return symptoms
      .filter((sym) => idSet.has(String(sym.id)))
      .map((sym) => sym.label);
  };

  // Toggle symptom and pass both IDs + names
  const handleSymptomToggle = (symptomId) => {
    const idStr = String(symptomId);
    const updatedIds = selectedIds.includes(idStr)
      ? selectedIds.filter((id) => id !== idStr)
      : [...selectedIds, idStr];

    const updatedNames = getSelectedSymptomNames(updatedIds);
    if (typeof onSymptomsChange === "function") {
      onSymptomsChange(updatedIds, updatedNames);
    }
  };

  const handleAddCustomSymptomClick = () => {
    setShowInput(true);
  };

  const handleCancel = () => {
    setCustomSymptom("");
    setShowInput(false);
  };

  // If you no longer want to create custom symptoms, you can remove this handler & the UI.
  const handleCustomSymptomSubmit = async () => {
    const trimmed = customSymptom?.trim();
    if (!trimmed) return;

    try {
      const res = await addNewCustomSymptom(trimmed, token);
      const newId = String(res?.data?.data?.id);
      const newSymptom = {
        id: newId,
        label: trimmed,
        isTemplate: false
      };

      setSymptoms((prev) => [...prev, newSymptom]);

      // update selection to include new symptom
      const updatedIds = [...selectedIds, newId];
      const updatedNames = getSelectedSymptomNames(updatedIds);

      if (typeof onSymptomsChange === "function") {
        onSymptomsChange(updatedIds, updatedNames);
      }

      setCustomSymptom("");
      setShowInput(false);
    } catch (err) {
      console.error("Failed to add custom symptom", err);
    }
  };

  return (
    <div className="symptoms-and-mood">
      <div className="section-header">
        <h3>Symptoms & Mood</h3>
      </div>

      {/* Mood Section */}
      <div className="mood-section">
        <h4>Select your overall mood for the week! (Optional)</h4>
        <div className="mood-selector">
          {moods.map((m) => (
            <button
              key={m.id}
              className={`mood-btn ${selectedMood === m.id ? "selected" : ""}`}
              onClick={() => onMoodChange?.(m.id)}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="symptoms-section">
        <h4>Check the symptom that fits your current state! (Optional)</h4>

        <div className="symptoms-grid">
          {symptoms.map((symptom) => {
            const idStr = String(symptom.id);
            return (
              <label key={idStr} className="symptom-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(idStr)}
                  onChange={() => handleSymptomToggle(idStr)}
                />
                <span className="checkmark" />
                {symptom.label}
                {!symptom.isTemplate && <span className="custom-tag"> (Custom)</span>}
              </label>
            );
          })}
        </div>

        {/* Add Custom Symptom Button (optional) */}
        <button className="add-custom-btn" onClick={handleAddCustomSymptomClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Custom Symptom
        </button>

        {/* Popup for adding custom symptom (optional) */}
        {showInput && (
          <div className="symptom-popup-overlay">
            <div className="add-symptom-popup">
              <h5>Add a Custom Symptom</h5>
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="Enter custom symptom"
                className="custom-symptom-input"
              />
              <div className="symptom-popup-buttons">
                <button className="symptom-submit-btn" onClick={handleCustomSymptomSubmit}>
                  Add
                </button>
                <button className="symptom-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomsAndMood;
