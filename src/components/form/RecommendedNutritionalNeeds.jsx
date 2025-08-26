import React, { useState, useEffect } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { editUserProfile } from "../../apis/authentication-api";
// import { getEssentialNutritionalNeeds } from "../../apis/nutrient-suggestion-api";
import "./RecommendedNutritionalNeeds.css";

const RecommendedNutritionalNeeds = () => {
  const [week, setWeek] = useState(1);
  const [dob, setDob] = useState("");
  const [savedDob, setSavedDob] = useState("");
  const [nutrients, setNutrients] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedDob = localStorage.getItem("userDOB");
    if (storedDob) {
      setSavedDob(storedDob);
      setDob(storedDob);
    }
  }, []);
  const tooltipTexts = {
    "Total Demanded Energy": "From main food groups: Glucid, Protein, and Lipid",
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
        <li>Animal Protein: Various Meat, Fish, Seafood, Eggs, and Products from eggs</li>
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
        <li>Seafood like Shrimps, Crabs, and Oysters and Fish with edible bones</li>
        <li>Dark Green Leafy Vegetables like Katuk, Morning Glory or Jute, ...</li>
      </ul>
    </div>
  ),
  Iron: (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Oysters, Egg Yolk, Field Crab, Sea Crab, Shrimps, Fish, Milk, ...</li>
      </ul>
    </div>
  ),
  Zinc: (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Seafood, Fresh-Water Fish, Various of Meat, Vegetables, Legumes</li>
      </ul>
    </div>
  ),
  "Vitamin A": (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Liver, Animal Fat, and Eggs</li>
        <li>Dark Green Leafy Vegetables like Katuk, Morning Glory or Jute, ...</li>
        <li>Carrots, Sweet Potatoes, Pumpkin, Bell Peppers, ...</li>
      </ul>
    </div>
  ),
  "Vitamin D": (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Fish Liver Oil, Animal Fat, and Eggs with substituted Vitamin D, ...</li>
      </ul>
    </div>
  ),
  "Vitamin E": (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Nuts, Seeds, Vegetable Oils, Green Leafy Vegetables like Kale or Spinach, ...</li>
      </ul>
    </div>
  ),
  "Vitamin K": (
    <div>
      From main food groups:
      <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
        <li>Green Leafy Vegetables, Fruits, Eggs, Cereal, Soybean Oil, Sunflower Oil, Animal Liver, ...</li>
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
        <li>Fish (Especially Tuna), Chicken, Pork, Beef, Banana, Avocado, and Lettuce</li>
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
  )
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If DOB changed, update profile
      if (dob && dob !== savedDob) {
        await editUserProfile({ dateOfBirth: dob });
        localStorage.setItem("userDOB", dob);
        setSavedDob(dob);
      }

      // ---- TEMP STATIC DATA ----
      const staticData = [
        {
          category: "Energy",
          items: [
            {
              name: "Total Demanded Energy",
              value: "1978 - 2082",
              unit: "kcal/day",
            },
          ],
        },
        {
          category: "Ratio of P:L:G in a meal and throughout the day",
          items: [
            { name: "Protein", value: "13 - 20", unit: "%" },
            {
              name: "Animal protein/ total protein ratio",
              value: "≥ 35",
              unit: "%",
            },
            { name: "Lipid", value: "25 - 30", unit: "%" },
            {
              name: "Animal lipid/ total lipid ratio",
              value: "≤ 60",
              unit: "%",
            },
            { name: "Glucid", value: "55 - 65", unit: "%" },
          ],
        },
        {
          category: "Minerals",
          items: [
            { name: "Calcium", value: "720 - 960", unit: "mg/day" },
            { name: "Iron", value: "41.1", unit: "mg/day" },
            { name: "Zinc", value: "10", unit: "mg/day" },
            { name: "Iodine", value: "220", unit: "µg/day" },
          ],
        },
        {
          category: "Vitamin",
          items: [
            { name: "Vitamin A", value: "650", unit: "µg/day" },
            { name: "Vitamin D", value: "20", unit: "µg/day" },
            { name: "Vitamin E", value: "6.5", unit: "mg/day" },
            { name: "Vitamin K", value: "150", unit: "µg/day" },
            { name: "Vitamin B1", value: "1.2", unit: "mg/day" },
            { name: "Vitamin B2", value: "1.5", unit: "mg/day" },
            { name: "Vitamin B6", value: "1.9", unit: "µg/day" },
            { name: "Vitamin B9 (Folate)", value: "600", unit: "µg/day" },
            { name: "Vitamin B12", value: "2.6", unit: "µg/day" },
            { name: "Vitamin C", value: "110", unit: "mg/day" },
            { name: "Choline", value: "450", unit: "mg/day" },
          ],
        },
        {
          category: "Other Information",
          items: [
            { name: "Fiber", value: "28", unit: "g/day" },
            { name: "Salt", value: "< 5", unit: "g/day" },
          ],
        },
      ];
      setNutrients(staticData);

      // Later switch back:
      // const data = await getEssentialNutritionalNeeds({
      //   currentWeek: week,
      //   dateOfBirth: dob,
      // });
      // setNutrients(data);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch nutritional needs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutritionalneeds-page">
      <Header />

      <div className="nutritionalneeds-heading">
        <h1>Recommended Nutritional Needs</h1>
        <p>Enter your gestational week and date of birth to see your needs.</p>
      </div>

      <div className="nutritionalneeds-form-container">
        <form className="nutritionalneeds-form" onSubmit={handleSubmit}>
          <label>Gestational Week</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
          >
            {Array.from({ length: 40 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>

          <label>Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Nutritional Needs"}
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {Array.isArray(nutrients) && nutrients.length > 0 && (
        <div className="nutritionalneeds-table-wrapper">
          <h2>Nutritional Needs for Week {week}</h2>
          <table className="nutritionalneeds-table">
            <thead>
              <tr>
                <th>Target</th>
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

      <Footer />
    </div>
  );
};

export default RecommendedNutritionalNeeds;
