import React, { useEffect, useRef, useState } from "react";
import { viewFoodWarnings } from "../../apis/food-api";
import { viewAllAllergies } from "../../apis/allergy-api";
import { viewAllDiseases } from "../../apis/disease-api";
import "./FoodWarning.css";
import LoadingOverlay from "../popup/LoadingOverlay";

const FoodWarning = () => {
  const token = localStorage.getItem("token");

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdown state
  const [allergyOptions, setAllergyOptions] = useState([]);
  const [diseaseOptions, setDiseaseOptions] = useState([]);

  const [allergyInput, setAllergyInput] = useState("");
  const [diseaseInput, setDiseaseInput] = useState("");

  // store MULTIPLE selections
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);

  const [showAllergyList, setShowAllergyList] = useState(false);
  const [showDiseaseList, setShowDiseaseList] = useState(false);

  const allergyRef = useRef(null);
  const diseaseRef = useRef(null);

  // Fetch dropdown data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const allergyRes = await viewAllAllergies(token);
        setAllergyOptions(allergyRes.data.data || []);

        const diseaseRes = await viewAllDiseases(token);
        setDiseaseOptions(diseaseRes.data.data || []);
      } catch (err) {
        // console.error("Error fetching allergy/disease options:", err);
      }
    };
    fetchOptions();
  }, [token]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (allergyRef.current && !allergyRef.current.contains(e.target)) {
        setShowAllergyList(false);
      }
      if (diseaseRef.current && !diseaseRef.current.contains(e.target)) {
        setShowDiseaseList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    const payload = {
      allergyIds: selectedAllergies.map((a) => a.id),
      diseaseIds: selectedDiseases.map((d) => d.id),
    };
    // console.log("Submitting payload:", payload);

    if (payload.allergyIds.length === 0 && payload.diseaseIds.length === 0) {
      setError("Please select at least one allergy or disease.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await viewFoodWarnings(payload);
      console.log("API returned:", response);
      setFoods(response || []);
    } catch (err) {
      console.error("Failed to fetch food warnings:", err);
      setError("Unable to fetch food warnings.");
    } finally {
      setLoading(false);
      // console.log("Stopping loading");
    }
  };

  const handleRemoveAllergy = (id) => {
    setSelectedAllergies(selectedAllergies.filter((a) => a.id !== id));
  };

  const handleRemoveDisease = (id) => {
    setSelectedDiseases(selectedDiseases.filter((d) => d.id !== id));
  };

  return (
    <div className="foodwarning-wrapper">
      <LoadingOverlay show={loading} />
      <h1 className="foodwarning-title">
        Food Warnings
        <span>Find foods unsafe for your conditions</span>
      </h1>

      {/* Form Section */}
      <div className="foodwarning-form">
        {/* Allergies */}
        <label>Allergies</label>
        <div className="foodwarning-autocomplete-wrapper" ref={allergyRef}>
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => {
              setAllergyInput(e.target.value);
              setShowAllergyList(true);
            }}
            placeholder="Optional - Type allergy name e.g. Peanuts"
            onFocus={() => setShowAllergyList(true)}
            className="foodwarning-input"
          />
          {showAllergyList && allergyInput && (
            <ul className="foodwarning-autocomplete-list">
              {allergyOptions
                .filter(
                  (a) =>
                    a.name &&
                    a.name.toLowerCase().includes(allergyInput.toLowerCase())
                )
                .map((a) => (
                  <li
                    key={a.id}
                    onClick={() => {
                      if (!selectedAllergies.some((s) => s.id === a.id)) {
                        setSelectedAllergies([...selectedAllergies, a]);
                      }
                      setAllergyInput("");
                      setShowAllergyList(false);
                    }}
                  >
                    {a.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
        {/* Show selected allergies */}
        <div className="foodwarning-tags">
          {selectedAllergies.map((a) => (
            <span key={a.id} className="foodwarning-tag">
              {a.name}{" "}
              <button onClick={() => handleRemoveAllergy(a.id)}>✕</button>
            </span>
          ))}
        </div>

        {/* Diseases */}
        <label>Diseases</label>
        <div className="foodwarning-autocomplete-wrapper" ref={diseaseRef}>
          <input
            type="text"
            value={diseaseInput}
            onChange={(e) => {
              setDiseaseInput(e.target.value);
              setShowDiseaseList(true);
            }}
            placeholder="Optional - Type disease name e.g. Diabetes"
            onFocus={() => setShowDiseaseList(true)}
            className="foodwarning-input"
          />
          {showDiseaseList && diseaseInput && (
            <ul className="foodwarning-autocomplete-list">
              {diseaseOptions
                .filter(
                  (d) =>
                    d.name &&
                    d.name.toLowerCase().includes(diseaseInput.toLowerCase())
                )
                .map((d) => (
                  <li
                    key={d.id}
                    onClick={() => {
                      if (!selectedDiseases.some((s) => s.id === d.id)) {
                        setSelectedDiseases([...selectedDiseases, d]);
                      }
                      setDiseaseInput("");
                      setShowDiseaseList(false);
                    }}
                  >
                    {d.name}
                  </li>
                ))}
            </ul>
          )}
        </div>
        {/* Show selected diseases */}
        <div className="foodwarning-tags">
          {selectedDiseases.map((d) => (
            <span key={d.id} className="foodwarning-tag disease">
              {d.name}{" "}
              <button onClick={() => handleRemoveDisease(d.id)}>✕</button>
            </span>
          ))}
        </div>

        {/* Submit */}
        <div className="foodwarning-btn-wrapper">
          <button className="foodwarning-btn" onClick={handleSubmit}>
            View Food Warnings
          </button>
        </div>
      </div>

      {/* Results Section */}
      {!loading && Array.isArray(foods) && foods.length > 0 && (
        <div className="foodwarning-grid">
          {/* {foods.map((food, index) => (
            <div key={index} className="foodwarning-card">
              ...
            </div>
          ))} */}
        </div>
      )}

      {/* {!loading && Array.isArray(foods) && foods.length === 0 && (
        <p>No foods found for your selected conditions.</p>
      )} */}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && foods.length > 0 && (
        <div className="foodwarning-grid">
          {foods.map((food, index) => (
            <div key={index} className="foodwarning-card">
              <img
                src={
                  food.imageUrl ||
                  "https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg"
                }
                alt={food.name}
                className="foodwarning-image"
              />
              <div className="foodwarning-info">
                <h3>{food.name}</h3>
                <p className="foodwarning-description">
                  {food.foodDescription}
                </p>

                <p>
                  <strong>Pregnancy Safe:</strong>{" "}
                  {food.pregnancySafe ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Safety Note:</strong> {food.safetyNote}
                </p>

                {/* Allergies */}
                {food.foodAllergy?.length > 0 && (
                  <div className="foodwarning-section allergy">
                    <h4>Allergy Risks</h4>
                    <ul>
                      {food.foodAllergy.map((a) => (
                        <li key={a.id}>
                          <strong>{a.allergyName} Allergy:</strong> {a.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Diseases */}
                {food.foodDisease?.length > 0 && (
                  <div className="foodwarning-section disease">
                    <h4>Disease Warnings</h4>
                    <ul>
                      {food.foodDisease.map((d) => (
                        <li key={d.id}>
                          <strong>{d.diseaseName}</strong> ({d.status}) –{" "}
                          {d.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodWarning;
