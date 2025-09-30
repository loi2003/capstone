import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  getAllNutrientCategories,
  getAllNutrients,
  getAllFoodCategories,
  getAllFoods,
  getAllAllergyCategories,
  getAllAllergies,
  getAllDishes,
  getAllAgeGroups,
} from "../../apis/chartnutrient-api";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Utility for exponential backoff
const backoff = (retries) => Math.pow(2, retries) * 1000;

// Utility to get cached data or fetch with retry
const fetchWithRetry = async (fetchFn, token, maxRetries = 3) => {
  const cacheKey = `nutrition-data-${fetchFn.name}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn(token);
      const data = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, backoff(attempt)));
        continue;
      }
      throw error;
    }
  }
};

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, wait);
    });
  };
};

// Function to count nutrients per nutrient category
const processNutrientCategoryCounts = (nutrients, categories) => {
  if (!Array.isArray(nutrients) || !Array.isArray(categories)) {
    return [];
  }

  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = { name: category.name || "Unknown", count: 0 };
    return acc;
  }, {});

  nutrients.forEach((nutrient) => {
    const categoryId = nutrient.nutrientCategoryId || "Uncategorized";
    if (categoryMap[categoryId]) {
      categoryMap[categoryId].count += 1;
    } else {
      categoryMap[categoryId] = { name: "Uncategorized", count: 1 };
    }
  });

  const result = Object.values(categoryMap);
  const sortedData = [...result].sort((a, b) => (b.count || 1) - (a.count || 1));
  const top10 = sortedData.slice(0, 10);
  const others = sortedData.slice(10);
  const othersSum = others.reduce((sum, item) => sum + (item.count || 1), 0);
  if (othersSum > 0) {
    top10.push({ name: "Other", count: othersSum });
  }
  return top10;
};

// Function to count foods per food category
const processFoodCategoryCounts = (foods, categories) => {
  if (!Array.isArray(foods) || !Array.isArray(categories)) {
    return [];
  }

  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = { name: category.name || "Unknown", count: 0 };
    return acc;
  }, {});

  foods.forEach((food) => {
    const categoryId = food.foodCategoryId || "Uncategorized";
    if (categoryMap[categoryId]) {
      categoryMap[categoryId].count += 1;
    } else {
      categoryMap[categoryId] = { name: "Uncategorized", count: 1 };
    }
  });

  const result = Object.values(categoryMap);
  const sortedData = [...result].sort((a, b) => (b.count || 1) - (a.count || 1));
  const top10 = sortedData.slice(0, 10);
  const others = sortedData.slice(10);
  const othersSum = others.reduce((sum, item) => sum + (item.count || 1), 0);
  if (othersSum > 0) {
    top10.push({ name: "Other", count: othersSum });
  }
  return top10;
};

// Function to count allergies per allergy category
const processAllergyCategoryCounts = (allergies, categories) => {
  if (!Array.isArray(allergies) || !Array.isArray(categories)) {
    return [];
  }

  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = { name: category.name || "Unknown", count: 0 };
    return acc;
  }, {});

  allergies.forEach((allergy) => {
    const categoryId = allergy.allergyCategoryId || "Uncategorized";
    if (categoryMap[categoryId]) {
      categoryMap[categoryId].count += 1;
    } else {
      categoryMap[categoryId] = { name: "Uncategorized", count: 1 };
    }
  });

  const result = Object.values(categoryMap);
  const sortedData = [...result].sort((a, b) => (b.count || 1) - (a.count || 1));
  const top10 = sortedData.slice(0, 10);
  const others = sortedData.slice(10);
  const othersSum = others.reduce((sum, item) => sum + (item.count || 1), 0);
  if (othersSum > 0) {
    top10.push({ name: "Other", count: othersSum });
  }
  return top10;
};

const NutritionChart = ({ activeChart }) => {
  const [nutrientCategories, setNutrientCategories] = useState([]);
  const [foodData, setFoodData] = useState([]);
  const [nutrientData, setNutrientData] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [allergyCategories, setAllergyCategories] = useState([]);
  const [allergyData, setAllergyData] = useState([]);
  const [dishData, setDishData] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#ffffff" } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: "#ffffff" } },
      y: { ticks: { color: "#ffffff" }, beginAtZero: true },
    },
  };

  // Memoized chart configurations
  const chartConfigs = useMemo(
    () => [
      {
        title: "Nutrient Category Distribution",
        key: "nutrientCategories",
        state: processNutrientCategoryCounts(nutrientData, nutrientCategories),
        type: "line",
        options: lineOptions,
        data: {
          labels: processNutrientCategoryCounts(nutrientData, nutrientCategories).map(
            (item) => item.name || "Unknown"
          ),
          datasets: [
            {
              label: "Number of Nutrients per Category",
              data: processNutrientCategoryCounts(nutrientData, nutrientCategories).map(
                (item) => item.count || 1
              ),
              borderColor: "#4caf50",
              backgroundColor: "#a5d6a7",
              fill: false,
              tension: 0.4,
            },
          ],
        },
      },
      {
        title: "Food Category Distribution",
        key: "foodCategories",
        state: processFoodCategoryCounts(foodData, foodCategories),
        type: "line",
        options: lineOptions,
        data: {
          labels: processFoodCategoryCounts(foodData, foodCategories).map(
            (item) => item.name || "Unknown"
          ),
          datasets: [
            {
              label: "Number of Foods per Category",
              data: processFoodCategoryCounts(foodData, foodCategories).map(
                (item) => item.count || 1
              ),
              borderColor: "#4caf50",
              backgroundColor: "#a5d6a7",
              fill: false,
              tension: 0.4,
            },
          ],
        },
      },
      {
        title: "Allergy Category Distribution",
        key: "allergyCategories",
        state: processAllergyCategoryCounts(allergyData, allergyCategories),
        type: "line",
        options: lineOptions,
        data: {
          labels: processAllergyCategoryCounts(allergyData, allergyCategories).map(
            (item) => item.name || "Unknown"
          ),
          datasets: [
            {
              label: "Number of Allergies per Category",
              data: processAllergyCategoryCounts(allergyData, allergyCategories).map(
                (item) => item.count || 1
              ),
              borderColor: "#4caf50",
              backgroundColor: "#a5d6a7",
              fill: false,
              tension: 0.4,
            },
          ],
        },
      },
    ],
    [nutrientData, nutrientCategories, foodData, foodCategories, allergyCategories, allergyData]
  );

  // Debounced fetch function for all data
  const fetchAllData = useCallback(
    debounce(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchPromises = [
          fetchWithRetry(getAllNutrientCategories, null).then((data) =>
            setNutrientCategories(Array.isArray(data) ? data : [])
          ),
          fetchWithRetry(getAllNutrients, null).then((data) =>
            setNutrientData(Array.isArray(data) ? data : [])
          ),
          fetchWithRetry(getAllFoodCategories, null).then((data) =>
            setFoodCategories(Array.isArray(data) ? data : [])
          ),
          fetchWithRetry(getAllFoods, null).then((data) =>
            setFoodData(Array.isArray(data) ? data : [])
          ),
          fetchWithRetry(getAllDishes, null).then((data) =>
            setDishData(Array.isArray(data) ? data : [])
          ),
          fetchWithRetry(getAllAgeGroups, null).then((data) =>
            setAgeGroupData(Array.isArray(data) ? data : [])
          ),
        ];

        // Only fetch allergy data if token is present
        if (token) {
          fetchPromises.push(
            fetchWithRetry(getAllAllergyCategories, token).then((data) =>
              setAllergyCategories(Array.isArray(data) ? data : [])
            ),
            fetchWithRetry(getAllAllergies, token).then((data) =>
              setAllergyData(Array.isArray(data) ? data : [])
            )
          );
        } else {
          setError("Authentication required for allergy data. Other charts will still display.");
          setAllergyCategories([]);
          setAllergyData([]);
        }

        await Promise.all(fetchPromises);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [token]
  );

  // Fetch data on mount or activeChart change
  useEffect(() => {
    fetchAllData();
  }, [activeChart, fetchAllData]);

  // Render loading, error, or charts
  if (isLoading) {
    return (
      <div className="nutrition-chart__container">
        <div className="nutrition-chart__loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nutrition-chart__container">
        <div className="nutrition-chart__error">
          {error}
          <button
            onClick={() => fetchAllData()}
            className="nutrition-chart__retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-chart__container">
      <div className="nutrition-chart__grid">
        {chartConfigs
          .filter((config) => !activeChart || config.key === activeChart)
          .map((config) => (
            <div key={config.key} className="nutrition-chart__card">
              <h2>{config.title}</h2>
              <div className="nutrition-chart__chart-container">
                {config.state.length === 0 ? (
                  <div className="nutrition-chart__no-data">
                    No data available for {config.title}
                  </div>
                ) : (
                  <Line data={config.data} options={config.options} />
                )}
              </div>
            </div>
          ))}
      </div>
      <div className="nutrition-chart__totals">
        <h3>Data Totals</h3>
        <div className="nutrition-chart__total-item">
          Total Nutrients: {nutrientData.length}
        </div>
        <div className="nutrition-chart__total-item">
          Total Foods: {foodData.length}
        </div>
        <div className="nutrition-chart__total-item">
          Total Allergies: {allergyData.length}
        </div>
        <div className="nutrition-chart__total-item">
          Total Dishes: {dishData.length}
        </div>
        <div className="nutrition-chart__total-item">
          Total Age Groups: {ageGroupData.length}
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;