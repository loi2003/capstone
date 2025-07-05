"use client"

import { useState } from "react"
import "./TrimesterChecklists.css"

const TrimesterChecklists = ({ pregnancyData }) => {
  const [activeTab, setActiveTab] = useState("second")
  const [checkedItems, setCheckedItems] = useState(["anatomy-scan", "childbirth-classes"])

  const checklists = {
    first: [
      { id: "prenatal-vitamins", label: "Start taking prenatal vitamins" },
      { id: "first-appointment", label: "Schedule first prenatal appointment" },
      { id: "lifestyle-changes", label: "Make healthy lifestyle changes" },
      { id: "insurance-check", label: "Check insurance coverage" },
    ],
    second: [
      { id: "anatomy-scan", label: "Schedule anatomy scan ultrasound" },
      { id: "childbirth-classes", label: "Start researching childbirth classes" },
      { id: "glucose-test", label: "Schedule glucose screening test" },
      { id: "nursery-planning", label: "Start planning nursery" },
      { id: "baby-registry", label: "Create baby registry" },
      { id: "pediatrician-research", label: "Research pediatricians" },
    ],
    third: [
      { id: "hospital-bag", label: "Pack hospital bag" },
      { id: "birth-plan", label: "Create birth plan" },
      { id: "car-seat", label: "Install car seat" },
      { id: "maternity-leave", label: "Arrange maternity leave" },
      { id: "newborn-essentials", label: "Stock up on newborn essentials" },
    ],
  }

  const handleItemToggle = (itemId) => {
    setCheckedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const getTabLabel = (tab) => {
    const labels = {
      first: "First Trimester",
      second: "Second Trimester",
      third: "Third Trimester",
    }
    return labels[tab]
  }

  return (
    <div className="trimester-checklists">
      <h3>Trimester Checklists</h3>

      <div className="checklist-tabs">
        {Object.keys(checklists).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="checklist-content">
        <div className="checklist-items">
          {checklists[activeTab].map((item) => (
            <label key={item.id} className="checklist-item">
              <input
                type="checkbox"
                checked={checkedItems.includes(item.id)}
                onChange={() => handleItemToggle(item.id)}
              />
              <span className="checkmark"></span>
              <span className="item-label">{item.label}</span>
            </label>
          ))}
        </div>

        <button className="add-custom-task-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Custom Task
        </button>
      </div>
    </div>
  )
}

export default TrimesterChecklists
