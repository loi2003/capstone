import React, { useState, useRef, useEffect } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "./SystemMealPlanner.css";
import { FaSyncAlt, FaInfoCircle, FaUtensils } from "react-icons/fa";

const SystemMealPlanner = () => {
  const [week, setWeek] = useState("Week 1");
  const [day, setDay] = useState("");
  const [allergies, setAllergies] = useState("");
  const [diseases, setDiseases] = useState("");
  const [preferredFoods, setPreferredFoods] = useState("");
  const [mode, setMode] = useState("day");
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const [showAllergyList, setShowAllergyList] = useState(false);
  const [showDiseaseList, setShowDiseaseList] = useState(false);

  const allergyRef = useRef(null);
  const diseaseRef = useRef(null);

  const allergyOptions = ["Peanuts", "Dairy", "Shellfish", "Gluten", "Soy"];
  const diseaseOptions = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Asthma",
    "Thyroid Disorder",
  ];

  // Close dropdowns if clicked outside
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

  const handleAllergySelect = (a) => {
    setAllergies(a);
    setShowAllergyList(false);
  };

  const handleDiseaseSelect = (d) => {
    setDiseases(d);
    setShowDiseaseList(false);
  };

  const staticMealsDay = [
    {
      type: "Breakfast",
      dishes: [
        {
          name: "Grilled Cheese Sandwich",
          image: "https://picsum.photos/200/120?1",
          calories: 250,
        },
        {
          name: "Avocado",
          image: "https://picsum.photos/200/120?2",
          calories: 120,
        },
        {
          name: "Milk",
          image: "https://picsum.photos/200/120?3",
          calories: 150,
        },
      ],
    },
    {
      type: "Lunch",
      dishes: [
        {
          name: "Grilled Salmon",
          image: "https://picsum.photos/200/120?4",
          calories: 350,
        },
        {
          name: "Brown Rice",
          image: "https://picsum.photos/200/120?5",
          calories: 200,
        },
      ],
    },
    {
      type: "Dinner",
      dishes: [
        {
          name: "Chicken Soup",
          image: "https://picsum.photos/200/120?6",
          calories: 300,
        },
        {
          name: "Spinach Salad",
          image: "https://picsum.photos/200/120?7",
          calories: 100,
        },
      ],
    },
    {
      type: "Snack",
      dishes: [
        {
          name: "Greek Yogurt",
          image: "https://picsum.photos/200/120?8",
          calories: 180,
        },
      ],
    },
  ];

  // Static weekly meal
  const staticMealsWeek = [
    {
      day: "Monday",
      meals: [
        { type: "Breakfast", image: "https://picsum.photos/200/120?10" },
        { type: "Lunch", image: "https://picsum.photos/200/120?11" },
        { type: "Dinner", image: "https://picsum.photos/200/120?12" },
        { type: "Snack 1", image: "https://picsum.photos/200/120?13" },
        { type: "Snack 2", image: "https://picsum.photos/200/120?18" },
      ],
    },
    {
      day: "Tuesday",
      meals: [
        { type: "Breakfast", image: "https://picsum.photos/200/120?14" },
        { type: "Lunch", image: "https://picsum.photos/200/120?15" },
        { type: "Dinner", image: "https://picsum.photos/200/120?16" },
        { type: "Snack 1", image: "https://picsum.photos/200/120?17" },
        { type: "Snack 2", image: "https://picsum.photos/200/120?18" },
      ],
    },
  ];

  const handleGenerate = () => {
    setGeneratedPlan(mode === "day" ? staticMealsDay : staticMealsWeek);
  };

  return (
    <div className="mealplanner-page-wrapper">
      <Header />

      <div className="mealplanner-heading">
        <h1>System Meal Planner</h1>
        <p>Enter your details and choose to generate by day or by week.</p>
      </div>

      <div className="mealplanner-form">
        <label>Gestational Week</label>
        <select
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="mealplanner-select"
        >
          {Array.from({ length: 40 }, (_, i) => (
            <option key={i}>Week {i + 1}</option>
          ))}
        </select>

        {/* Allergy autocomplete */}
        <label>Allergies</label>
        <div className="mealplanner-autocomplete-wrapper" ref={allergyRef}>
          <input
            type="text"
            value={allergies}
            onChange={(e) => {
              setAllergies(e.target.value);
              setShowAllergyList(true);
            }}
            placeholder="Type to search allergy..."
            className="mealplanner-input"
            onFocus={() => setShowAllergyList(true)}
          />
          {showAllergyList && allergies && (
            <ul className="mealplanner-autocomplete-list">
              {allergyOptions
                .filter((a) =>
                  a.toLowerCase().includes(allergies.toLowerCase())
                )
                .map((a, i) => (
                  <li key={i} onClick={() => handleAllergySelect(a)}>
                    {a}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Disease autocomplete */}
        <label>Chronic Diseases</label>
        <div className="mealplanner-autocomplete-wrapper" ref={diseaseRef}>
          <input
            type="text"
            value={diseases}
            onChange={(e) => {
              setDiseases(e.target.value);
              setShowDiseaseList(true);
            }}
            placeholder="Type to search disease..."
            className="mealplanner-input"
            onFocus={() => setShowDiseaseList(true)}
          />
          {showDiseaseList && diseases && (
            <ul className="mealplanner-autocomplete-list">
              {diseaseOptions
                .filter((d) => d.toLowerCase().includes(diseases.toLowerCase()))
                .map((d, i) => (
                  <li key={i} onClick={() => handleDiseaseSelect(d)}>
                    {d}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Toggle Day/Week with checkboxes */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
            alignItems: "center",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={mode === "day"}
              onChange={() => setMode("day")}
            />{" "}
            Suggest by Day
          </label>

          <label>
            <input
              type="checkbox"
              checked={mode === "week"}
              onChange={() => setMode("week")}
            />{" "}
            Suggest by Week
          </label>
        </div>

        {/* Show day dropdown if "day" is checked */}
        {mode === "day" && (
          <div style={{ marginTop: "1rem" }}>
            <label>
              Select Day:{" "}
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="mealplanner-select"
              >
                <option value="">-- Choose a Day --</option>
                {[...Array(7)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Day {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <label>Preferred Foods</label>
        <input
          type="text"
          placeholder="e.g. salmon, spinach"
          value={preferredFoods}
          onChange={(e) => setPreferredFoods(e.target.value)}
          className="mealplanner-input"
        />

        <button className="mealplanner-btn" onClick={handleGenerate}>
          Generate Meal Plan
        </button>
      </div>

      {/* Output */}
      {generatedPlan && mode === "day" && (
        <div className="mealplanner-output">
          <h2>
            Suggested Meals for {week}
            {day && ` - Day ${day}`}
          </h2>
          {generatedPlan.map((meal, idx) => (
            <div key={idx} className="meal-card">
              <div className="meal-header">
                <h3>{meal.type}</h3>
              </div>
              <div className="meal-dishes">
                {meal.dishes.map((dish, i) => (
                  <div key={i} className="dish-card">
                    <img src={dish.image} alt={dish.name} />
                    <div className="dish-info">
                      <h4>{dish.name}</h4>
                      <p>{dish.calories} kcal</p>
                      <div className="meal-actions">
                        <button>
                          <FaSyncAlt /> Change
                        </button>
                        <button>
                          <FaInfoCircle /> Info
                        </button>
                        <button>
                          <FaUtensils /> Recipe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {generatedPlan && mode === "week" && (
        <div className="mealplanner-output">
          <h2>Weekly Suggested Meals</h2>
          {generatedPlan.map((day, idx) => (
            <div key={idx} className="week-day-card">
              <div className="week-day-header">
                <h3>{day.day}</h3>
                <button className="mealplanner-btn">View Detail</button>
              </div>
              <div className="week-meal-grid">
                {day.meals.map((m, i) => (
                  <div key={i} className="week-meal-card">
                    <img src={m.image} alt={m.type} />
                    <h4>{m.type}</h4>
                    <button className="mealplanner-detail-btn">
                      View Detail
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SystemMealPlanner;
