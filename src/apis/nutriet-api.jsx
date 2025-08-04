import apiClient from "./url-api";

export const getAllNutrientCategories = async () => {
  try {
    const response = await apiClient.get(`/api/NutrientCategory/GetAll`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all nutrient categories:", error);
    throw error;
  }
};

export const getNutrientCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/api/NutrientCategory/GetById`, {
      params: {
        categoryId: categoryId
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient category by ID:", error);
    throw error;
  }
};

export const createNutrientCategory = async (categoryData) => {
  try {
    const response = await apiClient.post(
      `/api/NutrientCategory/Create`,
      {
        name: categoryData.name,
        description: categoryData.description
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating nutrient category:", error);
    throw error;
  }
};

export const updateNutrientCategory = async (categoryData) => {
  try {
    const response = await apiClient.put(
      `/api/NutrientCategory/Update`,
      {
        nutrientCategoryId: categoryData.nutrientCategoryId,
        name: categoryData.name,
        description: categoryData.description
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating nutrient category:", error);
    throw error;
  }
};

export const getAllNutrients = async () => {
  try {
    const response = await apiClient.get(`/api/Nutrient/GetAll`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all nutrients:", error);
    throw error;
  }
};

export const getNutrientById = async (nutrientId) => {
  try {
    const response = await apiClient.get(`/api/Nutrient/GetById`, {
      params: {
        nutrientId: nutrientId
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient by ID:", error);
    throw error;
  }
};

export const getNutrientWithDetailsById = async (nutrientId) => {
  try {
    const response = await apiClient.get(`/api/Nutrient/GetWithDetailsById`, {
      params: {
        nutrientId: nutrientId
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient with details by ID:", error);
    throw error;
  }
};

export const createNutrient = async (nutrientData) => {
  try {
    const response = await apiClient.post(
      `/api/Nutrient/Create`,
      {
        name: nutrientData.name,
        description: nutrientData.description,
        imageUrl: nutrientData.imageUrl,
        unit: nutrientData.unit,
        categoryId: nutrientData.categoryId
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating nutrient:", error);
    throw error;
  }
};