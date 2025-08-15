import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { editJournalEntry, getJournalById } from "../../apis/journal-api";
import { getSymptomsForUser } from "../../apis/recorded-symptom-api";
import "./JournalEntryForm.css";
import SymptomsAndMood from "../tracking/SymptomsAndMood";
import { FaImage } from "react-icons/fa";

const EditJournalEntryForm = ({ onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const entryId = new URLSearchParams(location.search).get("entryId");
  const growthDataId = new URLSearchParams(location.search).get("growthDataId");

  const [formData, setFormData] = useState({
    Id: "",
    CurrentWeek: "",
    Note: "",
    CurrentWeight: "",
    MoodNotes: "",
    SymptomNames: [],
    SymptomIds: [], // Will store names because backend doesn't give IDs
    RelatedImages: [],
    UltraSoundImages: [],
  });

  const [imagePreviews, setImagePreviews] = useState({
    RelatedImages: [],
    UltraSoundImages: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entryId && token) {
      fetchJournalEntry();
    }
  }, [entryId, token]);

  const fetchJournalEntry = async () => {
    try {
      const res = await getJournalById(entryId, token);
      if (res.data?.error === 0 && res.data?.data) {
        const entry = res.data.data;

        // Fetch available symptoms for the user
        const symptomsRes = await getSymptomsForUser(
          localStorage.getItem("userId"),
          token
        );
        const availableSymptoms = symptomsRes.data?.data || [];

        // Map symptom names from journal entry to their IDs
        const symptomNames = entry.symptoms?.map((s) => s.symptomName) || [];
        const symptomIds = availableSymptoms
          .filter((sym) =>
            symptomNames.some(
              (name) =>
                name.trim().toLowerCase() ===
                sym.symptomName.trim().toLowerCase()
            )
          )
          .map((sym) => String(sym.id));

        setFormData({
          Id: entry.id || "",
          CurrentWeek: entry.currentWeek || "",
          Note: entry.note || "",
          CurrentWeight: entry.currentWeight || "",
          MoodNotes: (entry.mood || "").trim().toLowerCase(),
          SymptomIds: symptomIds, // IDs for SymptomsAndMood
          SymptomNames: symptomNames, // Keep names for submit
          RelatedImages: entry.relatedImages || [],
          UltraSoundImages: entry.ultraSoundImages || [],
        });

        setImagePreviews({
          RelatedImages:
            entry.relatedImages?.map((img) =>
              typeof img === "string" ? img : img.url
            ) || [],
          UltraSoundImages:
            entry.ultraSoundImages?.map((img) =>
              typeof img === "string" ? img : img.url
            ) || [],
        });
      } else {
        const msg = res.data?.message || "Failed to load journal entry";
        setErrors({ submit: msg });
        onError?.(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load journal entry";
      setErrors({ submit: msg });
      onError?.(msg);
    }
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files) {
      const fileList = Array.from(files).slice(0, 2);
      const previews = fileList.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, [name]: fileList }));
      setImagePreviews((prev) => ({ ...prev, [name]: previews }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    try {
      const res = await editJournalEntry(
        { ...formData, UserId: userId, GrowthDataId: growthDataId },
        token
      );
      if (res.data?.error === 0) {
        navigate(
          `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
        );
      } else {
        throw new Error(res.data?.message || "Update failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      setErrors({ submit: msg });
      onError?.(msg);
    }
  };

  return (
    <div className="journal-entry-form">
      <div className="entry-form-header">
        <h3>Edit Journal Entry</h3>
        <button
          className="header-entry-cancel-btn"
          onClick={() =>
            navigate(
              `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
            )
          }
        >
          Back
        </button>
      </div>

      <div className="entry-form-content">
        {/* Current Week - locked */}
        <div className="entry-form-section">
          <label>Gestation Week</label>
          <input type="text" value={`Week ${formData.CurrentWeek}`} disabled />
        </div>

        {/* Note */}
        <div className="entry-form-section">
          <label>
            Note <span className="must-enter-info">*</span>
          </label>
          <textarea name="Note" value={formData.Note} onChange={handleChange} />
        </div>

        {/* Weight */}
        <div className="entry-form-section">
          <label>Current Weight (Kg)</label>
          <input
            type="number"
            name="CurrentWeight"
            value={formData.CurrentWeight}
            onChange={handleChange}
          />
        </div>

        {/* Mood + Symptoms */}
        <SymptomsAndMood
          selectedMood={formData.MoodNotes}
          onMoodChange={(mood) =>
            setFormData((prev) => ({ ...prev, MoodNotes: mood }))
          }
          selectedSymptoms={formData.SymptomIds}
          onSymptomsChange={(ids, names) =>
            setFormData((prev) => ({
              ...prev,
              SymptomIds: ids ?? prev.SymptomIds,
              SymptomNames: names ?? prev.SymptomNames,
            }))
          }
          userId={localStorage.getItem("userId")}
          token={token}
        />

        {/* Related Images */}
        <div className="entry-form-section">
          <label>Related Images</label>
          <div className="file-upload-wrapper">
            <label htmlFor="RelatedImages" className="custom-file-upload">
              <FaImage /> Upload Related Images
            </label>
            <input
              id="RelatedImages"
              name="RelatedImages"
              type="file"
              onChange={handleChange}
              multiple
              accept="image/*"
            />
          </div>
          {imagePreviews.RelatedImages.length > 0 && (
            <div className="image-preview">
              {imagePreviews.RelatedImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`preview-${idx}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
        </div>

        {/* Ultrasound Images */}
        <div className="entry-form-section">
          <label>Ultrasound Images</label>
          <div className="file-upload-wrapper">
            <label htmlFor="UltraSoundImages" className="custom-file-upload">
              <FaImage /> Upload Ultrasound Images
            </label>
            <input
              id="UltraSoundImages"
              name="UltraSoundImages"
              type="file"
              onChange={handleChange}
              multiple
              accept="image/*"
            />
          </div>
          {imagePreviews.UltraSoundImages.length > 0 && (
            <div className="image-preview">
              {imagePreviews.UltraSoundImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`preview-${idx}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="entry-form-actions">
        <button className="entry-submit-btn" onClick={handleSubmit}>
          Update
        </button>
        <button
          className="entry-cancel-btn"
          onClick={() =>
            navigate(
              `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
            )
          }
        >
          Cancel
        </button>
      </div>

      {errors.submit && <span className="error-message">{errors.submit}</span>}
    </div>
  );
};

export default EditJournalEntryForm;
