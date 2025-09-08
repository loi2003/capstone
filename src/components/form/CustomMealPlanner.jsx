import React, { useState, useRef, useEffect } from "react";
import "./CustomMealPlanner.css";

const CustomMealPlanner = () => {
  const [stage, setStage] = useState(1);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [type, setType] = useState("");
  const [numberOfDishes, setNumberOfDishes] = useState(1);

  const [allergies, setAllergies] = useState("");
  const [diseases, setDiseases] = useState("");
  const [preferredFood, setPreferredFood] = useState(""); // <-- maps to favouriteDishId

  const [error, setError] = useState("");

  // Dropdown control
  const [showAllergyList, setShowAllergyList] = useState(false);
  const [showDiseaseList, setShowDiseaseList] = useState(false);
  const [showPreferredFoodList, setShowPreferredFoodList] = useState(false);

  const allergyRef = useRef(null);
  const diseaseRef = useRef(null);
  const preferredFoodRef = useRef(null);

  const allergyOptions = ["Peanuts", "Dairy", "Shellfish", "Gluten", "Soy"];
  const diseaseOptions = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Asthma",
    "Thyroid Disorder",
  ];
  const preferredFoodOptions = [
    "Salmon",
    "Spinach",
    "Chicken",
    "Avocado",
    "Broccoli",
    "Oats",
    "Eggs",
    "Tofu",
    "Blueberries",
    "Quinoa",
  ];

  // close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (allergyRef.current && !allergyRef.current.contains(e.target)) {
        setShowAllergyList(false);
      }
      if (diseaseRef.current && !diseaseRef.current.contains(e.target)) {
        setShowDiseaseList(false);
      }
      if (
        preferredFoodRef.current &&
        !preferredFoodRef.current.contains(e.target)
      ) {
        setShowPreferredFoodList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // dish limit logic
  const getMaxDishes = (mealType) => {
    switch (mealType) {
      case "Breakfast":
        return 2;
      case "Lunch":
      case "Dinner":
        return 3;
      case "Snack1":
      case "Snack2":
        return 1;
      default:
        return 1;
    }
  };

  useEffect(() => {
    if (type) {
      const max = getMaxDishes(type);
      if (numberOfDishes > max) {
        setNumberOfDishes(max);
      }
    }
  }, [type]);

  const handleSubmit = () => {
    if (!type) {
      setError("Please select a meal type.");
      return;
    }
    if (!dateOfBirth) {
      setError("Please enter your date of birth.");
      return;
    }
    setError("");

    console.log("Submitting custom meal request:", {
      stage,
      dateOfBirth,
      type,
      numberOfDishes,
      allergyIds: allergies ? [allergies] : [],
      diseaseIds: diseases ? [diseases] : [],
      favouriteDishId: preferredFood || null, // <-- map preferred food here
    });
  };

  return (
    <div className="custommealplanner-page-wrapper">
      <div className="custommealplanner-heading">
        <h1>Custom Meal Planner</h1>
        <p>Create and manage your own custom meal plans here.</p>
      </div>

      <div className="custommealplanner-form">
        {/* Stage */}
        <label>Gestational Week (Stage)</label>
        <select
          value={stage}
          onChange={(e) => setStage(Number(e.target.value))}
          className="custommealplanner-select"
        >
          {Array.from({ length: 40 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Week {i + 1}
            </option>
          ))}
        </select>

        {/* DOB */}
        <label>Date of Birth</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="custommealplanner-input"
        />

        {/* Type */}
        <label>Meal Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="custommealplanner-select"
        >
          <option value="">-- Select a Type --</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snack1">Snack 1</option>
          <option value="Snack2">Snack 2</option>
        </select>

        {/* Number of Dishes */}
        <label>Number of Dishes</label>
        <select
          value={numberOfDishes}
          onChange={(e) => setNumberOfDishes(Number(e.target.value))}
          className="custommealplanner-select"
          disabled={!type} // disable until type is selected
        >
          <option value="">-- Select number of dishes --</option>
          {Array.from({ length: getMaxDishes(type) }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        {/* <small style={{ color: "#666" }}>
          Max dishes for {type || "selected type"}: {getMaxDishes(type)}
        </small> */}

        {/* Allergies */}
        <label>Allergies</label>
        <div
          className="custommealplanner-autocomplete-wrapper"
          ref={allergyRef}
        >
          <input
            type="text"
            value={allergies}
            onChange={(e) => {
              setAllergies(e.target.value);
              setShowAllergyList(true);
            }}
            placeholder="Optional - Type to search e.g. peanuts"
            className="custommealplanner-input"
            onFocus={() => setShowAllergyList(true)}
          />
          {showAllergyList && allergies && (
            <ul className="custommealplanner-autocomplete-list">
              {allergyOptions
                .filter((a) =>
                  a.toLowerCase().includes(allergies.toLowerCase())
                )
                .map((a, i) => (
                  <li key={i} onClick={() => setAllergies(a)}>
                    {a}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Diseases */}
        <label>Chronic Diseases</label>
        <div
          className="custommealplanner-autocomplete-wrapper"
          ref={diseaseRef}
        >
          <input
            type="text"
            value={diseases}
            onChange={(e) => {
              setDiseases(e.target.value);
              setShowDiseaseList(true);
            }}
            placeholder="Optional - Type to search e.g. diabetes"
            className="custommealplanner-input"
            onFocus={() => setShowDiseaseList(true)}
          />
          {showDiseaseList && diseases && (
            <ul className="custommealplanner-autocomplete-list">
              {diseaseOptions
                .filter((d) => d.toLowerCase().includes(diseases.toLowerCase()))
                .map((d, i) => (
                  <li key={i} onClick={() => setDiseases(d)}>
                    {d}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Preferred Foods (maps to favouriteDishId) */}
        <label>Preferred Food</label>
        <div
          className="custommealplanner-autocomplete-wrapper"
          ref={preferredFoodRef}
        >
          <input
            type="text"
            value={preferredFood}
            onChange={(e) => {
              setPreferredFood(e.target.value);
              setShowPreferredFoodList(true);
            }}
            placeholder="Optional - Type to search e.g. salmon, spinach"
            className="custommealplanner-input"
            onFocus={() => setShowPreferredFoodList(true)}
          />
          {showPreferredFoodList && preferredFood && (
            <ul className="custommealplanner-autocomplete-list">
              {preferredFoodOptions
                .filter((f) =>
                  f.toLowerCase().includes(preferredFood.toLowerCase())
                )
                .map((f, i) => (
                  <li key={i} onClick={() => setPreferredFood(f)}>
                    {f}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <div className="custommealplanner-btn-wrapper">
          <button className="custommealplanner-btn" onClick={handleSubmit}>
            Submit Custom Plan
          </button>
        </div>

        {error && (
          <p style={{ color: "#e74c3c", marginTop: "0.5rem" }}>{error}</p>
        )}
      </div>
    </div>
  );
};

export default CustomMealPlanner;
