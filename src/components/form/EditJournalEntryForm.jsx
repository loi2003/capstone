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
    SymptomIds: [],
    RelatedImages: [],
    UltraSoundImages: [],
    SystolicBP: "",
    DiastolicBP: "",
    HeartRateBPM: "",
    BloodSugarLevelMgDl: "",
  });

  const [allSymptoms, setAllSymptoms] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({
    RelatedImages: [],
    UltraSoundImages: [],
  });

  const [errors, setErrors] = useState({});
  const ultrasoundClinicWeeks = [12, 20, 28, 36];
  const bloodTestClinicWeeks = [4, 12, 24, 28];

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

        const symptomsRes = await getSymptomsForUser(
          localStorage.getItem("userId"),
          token
        );
        const availableSymptoms = (symptomsRes.data?.data || []).map((s) => ({
          id: String(s.id),
          name: s.symptomName.trim(),
          isTemplate: !!s.isTemplate,
        }));
        setAllSymptoms(availableSymptoms);

        const entrySymptomNames =
          entry.symptoms?.map((s) => s.symptomName.trim()) || [];

        const entrySymptomIds = Array.from(
          new Set(
            entrySymptomNames
              .map((name) => {
                const templateMatch = availableSymptoms.find(
                  (sym) =>
                    sym.name.toLowerCase() === name.toLowerCase() &&
                    sym.isTemplate
                );
                if (templateMatch) return templateMatch.id;
                const anyMatch = availableSymptoms.find(
                  (sym) => sym.name.toLowerCase() === name.toLowerCase()
                );
                return anyMatch ? anyMatch.id : null;
              })
              .filter(Boolean)
          )
        );

        setFormData({
          Id: entry.id || "",
          CurrentWeek: entry.currentWeek || "",
          Note: entry.note || "",
          CurrentWeight: entry.currentWeight || "",
          MoodNotes: (entry.mood || "").trim().toLowerCase(),
          SymptomIds: entrySymptomIds,
          RelatedImages: entry.relatedImages || [],
          UltraSoundImages: entry.ultraSoundImages || [],
          SystolicBP: entry.systolicBP || "",
          DiastolicBP: entry.diastolicBP || "",
          HeartRateBPM: entry.heartRateBPM || "",
          BloodSugarLevelMgDl: entry.bloodSugarLevelMgDl || "",
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

    const selectedNames = allSymptoms
      .filter((sym) => formData.SymptomIds.includes(sym.id))
      .map((sym) => sym.name);

    try {
      const res = await editJournalEntry(
        {
          ...formData,
          UserId: userId,
          GrowthDataId: growthDataId,
          SymptomNames: selectedNames,
        },
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
        {/* Gestation Week */}
        <div className="entry-form-section">
          <label>
            Gestation Week<span className="must-enter-info">* (Required)</span>
          </label>
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
          <label>
            Current Weight (Kg)
            <span className="must-enter-info">* (Required)</span>
          </label>
          <input
            type="number"
            name="CurrentWeight"
            value={formData.CurrentWeight}
            onChange={handleChange}
          />
        </div>

        {/* Blood Pressure */}
        <div className="entry-form-group">
          <h4 className="entry-form-title">Blood Pressure</h4>
          <div className="entry-form-section">
            <label>
              Systolic (mmHg)
              <span
                className="entry-info-tooltip"
                title="Systolic BP normally sits at 90-120 mmHg."
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              name="SystolicBP"
              placeholder="Optional - Need to enter both Systolic and Diastolic BP to track blood pressure"
              value={formData.SystolicBP}
              onChange={handleChange}
            />
          </div>
          <div className="entry-form-section" style={{ marginTop: "1rem" }}>
            <label>
              Diastolic (mmHg)
              <span
                className="entry-info-tooltip"
                title="Diastolic BP normally sits at 60-90 mmHg."
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              name="DiastolicBP"
              value={formData.DiastolicBP}
              placeholder="Optional - Need to enter both Systolic and Diastolic BP to track blood pressure"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Heart Rate */}
        <div className="entry-form-section">
          <label>
            Heart Rate (BPM)
            <span
              className="entry-info-tooltip"
              title="Heart rate is typically between 60-100 BPM. Enter if you've checked recently."
            >
              ⓘ
            </span>
          </label>
          <input
            type="number"
            name="HeartRateBPM"
            value={formData.HeartRateBPM}
            placeholder="Optional - Can enter if you want to track heart rate"
            onChange={handleChange}
          />
        </div>

        {/* Blood Sugar – only on clinic weeks */}
        {bloodTestClinicWeeks.includes(Number(formData.CurrentWeek)) && (
          <div className="entry-form-section">
            <label>Blood Sugar (mg/dL)</label>
            <input
              type="number"
              name="BloodSugarLevelMgDl"
              value={formData.BloodSugarLevelMgDl}
              placeholder="Optional - Need to enter both Systolic and Diastolic BP to track blood pressure"
              onChange={handleChange}
            />
          </div>
        )}

        {/* Symptoms + Mood */}
        <SymptomsAndMood
          selectedMood={formData.MoodNotes}
          onMoodChange={(mood) =>
            setFormData((prev) => ({ ...prev, MoodNotes: mood }))
          }
          selectedSymptoms={formData.SymptomIds}
          onSymptomsChange={(ids) =>
            setFormData((prev) => ({
              ...prev,
              SymptomIds: ids ?? prev.SymptomIds,
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

        {/* Ultrasound Images – only on clinic weeks */}
        {ultrasoundClinicWeeks.includes(Number(formData.CurrentWeek)) && (
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
        )}
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
