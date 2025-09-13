import apiClient from "./url-api";

// GET: /api/food/view-warning-foods
export const viewFoodWarnings = async (payload) => {
  try {
    const response = await apiClient.post(
      "/api/food/view-warning-foods",   // <-- add /api
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Raw API response:", response.data);
    return response.data || []; 
  } catch (error) {
    console.error("Error fetching food warnings:", error);
    throw error;
  }
};




