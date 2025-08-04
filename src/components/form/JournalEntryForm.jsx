import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createJournalEntry, editJournalEntry, getJournalById } from "../../apis/journal-api";
import "./JournalEntryForm.css";

const JournalEntryForm = ({ onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Id: "",
    CurrentWeek: "",
    Note: "",
    CurrentWeight: "",
    MoodNotes: "",
    SymptomNames: [],
    RelatedImages: [],
    UltraSoundImages: [],
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState({
    RelatedImages: [],
    UltraSoundImages: [],
  });
  const token = localStorage.getItem("token");
  const growthDataId = new URLSearchParams(location.search).get("growthDataId");
  const entryId = new URLSearchParams(location.search).get("entryId");

  useEffect(() => {
    console.log("GrowthDataId:", growthDataId);
    console.log("UserId:", localStorage.getItem("userId"));
    console.log("Token:", token);
    if (entryId && token) {
      fetchJournalEntry();
    }
  }, [entryId, token]);

  const fetchJournalEntry = async () => {
    try {
      const response = await getJournalById(entryId, token);
      if (response.data?.error === 0 && response.data?.data) {
        const entry = response.data.data;
        setFormData({
          Id: entry.id || "",
          CurrentWeek: entry.currentWeek || "",
          Note: entry.note || "",
          CurrentWeight: entry.currentWeight || "",
          MoodNotes: entry.mood || "",
          SymptomNames: entry.symptomNames || [],
          RelatedImages: entry.relatedImages || [],
          UltraSoundImages: entry.ultraSoundImages || [],
        });
        setImagePreviews({
          RelatedImages: entry.relatedImages?.map(img => img.url || "") || [],
          UltraSoundImages: entry.ultraSoundImages?.map(img => img.url || "") || [],
        });
      } else {
        setErrors({ submit: response.data?.message || "Failed to fetch journal entry" });
        onError?.(response.data?.message || "Failed to fetch journal entry");
      }
    } catch (error) {
      console.error("Failed to fetch journal entry:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch journal entry";
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files) {
      const fileList = Array.from(files).slice(0, 2);
      const newFiles = fileList.filter(file => file.size <= 5 * 1024 * 1024);
      const updatedFiles = [...formData[name], ...newFiles].slice(0, 2);
      setFormData((prev) => {
        const newData = { ...prev, [name]: updatedFiles };
        console.log("Updated formData (files):", newData);
        return newData;
      });
      const previews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => ({
        ...prev,
        [name]: [...prev[name], ...previews].slice(0, 2),
      }));
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        console.log("Updated formData:", newData);
        return newData;
      });
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSymptomsChange = (e) => {
    const symptoms = e.target.value.split(",").map((s) => s.trim()).filter((s) => s);
    setFormData((prev) => ({
      ...prev,
      SymptomNames: symptoms,
    }));
    if (errors.SymptomNames) {
      setErrors((prev) => ({ ...prev, SymptomNames: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.CurrentWeek || isNaN(Number(formData.CurrentWeek)) || Number(formData.CurrentWeek) < 1 || Number(formData.CurrentWeek) > 40) {
      newErrors.CurrentWeek = "Current week must be a number between 1 and 40";
    }
    if (!formData.Note) {
      newErrors.Note = "Note is required";
    }
    if (formData.CurrentWeight && (isNaN(Number(formData.CurrentWeight)) || Number(formData.CurrentWeight) < 30 || Number(formData.CurrentWeight) > 200)) {
      newErrors.CurrentWeight = "Current weight must be a number between 30 and 200 kg";
    }
    console.log("FormData before validation:", formData);
    console.log("Validation Errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const userId = localStorage.getItem("userId");
  if (!growthDataId) {
    setErrors({ submit: "GrowthDataId is missing" });
    onError?.("GrowthDataId is missing");
    return;
  }
  if (!userId) {
    setErrors({ submit: "UserId is missing. Please log in." });
    onError?.("UserId is missing. Please log in.");
    return;
  }

  const journalData = {
    ...formData,
    UserId: userId,
    GrowthDataId: growthDataId,
  };

  try {
    const response = entryId
      ? await editJournalEntry(journalData, token)
      : await createJournalEntry(journalData, token);

    console.log("API Response:", response);
    if (response.data?.error !== 0) {
      throw new Error(response.data?.message || "Failed to submit journal entry");
    }

    navigate(`/pregnancy-tracking/journal-section?growthDataId=${growthDataId}`);
  } catch (error) {
    console.error("Error submitting journal entry:", error);
    const errorMessage = error.response?.data?.message || "Failed to submit journal entry";
    setErrors({ submit: errorMessage });
    onError?.(errorMessage);
  }
};


  return (
    <div className="journal-entry-form">
      <div className="form-header">
        <h3>{entryId ? "Edit Journal Entry" : "Add Journal Entry"}</h3>
      </div>
      <div className="form-content">
        <div className="form-section">
          <label htmlFor="currentWeek">Current Week *</label>
          <input
            type="number"
            id="currentWeek"
            name="CurrentWeek"
            value={formData.CurrentWeek}
            onChange={handleChange}
            min="1"
            max="40"
            className={errors.CurrentWeek ? "error" : ""}
          />
          {errors.CurrentWeek && <span className="error-message">{errors.CurrentWeek}</span>}
        </div>
        <div className="form-section">
          <label htmlFor="note">Note *</label>
          <textarea
            id="note"
            name="Note"
            value={formData.Note}
            onChange={handleChange}
            className={errors.Note ? "error" : ""}
          />
          {errors.Note && <span className="error-message">{errors.Note}</span>}
        </div>
        <div className="form-section">
          <label htmlFor="currentWeight">Current Weight (kg)</label>
          <input
            type="number"
            id="currentWeight"
            name="CurrentWeight"
            value={formData.CurrentWeight}
            onChange={handleChange}
            min="30"
            max="200"
            step="0.1"
            placeholder="Optional"
            className={errors.CurrentWeight ? "error" : ""}
          />
          {errors.CurrentWeight && <span className="error-message">{errors.CurrentWeight}</span>}
        </div>
        <div className="form-section">
          <label htmlFor="moodNotes">Mood & Feelings</label>
          <select
            id="moodNotes"
            name="MoodNotes"
            value={formData.MoodNotes}
            onChange={handleChange}
            placeholder="Optional"
          >
            <option value="">Select Mood</option>
            <option value="1">Normal</option>
            <option value="2">Neutral</option>
            <option value="3">Happy</option>
            <option value="4">Sad</option>
            <option value="5">Angry</option>
            <option value="6">Excited</option>
          </select>
        </div>
        <div className="form-section">
          <label htmlFor="symptomNames">Symptoms (comma-separated)</label>
          <input
            type="text"
            id="symptomNames"
            name="SymptomNames"
            value={formData.SymptomNames.join(", ")}
            onChange={handleSymptomsChange}
            placeholder="e.g., nausea, fatigue"
          />
        </div>
        <div className="form-section">
          <label htmlFor="relatedImages">Related Images</label>
          <input
            type="file"
            id="relatedImages"
            name="RelatedImages"
            onChange={handleChange}
            multiple
            accept="image/*"
          />
          {imagePreviews.RelatedImages.length > 0 && (
            <div className="image-preview">
              {imagePreviews.RelatedImages.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
              ))}
              <span>{formData.RelatedImages.length} / 2 images selected</span>
            </div>
          )}
        </div>
        <div className="form-section">
          <label htmlFor="ultraSoundImages">Ultrasound Images</label>
          <input
            type="file"
            id="ultraSoundImages"
            name="UltraSoundImages"
            onChange={handleChange}
            multiple
            accept="image/*"
          />
          {imagePreviews.UltraSoundImages.length > 0 && (
            <div className="image-preview">
              {imagePreviews.UltraSoundImages.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
              ))}
              <span>{formData.UltraSoundImages.length} / 2 images selected</span>
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button className="submit-btn" onClick={handleSubmit} disabled={!token}>
          {entryId ? "Update" : "Add New Entry"}
        </button>
        <button className="cancel-btn" onClick={() => navigate(`/pregnancy-tracking?growthDataId=${growthDataId}`)}>
          Cancel
        </button>
      </div>
      {errors.submit && <span className="error-message">{errors.submit}</span>}
    </div>
  );
};

export default JournalEntryForm;