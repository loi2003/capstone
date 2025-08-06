"use client";

import { useEffect, useState } from "react";
import "./TrimesterChecklists.css";
import { getAllCustomChecklistsByGrowthData } from "../../apis/custom-checklist-api";
import { getAllChecklistProgressForGrowthData } from "../../apis/template-checklist-api";

const TrimesterChecklists = ({ growthDataId, token }) => {
  const [activeTab, setActiveTab] = useState("second");
  const [templateChecklists, setTemplateChecklists] = useState([]);
  const [customChecklists, setCustomChecklists] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!growthDataId || !token) return;

    setLoading(true);
    try {
      const [templateRes, customRes] = await Promise.all([
        getAllChecklistProgressForGrowthData(growthDataId, token),
        getAllCustomChecklistsByGrowthData(growthDataId, token),
      ]);

      setTemplateChecklists(templateRes.data?.data || []);
      setCustomChecklists(customRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [growthDataId, token]);

  const handleItemToggle = (itemId) => {
    const updated = templateChecklists.map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setTemplateChecklists(updated);
  };

  const getTabLabel = (tab) => {
    const labels = {
      first: "First Trimester",
      second: "Second Trimester",
      third: "Third Trimester",
    };
    return labels[tab];
  };

  const filterChecklistsByTrimester = (checklists, trimester) =>
    checklists.filter((item) => item.trimester === trimester);

  if (!growthDataId || !token) {
    return <p>Missing tracking information. Please try again later.</p>;
  }

  return (
    <div className="trimester-checklists">
      <h3>Trimester Checklists</h3>

      <div className="checklist-tabs">
        {["first", "second", "third"].map((tab) => (
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
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="checklist-section">
              <h4 className="section-header">Things you will experience in the future! </h4>
              <div className="checklist-items">
                {filterChecklistsByTrimester(templateChecklists, tabToNumber(activeTab)).map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleItemToggle(item.id)}
                    />
                    <span className="checkmark"></span>
                    <span className="item-label">{item.taskName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="checklist-section">
              <h4 className="section-header">Your Custom Checklists</h4>
              <div className="checklist-items">
                {filterChecklistsByTrimester(customChecklists, tabToNumber(activeTab)).map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleItemToggle(item.id)}
                    />
                    <span className="checkmark"></span>
                    <span className="item-label">{item.taskName}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="add-custom-task-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Custom Task
        </button>
      </div>
    </div>
  );
};

export default TrimesterChecklists;

const tabToNumber = (tab) => {
  switch (tab) {
    case "first":
      return 1;
    case "second":
      return 2;
    case "third":
      return 3;
    default:
      return 0;
  }
};
