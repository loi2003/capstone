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

    const updatedSymptoms = [...symptoms, newSymptom];
    setSymptoms(updatedSymptoms);

    const updatedIds = [...selectedIds, newId];
    const updatedNames = updatedSymptoms
      .filter((sym) => updatedIds.includes(String(sym.id)))
      .map((sym) => sym.label);

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
