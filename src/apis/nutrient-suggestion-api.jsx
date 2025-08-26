import apiClient from "./url-api";

// GET: /api/NutrientSuggestion/GetEssentialNutritionalNeedsInOneDay
export const getEssentialNutritionalNeeds = async ({ currentWeek, dateOfBirth, activityLevel = 0 }) => {
  const response = await apiClient.get(
    "/api/NutrientSuggestion/GetEssentialNutritionalNeedsInOneDay",
    {
      params: {
        currentWeek,
        dateOfBirth,
        activityLevel: activityLevel ?? 0,
      },
    }
  );
  return response.data;
};
