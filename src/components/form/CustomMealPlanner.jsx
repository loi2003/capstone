import React, { useState, useRef, useEffect } from "react";
import { viewMealsSuggestion } from "../../apis/meal-api";
import { FaSyncAlt, FaInfoCircle, FaUtensils } from "react-icons/fa";
import "./CustomMealPlanner.css";
import { getCurrentUser } from "../../apis/authentication-api";

const CustomMealPlanner = () => {
  const [stage, setStage] = useState(1);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [type, setType] = useState("");
  const [numberOfDishes, setNumberOfDishes] = useState(1);

  const [allergies, setAllergies] = useState("");
  const [diseases, setDiseases] = useState("");
  const [preferredFood, setPreferredFood] = useState(""); // <-- maps to favouriteDishId

  const [activeImageIndices, setActiveImageIndices] = useState({});

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
  const [generatedMenus, setGeneratedMenus] = useState([]);
  const [savedDob, setSavedDob] = useState(""); // store from profile
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          if (response.data?.data?.dateOfBirth) {
            const formattedDob = response.data.data.dateOfBirth.split("T")[0];
            setDateOfBirth(formattedDob);
            setSavedDob(formattedDob);
          }
        } catch (error) {
          console.error("Failed to fetch user DOB:", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  // called after API returns data
  const handleApiSuccess = (menus) => {
    setGeneratedMenus(menus.slice(0, 2)); // first 2 menus
  };

  const handleNewMenu = () => {
    setGeneratedMenus([]);
    // optionally reset form too
  };

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

  const handleSubmit = async () => {
    if (!type) {
      setError("Please select a meal type.");
      return;
    }
    // if (!dateOfBirth) {
    //   setError("Please enter your date of birth.");
    //   return;
    // }
    setError("");

    const payload = {
      stage,
      dateOfBirth: savedDob || dateOfBirth || null,
      type,
      numberOfDishes,
      allergyIds: allergies ? [allergies] : [],
      diseaseIds: diseases ? [diseases] : [],
      favouriteDishId: preferredFood || null,
    };

    console.log("Submitting custom meal request:", payload);

    try {
      // Call API twice in parallel to get 2 different menus
      const [menu1, menu2] = await Promise.all([
        viewMealsSuggestion(payload),
        viewMealsSuggestion(payload),
      ]);

      const menus = [menu1, menu2].map((menu) => ({
        dishes: menu.data.dishes.map((d) => ({
          name: d.dishName,
          image:
            d.imageUrl ||
            "https://images.pexels.com/photos/30945514/pexels-photo-30945514.jpeg",
          calories: d.calories,
          description: d.description,
        })),
      }));

      setGeneratedMenus(menus);
    } catch (err) {
      console.error("Error generating menus", err);
      setError("Failed to generate menus.");
    }
  };

  const handleGenerateMore = async () => {
    if (generatedMenus.length >= 4) return; // max 4 menus

    try {
      const response = await viewMealsSuggestion({
        stage,
        dateOfBirth,
        type,
        numberOfDishes,
        allergyIds: allergies ? [allergies] : [],
        diseaseIds: diseases ? [diseases] : [],
        favouriteDishId: preferredFood || null,
      });

      const newMenu = {
        dishes: response.data.dishes.map((d) => ({
          name: d.dishName,
          image:
            d.imageUrl ||
            "https://images.pexels.com/photos/30945514/pexels-photo-30945514.jpeg",
          calories: d.calories,
          description: d.description,
        })),
      };

      setGeneratedMenus((prev) => [...prev, newMenu]);
    } catch (err) {
      console.error("Error fetching more menus:", err);
      setError("Could not fetch more menus.");
    }
  };

  const handleSetActiveImage = (menuIndex, imageIndex) => {
    setActiveImageIndices((prev) => ({
      ...prev,
      [menuIndex]: imageIndex,
    }));
  };

  useEffect(() => {
    const initialIndices = {};
    generatedMenus.forEach((menu, menuIndex) => {
      initialIndices[menuIndex] = 0; // Start with first image for each menu
    });
    setActiveImageIndices(initialIndices);
  }, [generatedMenus, numberOfDishes]);

  const [selectedMenu, setSelectedMenu] = useState(null);

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
      
      {generatedMenus.length > 0 && (
        <div className="custommealplanner-output">
          {selectedMenu ? (
            // 🔹 DETAILS VIEW
            <div className="custommealplanner-mealplanner-output">
              {(() => {
                const totalCalories =
                  selectedMenu.dishes?.reduce(
                    (sum, dish) => sum + (dish?.calories || 0),
                    0
                  ) || 0;

                return (
                  <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
                    Menu Details <br />
                    <span style={{ fontSize: "1.1rem" }}>
                      Total Calories: <strong>{totalCalories.toFixed(1)} kcal</strong>
                    </span>
                  </h2>
                );
              })()}

              <div className="custommealplanner-meal-card">
                <div className="custommealplanner-meal-dishes">
                  {selectedMenu.dishes?.map((dish, i) => (
                    <div key={i} className="custommealplanner-dish-card">
                      <img src={dish.image} alt={dish.name} />
                      <div className="custommealplanner-dish-info">
                        <h4>{dish.name}</h4>
                        <p>{dish.calories.toFixed(1)} kcal</p>
                        <div className="custommealplanner-meal-actions">
                          <button>
                            <FaInfoCircle /> Nutrition Information
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  className="custommealplanner-btn secondary"
                  onClick={() => setSelectedMenu(null)}
                >
                  Back to Menus
                </button>
              </div>
            </div>
          ) : (
            // 🔹 MENUS VIEW
            <>
              <div className="custommealplanner-menu-grid">
                {generatedMenus.map((menu, menuIndex) => {
                  const activeIdx = activeImageIndices[menuIndex] || 0;

                  return (
                    <div
                      key={menuIndex}
                      className="custommealplanner-menu-card"
                    >
                      <div className="custommealplanner-menu-header">
                        <span className="custommealplanner-menu-label">
                          Menu {menuIndex + 1}
                        </span>
                        <span className="custommealplanner-menu-counter">
                          {numberOfDishes} dishes
                        </span>
                      </div>

                      <div className="custommealplanner-menu-image-container">
                        <img
                          src={menu.dishes[activeIdx]?.image}
                          alt={menu.dishes[activeIdx]?.name}
                          className="custommealplanner-menu-main-image"
                        />

                        <div className="custommealplanner-carousel-dots">
                          {menu.dishes
                            .slice(0, numberOfDishes)
                            .map((dish, index) => (
                              <span
                                key={index}
                                className={`custommealplanner-dot ${
                                  index === activeIdx ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleSetActiveImage(menuIndex, index)
                                }
                              />
                            ))}
                        </div>
                      </div>

                      <h3 className="custommealplanner-menu-title">
                        {menu.dishes[activeIdx]?.name}
                      </h3>

                      <div className="custommealplanner-thumbnails">
                        {menu.dishes
                          .slice(0, numberOfDishes)
                          .map((dish, index) => (
                            <div
                              key={index}
                              className="custommealplanner-thumbnail-item"
                              onClick={() =>
                                handleSetActiveImage(menuIndex, index)
                              }
                            >
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className={`custommealplanner-thumbnail ${
                                  index === activeIdx ? "active" : ""
                                }`}
                              />
                            </div>
                          ))}
                      </div>

                      <button
                        className="custommealplanner-detail-btn"
                        onClick={() => setSelectedMenu(menu)}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="custommealplanner-menu-actions">
                {generatedMenus.length < 4 && (
                  <button
                    className="custommealplanner-btn secondary"
                    onClick={handleGenerateMore}
                  >
                    See More Menus
                  </button>
                )}
                <button
                  className="custommealplanner-btn primary"
                  onClick={handleNewMenu}
                >
                  Generate New Custom Menus
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomMealPlanner;
