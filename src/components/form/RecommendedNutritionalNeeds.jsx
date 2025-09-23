import React, { useState, useEffect } from "react";
import { editUserProfile, getCurrentUser } from "../../apis/authentication-api";
import { getEssentialNutritionalNeeds } from "../../apis/nutrient-suggestion-api";
import { formatDateForInput } from "../../utils/date";
import "./RecommendedNutritionalNeeds.css";
import LoadingOverlay from "../popup/LoadingOverlay";

const RecommendedNutritionalNeeds = () => {
  const [week, setWeek] = useState(1);
  const [dob, setDob] = useState("");
  const [activityLevel, setActivityLevel] = useState(1);
  const [savedDob, setSavedDob] = useState("");
  const [nutrients, setNutrients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await getCurrentUser(token);
          if (response.data?.data?.dateOfBirth) {
            const formattedDob = response.data.data.dateOfBirth.split("T")[0];
            setDob(formattedDob);
            setSavedDob(formattedDob);
          }
        } catch (error) {
          console.error("Failed to fetch user DOB:", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  const tooltipTexts = {
    "Total Demanded Energy":
      "From main food groups: Glucid, Protein, and Lipid",
    Protein: (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Meat from animals, Fish, and Seafood</li>
          <li>Legumes: Peanuts, Peas, Lentils</li>
          <li>Eggs and Products from eggs</li>
        </ul>
      </div>
    ),
    "Animal protein/ total protein ratio": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Animal Protein: Various Meat, Fish, Seafood, Eggs, and Products from
            eggs
          </li>
          <li>Plant Protein: Peanuts, Peas, Lentils</li>
        </ul>
      </div>
    ),
    Lipid: "From mainly Vegetable Oils and Nuts, Animal Fats",
    "Animal lipid/ total lipid ratio": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Animal Lipid: Pork Fat, Beef Fat, Fish Oil, ...</li>
          <li>Plant Lipid: Vegetable Oils, Nuts</li>
        </ul>
      </div>
    ),
    Glucid: (
      <div>
        From mainly this food group:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Cereal: Rice, Wheat, Oats, Corn</li>
        </ul>
      </div>
    ),
    Calcium: (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Milk, Cheese, Yogurt, ...</li>
          <li>
            Seafood like Shrimps, Crabs, and Oysters and Fish with edible bones
          </li>
          <li>
            Dark Green Leafy Vegetables like Katuk, Morning Glory or Jute, ...
          </li>
        </ul>
      </div>
    ),
    Iron: (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Oysters, Egg Yolk, Field Crab, Sea Crab, Shrimps, Fish, Milk, ...
          </li>
        </ul>
      </div>
    ),
    Zinc: (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Seafood, Fresh-Water Fish, Various of Meat, Vegetables, Legumes
          </li>
        </ul>
      </div>
    ),
    "Vitamin A": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Liver, Animal Fat, and Eggs</li>
          <li>
            Dark Green Leafy Vegetables like Katuk, Morning Glory or Jute, ...
          </li>
          <li>Carrots, Sweet Potatoes, Pumpkin, Bell Peppers, ...</li>
        </ul>
      </div>
    ),
    "Vitamin D": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Fish Liver Oil, Animal Fat, and Eggs with substituted Vitamin D, ...
          </li>
        </ul>
      </div>
    ),
    "Vitamin E": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Nuts, Seeds, Vegetable Oils, Green Leafy Vegetables like Kale or
            Spinach, ...
          </li>
        </ul>
      </div>
    ),
    "Vitamin K": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Green Leafy Vegetables, Fruits, Eggs, Cereal, Soybean Oil, Sunflower
            Oil, Animal Liver, ...
          </li>
        </ul>
      </div>
    ),
    "Vitamin B1": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Whole Grains, Rice Bran</li>
        </ul>
      </div>
    ),
    "Vitamin B2": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Viscera, Milk, Vegetables, Cheese, and Eggs</li>
        </ul>
      </div>
    ),
    "Vitamin B6": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>
            Fish (Especially Tuna), Chicken, Pork, Beef, Banana, Avocado, and
            Lettuce
          </li>
        </ul>
      </div>
    ),
    "Vitamin B9 (Folate)": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Aspagarus, Kale, Mustard Greens, ...</li>
          <li>Oranges, Strawberries, Pear, Watermelon, ...</li>
          <li>Legumes, Beans, ...</li>
        </ul>
      </div>
    ),
    "Vitamin C": (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Fruits and Leafy Greens</li>
        </ul>
      </div>
    ),
    Choline: (
      <div>
        From main food groups:
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li>Milk, Liver, Eggs, Legumes</li>
        </ul>
      </div>
    ),
  };
  // Custom display names for vitamins
  const vitaminDisplayNames = {
    folate: "Vitamin B9 (Folate)",
    vitaminA: "Vitamin A",
    vitaminD: "Vitamin D",
    vitaminE: "Vitamin E",
    vitaminK: "Vitamin K",
    vitaminB1: "Vitamin B1",
    vitaminB2: "Vitamin B2",
    vitaminB6: "Vitamin B6",
    vitaminB12: "Vitamin B12",
    vitaminC: "Vitamin C",
    choline: "Choline",
  };

  // Fallback: convert camelCase to Title Case
  const formatVitaminName = (key) => {
    if (vitaminDisplayNames[key]) return vitaminDisplayNames[key];
    // fallback: insert space before capital letters and capitalize
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  const formatName = (str) => {
    if (!str) return "";
    // Insert space before capital letters and capitalize first letters
    return str
      .replace(/([A-Z])/g, " $1") // Add space before uppercase
      .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNutrients([]);
    setLoading(true);

    if (!week) {
      setError("Please enter both gestational week and date of birth.");
      setLoading(false);
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--; 
    }

    if (age < 20) {
      setError("This feature is only available for users 20 years and older. Data is from 20+ years old mothers.");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting with values:", {
        week,
        dob,
        activityLevel,
        age,
      });

      const rawData = await getEssentialNutritionalNeeds({
        currentWeek: week,
        dateOfBirth: dob, 
        activityLevel: activityLevel || 1,
      });
      console.log("API data:", rawData);

      // Transform backend data into table format with capitalized names
      const formattedData = [
        {
          category: "Energy",
          items: [
            {
              name: "Total Demanded Energy",
              value: rawData.totalDemanedEnergy,
              unit: "kcal",
            },
          ],
        },
        {
          category: "P:L:G Substances",
          items: Object.keys(rawData.plgSubstances || {}).map((key) => ({
            name: formatName(key),
            value: rawData.plgSubstances[key].demand,
            unit: rawData.plgSubstances[key].unit,
          })),
        },
        {
          category: "Minerals",
          items: Object.keys(rawData.minerals || {}).map((key) => ({
            name: formatName(key),
            value: rawData.minerals[key].demand,
            unit: rawData.minerals[key].unit,
          })),
        },
        {
          category: "Vitamins",
          items: Object.keys(rawData.vitamins || {}).map((key) => ({
            name: formatVitaminName(key),
            value: rawData.vitamins[key].demand,
            unit: rawData.vitamins[key].unit,
          })),
        },
        {
          category: "Other Information",
          items: Object.keys(rawData.otherInformation || {}).map((key) => ({
            name: formatName(key),
            value: rawData.otherInformation[key].demand,
            unit: rawData.otherInformation[key].unit,
          })),
        },
      ];

      setNutrients(formattedData);
    } catch (err) {
      console.error("Error fetching nutritional needs:", err);
      setError("Failed to fetch nutritional needs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutritionalneeds-page">
      <LoadingOverlay show={loading} />
      <div className="nutritionalneeds-heading">
        <h1>Recommended Nutritional Needs</h1>
        <p>Enter your gestational week and date of birth to see your needs.</p>
      </div>

      <div className="nutritionalneeds-form-container">
        <form className="nutritionalneeds-form" onSubmit={handleSubmit}>
          <label>Gestational Week (Stage)</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            required
          >
            <option value="">-- Select Week --</option>
            {Array.from({ length: 40 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
          <label>Date of Birth (Optional)</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            // disabled={!!savedDob}
          />
          <label>Activity Level</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(Number(e.target.value))}
          >
            <option value={1}>1 (Light)</option>
            <option value={2}>2 (Moderate)</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Nutritional Needs"}
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {Array.isArray(nutrients) && nutrients.length > 0 && (
        <div className="nutritionalneeds-table-wrapper">
          <h2>Recommended Nutritional Needs for Week {week}</h2>
          <p>
            Below is the recommended nutrition needed in a day to support your
            pregnancy:
          </p>
          <table className="nutritionalneeds-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {nutrients.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  <tr className="category-row">
                    <td colSpan="3">{group.category}</td>
                  </tr>
                  {Array.isArray(group.items) &&
                    group.items.map((item, iIdx) => (
                      <tr key={iIdx}>
                        <td>
                          <div className="target-with-tooltip">
                            <span className="target-text">{item.name}</span>
                            {tooltipTexts[item.name] && (
                              <div className="tooltip-wrapper">
                                <span className="tooltip-icon">!</span>
                                <div className="tooltip-text">
                                  {tooltipTexts[item.name]}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{item.value}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecommendedNutritionalNeeds;
