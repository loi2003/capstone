import apiClient from "./url-api";

export const getAllNutrientCategories = async () => {
  try {
    const response = await apiClient.get(`/api/NutrientCategory/GetAll`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all nutrient categories:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getNutrientCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/api/NutrientCategory/GetById`, {
      params: {
        categoryId: categoryId,
      },
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching nutrient category by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllNutrients = async () => {
  try {
    const response = await apiClient.get(`/api/nutrient/view-all-nutrients`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all nutrients:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getNutrientById = async (nutrientId) => {
  try {
    const response = await apiClient.get(
      `/api/nutrient/view-nutrient-by-id?nutrientId=${nutrientId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching nutrient by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getNutrientWithDetailsById = async (nutrientId) => {
  try {
    const response = await apiClient.get(
      `/api/nutrient/view-nutrient-by-id?nutrientId=${nutrientId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching nutrient with details by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllFoodCategories = async () => {
  try {
    const response = await apiClient.get(
      `/api/food-category/view-all-foods-category`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all food categories:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFoodCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(
      `/api/food-category/view-food-category-by-id?categoryId=${categoryId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching food category by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFoodCategoryWithFoodsById = async (categoryId) => {
  try {
    const response = await apiClient.get(
      `/api/food-category/view-food-category-by-id-with-foods`,
      {
        params: {
          id: categoryId,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching food category with foods by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllFoods = async () => {
  try {
    const response = await apiClient.get(`/api/food/view-all-foods`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all foods:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFoodById = async (foodId) => {
  try {
    const response = await apiClient.get(
      `/api/food/view-food-by-id?foodId=${foodId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching food by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllAgeGroups = async () => {
  try {
    const response = await apiClient.get(`/api/AgeGroup/view-all-age-groups`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all age groups:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAgeGroupById = async (ageGroupId) => {
  try {
    const response = await apiClient.get(
      `/api/AgeGroup/view-age-group-by-id?ageGroupId=${ageGroupId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching age group by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllDishes = async () => {
  try {
    const response = await apiClient.get(`/api/dish/view-all-dishes`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all dishes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getDishById = async (dishId) => {
  try {
    if (!dishId || dishId === "") {
      throw new Error("Dish ID is null or empty");
    }
    const response = await apiClient.get(
      `/api/dish/view-dish-by-id?dishId=${dishId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching dish by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllAllergyCategories = async (token) => {
  try {
    const response = await apiClient.get(
      `/api/allergy-category/view-all-allergy-category`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all allergy categories:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllergyCategoryById = async (categoryId, token) => {
  try {
    if (!categoryId || categoryId === "") {
      throw new Error("Allergy Category ID is null or empty");
    }
    const response = await apiClient.get(
      `/api/allergy-category/view-allergy-category-by-id?categoryId=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching allergy category by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllergyCategoryWithAllergiesById = async (categoryId) => {
  try {
    if (!categoryId || categoryId === "") {
      throw new Error("Allergy Category ID is null or empty");
    }
    const response = await apiClient.get(
      `/api/allergy-category/view-allergy-category-by-id-with-allergies?categoryId=${categoryId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching allergy category with allergies by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllAllergies = async (token) => {
  try {
    const response = await apiClient.get(`/api/Allergy/view-all-allergies`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all allergies:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllDiseases = async (token) => {
  try {
    const response = await apiClient.get(`/api/Disease/view-all-diseases`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all diseases:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getDiseaseById = async (diseaseId, token) => {
  try {
    if (!diseaseId || diseaseId === "") {
      throw new Error("Disease ID is null or empty");
    }
    const response = await apiClient.get(
      `/api/Disease/view-disease-by-id?diseaseId=${diseaseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching disease by ID:",
      error.response?.data || error.message
    );
    throw error;
  }
};