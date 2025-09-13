import React, { useState, useRef, useEffect } from "react";
import "./SystemMealPlanner.css";
import { FaSyncAlt, FaInfoCircle, FaUtensils } from "react-icons/fa";
import { viewMenuSuggestionByTrimester } from "../../apis/meal-api";

const SystemMealPlanner = () => {
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [week, setWeek] = useState("Week 1");
  const [day, setDay] = useState("");
  const [allergies, setAllergies] = useState("");
  const [diseases, setDiseases] = useState("");
  const [preferredFoods, setPreferredFoods] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("day");
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const [showAllergyList, setShowAllergyList] = useState(false);
  const [showDiseaseList, setShowDiseaseList] = useState(false);
  const [showPreferredFoodList, setShowPreferredFoodList] = useState(false);

  const [weekViewMode, setWeekViewMode] = useState("list");
  // "list" | "dayDetail" | "mealDetail"
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [selectedMealDetail, setSelectedMealDetail] = useState(null);

  const handleViewDayDetail = (day) => {
    setSelectedMealDetail(null);
    setSelectedDayDetail(day);
    setWeekViewMode("dayDetail");
  };

  const handleViewMealDetail = (day, meal) => {
    setSelectedDayDetail(null);
    setSelectedMealDetail({ day, meal });
    setWeekViewMode("mealDetail");
  };

  const handleBackToWeek = () => {
    setSelectedDayDetail(null);
    setSelectedMealDetail(null);
    setWeekViewMode("list");
  };

  const allergyRef = useRef(null);
  const diseaseRef = useRef(null);
  const preferredFoodRef = useRef(null);

  // const allergyOptions = ["Peanuts", "Dairy", "Shellfish", "Gluten", "Soy"];
  // const diseaseOptions = [
  //   "Diabetes",
  //   "Hypertension",
  //   "Heart Disease",
  //   "Asthma",
  //   "Thyroid Disorder",
  // ];
  // const preferredFoodOptions = [
  //   "Salmon",
  //   "Spinach",
  //   "Chicken",
  //   "Avocado",
  //   "Broccoli",
  //   "Oats",
  //   "Eggs",
  //   "Tofu",
  //   "Blueberries",
  //   "Quinoa",
  //   // add more or load from API later
  // ];

  // Close dropdowns if clicked outside
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

  useEffect(() => {
    if (mode === "day") {
      setWeekViewMode("list");
      setSelectedDayDetail(null);
      setSelectedMealDetail(null);
      setError("");
      setGeneratedPlan(null); // clear results
    }

    if (mode === "week") {
      setDay("");
      setError("");
      setGeneratedPlan(null); // clear results here too
    }
  }, [mode]);

  const handleAllergySelect = (a) => {
    setAllergies(a);
    setShowAllergyList(false);
  };

  const handleDiseaseSelect = (d) => {
    setDiseases(d);
    setShowDiseaseList(false);
  };
  const handlePreferredFoodSelect = (food) => {
    setPreferredFoods(food);
    setShowPreferredFoodList(false);
  };

  // Reorder days: start from Monday
  const reorderDays = (days) => {
    const order = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.sort(
      (a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek)
    );
  };

  const handleGenerate = async () => {
    try {
      setError("");
      setGeneratedPlan(null);

      const weekNumber = parseInt(week.replace("Week ", ""), 10);
      const res = await viewMenuSuggestionByTrimester({ stage: weekNumber });
      const data = res?.data;

      if (!data?.days) {
        setError("No data returned for this week.");
        return;
      }

      // Reorder days so Monday is first
      const orderedDays = reorderDays(data.days);

      if (mode === "day") {
        const dayIndex = Number(day) - 1;
        const dayData = orderedDays[dayIndex];

        if (!dayData) {
          setError("No meal plan available for selected day.");
          return;
        }

        const transformedDay = dayData.meals.map((meal) => ({
          type: meal.mealType,
          dishes: meal.dishes
            .sort((a, b) => b.calories - a.calories) // sort dishes descending
            .map((dish) => ({
              name: dish.dishName,
              image:
                dish.imageUrl ||
                "https://images.pexels.com/photos/30945514/pexels-photo-30945514.jpeg",
              calories: Number(dish.calories.toFixed(1)),
            })),
        }));

        setGeneratedPlan(transformedDay);
      } else {
        const transformedWeek = orderedDays.map((day) => ({
          day: day.dayOfWeek,
          meals: day.meals.map((meal) => ({
            type: meal.mealType,
            dishes: meal.dishes
              .sort((a, b) => b.calories - a.calories) // sort dishes descending
              .map((dish) => ({
                name: dish.dishName,
                image:
                  dish.imageUrl ||
                  "https://images.pexels.com/photos/30945514/pexels-photo-30945514.jpeg",
                calories: Number(dish.calories.toFixed(1)),
              })),
          })),
        }));

        setGeneratedPlan(transformedWeek);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch meal suggestions. Please try again.");
    }
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [visibleDays, setVisibleDays] = useState(3); // Number of days visible at once

  // Handle responsive visible days count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleDays(1); // Mobile: show 1 day
      } else if (window.innerWidth < 1024) {
        setVisibleDays(2); // Tablet: show 2 days
      } else {
        setVisibleDays(3); // Desktop: show 3 days
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrevDay = () => {
    setCurrentDayIndex((prev) =>
      prev > 0 ? prev - 1 : Math.max(0, generatedPlan.length - visibleDays)
    );
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) =>
      prev < generatedPlan.length - visibleDays ? prev + 1 : 0
    );
  };
  useEffect(() => {
    if (day) {
      setGeneratedPlan(null); // clear old menu
    }
  }, [day]);

  return (
    <div className="mealplanner-page-wrapper">
      <div className="mealplanner-heading">
        <h1>System Meal Planner</h1>
        <p>Enter your details and choose to generate by day or by week.</p>
      </div>

      <div className="mealplanner-form">
        <label>Gestational Week  (Stage)</label>
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
        {/* <label>Allergies</label>
        <div className="mealplanner-autocomplete-wrapper" ref={allergyRef}>
          <input
            type="text"
            value={allergies}
            onChange={(e) => {
              setAllergies(e.target.value);
              setShowAllergyList(true);
            }}
            placeholder="Optional - Type to search for allergy e.g. peanuts"
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
        </div> */}

        {/* Disease autocomplete */}
        {/* <label>Chronic Diseases</label>
        <div className="mealplanner-autocomplete-wrapper" ref={diseaseRef}>
          <input
            type="text"
            value={diseases}
            onChange={(e) => {
              setDiseases(e.target.value);
              setShowDiseaseList(true);
            }}
            placeholder="Optional - Type to search for disease e.g. diabetes"
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
        </div> */}

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
              type="radio"
              checked={mode === "day"}
              onChange={() => setMode("day")}
            />
            Suggest by Day
          </label>

          <label>
            <input
              type="radio"
              checked={mode === "week"}
              onChange={() => setMode("week")}
            />
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
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((dayName, i) => (
                  <option key={i + 1} value={i + 1}>
                    {dayName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Preferred foods autocomplete */}
        {/* <label>Preferred Foods</label>
        <div
          className="mealplanner-autocomplete-wrapper"
          ref={preferredFoodRef}
        >
          <input
            type="text"
            value={preferredFoods}
            onChange={(e) => {
              setPreferredFoods(e.target.value);
              setShowPreferredFoodList(true);
            }}
            placeholder="Optional - Type to search e.g. salmon, spinach"
            className="mealplanner-input"
            onFocus={() => setShowPreferredFoodList(true)}
          />
          {showPreferredFoodList && preferredFoods && (
            <ul className="mealplanner-autocomplete-list">
              {preferredFoodOptions
                .filter((f) =>
                  f.toLowerCase().includes(preferredFoods.toLowerCase())
                )
                .map((f, i) => (
                  <li key={i} onClick={() => handlePreferredFoodSelect(f)}>
                    {f}
                  </li>
                ))}
            </ul>
          )}
        </div> */}
        <div className="mealplanner-btn-wrapper">
          <button className="mealplanner-btn" onClick={handleGenerate}>
            Suggest Meal Plan
          </button>
        </div>

        {error && (
          <p style={{ color: "#e74c3c", marginTop: "0.5rem" }}>{error}</p>
        )}
      </div>

      {/* Output */}
      {generatedPlan &&
        mode === "day" &&
        Array.isArray(generatedPlan) &&
        generatedPlan[0]?.dishes && (
          <div className="mealplanner-output">
            {(() => {
              const totalCalories = generatedPlan.reduce((mealSum, meal) => {
                return (
                  mealSum +
                  (meal?.dishes?.reduce(
                    (dishSum, dish) => dishSum + (dish?.calories || 0),
                    0
                  ) || 0)
                );
              }, 0);

              return (
                <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                  Suggested Meals for {week}
                  {day && ` - ${dayNames[day - 1]}`} <br />
                  <span style={{ fontSize: "1.1rem" }}>
                    Total Calories:{" "}
                    <strong>{totalCalories.toFixed(1)} kcal</strong>
                  </span>
                </h2>
              );
            })()}

            {generatedPlan.map((meal, idx) => (
              <div key={idx} className="meal-card">
                <div className="meal-header">
                  <h3>{meal.type}</h3>
                </div>
                <div className="meal-dishes">
                  {meal?.dishes?.map((dish, i) => (
                    <div key={i} className="dish-card">
                      <img src={dish.image} alt={dish.name} />
                      <div className="dish-info">
                        <h4>{dish.name}</h4>
                        <p>{dish.calories.toFixed(1)} kcal</p>
                        <div className="meal-actions">
                          {/* <button>
                            <FaSyncAlt /> Change Dish
                          </button> */}
                          {/* <button>
                            <FaInfoCircle /> Nutrition Information
                          </button> */}
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
          {weekViewMode === "list" && <h2>Weekly Suggested Meals</h2>}

          {/* Week List */}
          {weekViewMode === "list" &&
            generatedPlan?.map((day, idx) => (
              <div key={idx} className="week-day-card">
                <div className="week-day-header">
                  <div className="mealplanner-header-title">
                    <h3>{day.day}</h3>
                  </div>
                  <div className="header-action">
                    <button
                      className="mealplanner-btn"
                      onClick={() => handleViewDayDetail(day)}
                    >
                      View Detail
                    </button>
                  </div>
                </div>

                <div className="week-meal-grid">
                  {day?.meals?.map((m, i) => (
                    <div key={i} className="week-meal-card">
                      <img src={m.dishes?.[0]?.image} alt={m.type} />{" "}
                      <div className="mealplanner-detail-wrapper">
                        <h4>{m.type}</h4>
                        <button
                          className="mealplanner-detail-btn"
                          onClick={() => handleViewMealDetail(day, m)}
                        >
                          View Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Day Detail (looks like "by day" output) */}
          {/* Day Detail */}
          {weekViewMode === "dayDetail" && selectedDayDetail && (
            <div className="mealplanner-output">
              <div className="mealplanner-output-header"></div>
              {(() => {
                const totalCalories =
                  selectedDayDetail?.meals?.reduce((mealSum, meal) => {
                    const mealCalories =
                      meal?.dishes?.reduce(
                        (dishSum, dish) => dishSum + (dish?.calories || 0),
                        0
                      ) || 0;
                    return mealSum + mealCalories;
                  }, 0) || 0;

                return (
                  <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                    Meals for {selectedDayDetail?.day || "Unknown"} <br />
                    <span style={{ fontSize: "1.1rem" }}>
                      Total Calories:{" "}
                      <strong>{totalCalories.toFixed(1)} kcal</strong>
                    </span>
                  </h2>
                );
              })()}

              <div className="back-btn-wrapper">
                <button className="mealplanner-btn" onClick={handleBackToWeek}>
                  Back to Weekly Menu
                </button>
              </div>
              {selectedDayDetail?.meals?.map((meal, idx) => (
                <div key={idx} className="meal-card">
                  <div className="meal-header">
                    <h3>{meal.type}</h3>
                  </div>
                  <div className="meal-dishes">
                    {meal?.dishes?.map((dish, i) => (
                      <div key={i} className="dish-card">
                        <img src={dish.image} alt={dish.name} />
                        <div className="dish-info">
                          <h4>{dish.name}</h4>
                          <p>{dish.calories.toFixed(1)} kcal</p>
                          <div className="meal-actions">
                            {/* <button>
                              <FaSyncAlt /> Change Dish
                            </button> */}
                            {/* <button>
                              <FaInfoCircle /> Dish information
                            </button> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meal Detail */}
          {weekViewMode === "mealDetail" && selectedMealDetail && (
            <div className="mealplanner-output">
              {(() => {
                const totalCalories = selectedMealDetail.meal.dishes.reduce(
                  (sum, dish) => sum + dish.calories,
                  0
                );
                return (
                  <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                    {selectedMealDetail.day.day} –{" "}
                    {selectedMealDetail.meal.type} <br />
                    <span style={{ fontSize: "1.1rem" }}>
                      Total Calories:{" "}
                      <strong>{totalCalories.toFixed(1)} kcal</strong>
                    </span>
                  </h2>
                );
              })()}

              <div className="back-btn-wrapper">
                <button className="mealplanner-btn" onClick={handleBackToWeek}>
                  Back to Weekly Menu
                </button>
              </div>
              <div className="meal-card">
                <div className="meal-header">
                  <h3>{selectedMealDetail.meal.type}</h3>
                </div>
                <div className="meal-dishes">
                  {selectedMealDetail?.meal?.dishes?.map((dish, i) => (
                    <div key={i} className="dish-card">
                      <img src={dish.image} alt={dish.name} />
                      <div className="dish-info">
                        <h4>{dish.name}</h4>
                        <p>{dish.calories.toFixed(1)} kcal</p>
                        <div className="meal-actions">
                          {/* <button>
                            <FaSyncAlt /> Change Dish
                          </button> */}
                          {/* <button>
                            <FaInfoCircle /> Nutrition Information
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemMealPlanner;
