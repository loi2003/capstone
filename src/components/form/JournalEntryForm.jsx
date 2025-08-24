import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createJournalEntry,
  editJournalEntry,
  getJournalById,
} from "../../apis/journal-api";
import "./JournalEntryForm.css";
import SymptomsAndMood from "../tracking/SymptomsAndMood";
import { getCurrentWeekGrowthData } from "../../apis/growthdata-api";
import { getJournalByGrowthDataId } from "../../apis/journal-api";
import { FaImage, FaTimes, FaEye } from "react-icons/fa";

const JournalEntryForm = ({ onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [formData, setFormData] = useState({
    Id: "",
    CurrentWeek: "",
    Note: "",
    CurrentWeight: "",
    MoodNotes: "",
    SymptomNames: [],
    SymptomIds: [],
    RelatedImages: [],
    UltraSoundImages: [],
  });
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState({
    RelatedImages: [],
    UltraSoundImages: [],
  });
  const [modalImage, setModalImage] = useState(null);
  const [modalImageType, setModalImageType] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(null);

  const token = localStorage.getItem("token");
  const growthDataId = new URLSearchParams(location.search).get("growthDataId");
  const entryId = new URLSearchParams(location.search).get("entryId");
  const ultrasoundClinicWeeks = [12, 20, 28, 36]; // adjust as needed
  const bloodTestClinicWeeks = [4, 12, 24, 28]; // adjust as needed

  useEffect(() => {
    console.log("GrowthDataId:", growthDataId);
    console.log("UserId:", localStorage.getItem("userId"));
    console.log("Token:", token);
    if (entryId && token) {
      fetchJournalEntry();
    }
    fetchAvailableWeeks();
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
          CurrentWeight: entry.currentWeight || null,
          MoodNotes: entry.moodNotes || entry.mood || "",
          SymptomIds:
            entry.symptoms?.map((s) => s.id) || entry.symptomIds || [],
          SymptomNames:
            entry.symptoms?.map((s) => s.name) || entry.symptomNames || [],
          RelatedImages: entry.relatedImages || [],
          UltraSoundImages: entry.ultraSoundImages || [],
        });

        setImagePreviews({
          RelatedImages:
            entry.relatedImages?.map(
              (img) => (typeof img === "string" ? img : img.url) || ""
            ) || [],
          UltraSoundImages:
            entry.ultraSoundImages?.map(
              (img) => (typeof img === "string" ? img : img.url) || ""
            ) || [],
        });
      } else {
        const msg = response.data?.message || "Failed to fetch journal entry";
        setErrors({ submit: msg });
        onError?.(msg);
      }
    } catch (error) {
      console.error("Failed to fetch journal entry:", error);
      const msg =
        error.response?.data?.message || "Failed to fetch journal entry";
      setErrors({ submit: msg });
      onError?.(msg);
    }
  };

  const fetchAvailableWeeks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const currentDate = new Date().toISOString().split("T")[0];

      const response = await getCurrentWeekGrowthData(
        userId,
        currentDate,
        token
      );
      const journalRes = await getJournalByGrowthDataId(growthDataId, token);

      const currentWeek =
        response?.data?.data?.currentGestationalAgeInWeeks || 1;
      setCurrentWeek(currentWeek);
      const documentedWeeks =
        journalRes?.data?.data?.map((entry) => entry.currentWeek) || [];

      const weeks = [];
      for (let i = 1; i <= currentWeek; i++) {
        if (!documentedWeeks.includes(i)) {
          weeks.push(i);
        }
      }
      setAvailableWeeks(weeks);

      // Preselect the latest available week
      if (!entryId) {
        setFormData((prev) => ({ ...prev, CurrentWeek: weeks.at(-1) || "" }));
      }
    } catch (err) {
      console.error("Failed to fetch week availability", err);
    }
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (files) {
      const fileList = Array.from(files).slice(0, 2);
      const newFiles = fileList.filter((file) => file.size <= 5 * 1024 * 1024);
      const updatedFiles = [...formData[name], ...newFiles].slice(0, 2);
      setFormData((prev) => {
        const newData = { ...prev, [name]: updatedFiles };
        console.log("Updated formData (files):", newData);
        return newData;
      });
      const previews = newFiles.map((file) => URL.createObjectURL(file));

      setImagePreviews((prev) => ({
        ...prev,
        [name]: [...prev[name], ...previews].slice(0, 2),
      }));

      // Reset the file input to allow re-uploading after removal
      e.target.value = "";
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

  const handleRemoveImage = (type, index) => {
    // Clean up object URLs to prevent memory leaks
    const previewUrl = imagePreviews[type][index];
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormData((prev) => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return { ...prev, [type]: updated };
    });

    setImagePreviews((prev) => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return { ...prev, [type]: updated };
    });

    // Close modal if the removed image was being viewed
    if (modalImageType === type && modalImageIndex === index) {
      closeModal();
    }
  };

  const openImageModal = (imageSrc, type, index) => {
    setModalImage(imageSrc);
    setModalImageType(type);
    setModalImageIndex(index);
  };

  const closeModal = () => {
    setModalImage(null);
    setModalImageType(null);
    setModalImageIndex(null);
  };

  const replaceImage = (type, index) => {
    // Create a temporary file input to select new image
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file && file.size <= 5 * 1024 * 1024) {
        // Clean up old object URL
        const oldPreviewUrl = imagePreviews[type][index];
        if (oldPreviewUrl && oldPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(oldPreviewUrl);
        }

        // Update form data
        setFormData((prev) => {
          const updated = [...prev[type]];
          updated[index] = file;
          return { ...prev, [type]: updated };
        });

        // Update preview
        const newPreview = URL.createObjectURL(file);
        setImagePreviews((prev) => {
          const updated = [...prev[type]];
          updated[index] = newPreview;
          return { ...prev, [type]: updated };
        });

        // Update modal if it's currently showing this image
        setModalImage(newPreview);
      } else if (file) {
        alert("File size must be less than 5MB");
      }
    };

    input.click();
  };

  const handleSymptomsChange = (e) => {
    const symptoms = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
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

    if (
      !formData.CurrentWeek ||
      isNaN(Number(formData.CurrentWeek)) ||
      Number(formData.CurrentWeek) < 1 ||
      Number(formData.CurrentWeek) > 40
    ) {
      newErrors.CurrentWeek = "Current week must be a number between 1 and 40";
    }

    if (!formData.Note) {
      newErrors.Note = "Note is required";
    }

    if (
      formData.CurrentWeight &&
      (isNaN(Number(formData.CurrentWeight)) ||
        Number(formData.CurrentWeight) < 30 ||
        Number(formData.CurrentWeight) > 200)
    ) {
      newErrors.CurrentWeight =
        "Current weight must be a number between 30 and 200 kg";
    }

    // ✅ New Blood Pressure validation
    if (
      (formData.SystolicBP && !formData.DiastolicBP) ||
      (!formData.SystolicBP && formData.DiastolicBP)
    ) {
      newErrors.BloodPressure =
        "Both Systolic and Diastolic BP must be entered together.";
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
      if (!response.data || response.data.error > 0) {
        throw new Error(
          response.data?.message || "Failed to submit journal entry"
        );
      }

      navigate(
        `/pregnancy-tracking?growthDataId=${growthDataId}&journalinfo=true`
      );
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit journal entry";
      setErrors({ submit: errorMessage });
      onError?.(errorMessage);
    }
  };

  const ImagePreviewSection = ({ type, label }) => (
    <div className="entry-form-section">
      <label htmlFor={type.toLowerCase()}>{label} (Optional)</label>
      <div className="file-upload-wrapper">
        <label htmlFor={type.toLowerCase()} className="custom-file-upload">
          <FaImage /> Upload {label}
        </label>
        <input
          type="file"
          id={type.toLowerCase()}
          name={type}
          onChange={handleChange}
          multiple
          accept="image/*"
        />
      </div>
      {/* Preview */}
      {imagePreviews[type].length > 0 && (
        <div className="journal-entry-image-preview">
          {imagePreviews[type].map((preview, index) => (
            <div key={index} className="journal-entry-preview-wrapper">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="journal-entry-preview-image"
                onClick={() => openImageModal(preview, type, index)}
                style={{ cursor: "pointer" }}
              />
              {/* <button
                type="button"
                className="journal-entry-view-image-btn"
                onClick={() => openImageModal(preview, type, index)}
                title="View full size"
              >
                <FaEye />
              </button>
              <button
                type="button"
                className="journal-entry-remove-image-btn"
                onClick={() => handleRemoveImage(type, index)}
                title="Remove image"
              >
                <FaTimes />
              </button> */}
            </div>
          ))}
          <span>{formData[type].length} / 2 images selected</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="journal-entry-form">
      <div className="entry-form-header">
        <h3>{entryId ? "Edit Journal Entry" : "Add Journal Entry"}</h3>
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
        <div className="entry-form-section">
          <label htmlFor="currentWeek">
            Select Week to Document
            <span className="must-enter-info">* (Required)</span>
          </label>
          <select
            id="currentWeek"
            name="CurrentWeek"
            value={formData.CurrentWeek}
            onChange={handleChange}
            className={errors.CurrentWeek ? "error" : ""}
          >
            <option value="">-- Select Journalised Gestation Week --</option>
            {availableWeeks.map((week) => (
              <option key={week} value={week}>
                Week {week}
                {currentWeek === week ? " (Current Week)" : ""}
              </option>
            ))}
          </select>
          {errors.CurrentWeek && (
            <span className="error-message">{errors.CurrentWeek}</span>
          )}
        </div>

        <div className="entry-form-section">
          <label htmlFor="note">
            Note
            <span className="must-enter-info">* (Required)</span>
          </label>
          <textarea
            type="text"
            id="note"
            name="Note"
            value={formData.Note}
            onChange={handleChange}
            placeholder="Write your thoughts, feelings, or any updates for this week"
            className={errors.Note ? "error" : ""}
          />
          {errors.Note && <span className="error-message">{errors.Note}</span>}
        </div>
        <div className="entry-form-section">
          <label htmlFor="currentWeight">
            Current Weight (Kg)
            <span className="must-enter-info">* (Required)</span>
          </label>
          <input
            type="number"
            id="currentWeight"
            name="CurrentWeight"
            value={formData.CurrentWeight || ""}
            onChange={handleChange}
            min="30"
            max="200"
            step="0.1"
            placeholder="Enter the weight that you last weighed yourself!"
            className={errors.CurrentWeight ? "error" : ""}
          />
          {errors.CurrentWeight && (
            <span className="error-message">{errors.CurrentWeight}</span>
          )}
        </div>
        <div className="entry-form-group">
          <h4 className="entry-form-title">Blood Pressure Tracking</h4>

          <div className="entry-form-section">
            <label htmlFor="systolicBP">
              Systolic (mmHg)
              <span
                className="entry-info-tooltip"
                title="Normal range is 90-140 mmHg. Enter if you've checked recently."
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              id="systolicBP"
              name="SystolicBP"
              value={formData.SystolicBP || ""}
              onChange={handleChange}
              min="50"
              max="250"
              placeholder="Optional - Enter if you want to track blood pressure"
              className={errors.BloodPressure ? "error" : ""}
            />
          </div>

          <div className="entry-form-section" style={{ marginTop: "1rem" }}>
            <label htmlFor="diastolicBP">
              Diastolic (mmHg)
              <span
                className="entry-info-tooltip"
                title="Normal range is 60-90 mmHg. Enter if you've checked recently."
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              id="diastolicBP"
              name="DiastolicBP"
              value={formData.DiastolicBP || ""}
              onChange={handleChange}
              min="30"
              max="150"
              placeholder="Optional - Enter if you want to track blood pressure"
              className={errors.BloodPressure ? "error" : ""}
            />
            {errors.BloodPressure && (
              <span className="error-message">{errors.BloodPressure}</span>
            )}
          </div>
        </div>
        <div className="entry-form-section journal-entry-info-note">
          <p>
            blood pressure tracking is optional, but it's recommended to monitor it during pregnancy. Please ensure both systolic and diastolic values are entered together for accurate tracking.
          </p>
        </div>

        <div className="entry-form-section">
          <label htmlFor="heartRateBPM">
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
            id="heartRateBPM"
            name="HeartRateBPM"
            value={formData.HeartRateBPM || ""}
            onChange={handleChange}
            min="30"
            max="200"
            placeholder="Optional - Can enter if you want to track heart rate"
          />
        </div>

        

        {/* Blood Sugar Level - only on clinic weeks */}
        {bloodTestClinicWeeks.includes(Number(formData.CurrentWeek)) && (
          <div className="entry-form-section">
            <label htmlFor="bloodSugarLevelMgDl">
              Blood Sugar Level (mg/dL)
              <span
                className="entry-info-tooltip"
                title="Blood sugar level is typically between 70-130 mg/dL before meals"
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              id="bloodSugarLevelMgDl"
              name="BloodSugarLevelMgDl"
              value={formData.BloodSugarLevelMgDl || ""}
              onChange={handleChange}
              min="30"
              max="500"
              placeholder="Optional - Enter if you've checked recently."
            />
          </div>
        )}
        {!bloodTestClinicWeeks.includes(Number(formData.CurrentWeek)) && (
        <div className="entry-form-section journal-entry-info-note">
          <p>
            blood sugar tracking is only available on clinic weeks (4, 12, 24, 28). It's highly recommended to monitor it to prevent pregnancy diabetes.
          </p>
        </div>
      )}

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

        <ImagePreviewSection type="RelatedImages" label="Related Images" />
        {/* Ultrasound Images - only on clinic weeks */}
        {ultrasoundClinicWeeks.includes(Number(formData.CurrentWeek)) && (
          <ImagePreviewSection
            type="UltraSoundImages"
            label="Ultrasound Images"
          />
        )}
      </div>
      {!ultrasoundClinicWeeks.includes(Number(formData.CurrentWeek)) && (
        <div className="entry-form-section journal-entry-info-note">
          <p>
            Ultrasound tracking is only available on clinic weeks (12, 20, 28, 36).
          </p>
        </div>
      )}

      <div className="entry-form-actions">
        <button
          className="entry-submit-btn"
          onClick={handleSubmit}
          disabled={!token}
        >
          {entryId ? "Update" : "Add New Entry"}
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

      {/* Image Preview Modal */}
      {modalImage && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-modal-header">
              <h4>
                {modalImageType === "RelatedImages"
                  ? "Related Image"
                  : "Ultrasound Image"}{" "}
                ({modalImageIndex + 1})
              </h4>
              <button className="image-modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="image-modal-body">
              <img src={modalImage} alt="Full size preview" />
            </div>
            <div className="image-modal-actions">
              <button
                className="image-modal-replace-btn"
                onClick={() => replaceImage(modalImageType, modalImageIndex)}
              >
                Replace Image
              </button>
              <button
                className="image-modal-remove-btn"
                onClick={() => {
                  handleRemoveImage(modalImageType, modalImageIndex);
                  closeModal();
                }}
              >
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryForm;
