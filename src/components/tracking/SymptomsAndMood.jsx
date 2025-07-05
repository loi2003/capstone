"use client"

import { useState } from "react"
import "./SymptomsAndMood.css"

const SymptomsAndMood = ({ pregnancyData }) => {
  const [selectedMood, setSelectedMood] = useState("happy")
  const [selectedSymptoms, setSelectedSymptoms] = useState(["backache", "fatigue"])

  const moods = [
    { id: "terrible", emoji: "😢", label: "Terrible" },
    { id: "bad", emoji: "😞", label: "Bad" },
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "excited", emoji: "😍", label: "Excited" },
    { id: "anxious", emoji: "😰", label: "Anxious" },
  ]

  const symptoms = [
    { id: "backache", label: "Backache" },
    { id: "fatigue", label: "Fatigue" },
    { id: "heartburn", label: "Heartburn" },
    { id: "swelling", label: "Swelling" },
    { id: "braxton-hicks", label: "Braxton Hicks" },
    { id: "insomnia", label: "Insomnia" },
  ]

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  return (
    <div className="symptoms-and-mood">
      <div className="section-header">
        <h3>Symptoms & Mood History</h3>
        <button className="view-history-btn">View All History →</button>
      </div>

      <div className="mood-section">
        <h4>Today's Mood</h4>
        <div className="mood-selector">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-btn ${selectedMood === mood.id ? "selected" : ""}`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="symptoms-section">
        <h4>Track Your Symptoms</h4>
        <div className="symptoms-grid">
          {symptoms.map((symptom) => (
            <label key={symptom.id} className="symptom-checkbox">
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom.id)}
                onChange={() => handleSymptomToggle(symptom.id)}
              />
              <span className="checkmark"></span>
              {symptom.label}
            </label>
          ))}
        </div>
        <button className="add-custom-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Custom Symptom
        </button>
      </div>
    </div>
  )
}

export default SymptomsAndMood
