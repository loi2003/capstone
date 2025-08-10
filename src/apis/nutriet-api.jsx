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
    console.error("Error fetching all nutrient categories:", error.response?.data || error.message);
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
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient category by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createNutrientCategory = async (categoryData) => {
  try {
    const response = await apiClient.post(
      `/api/NutrientCategory/Create`,
      {
        name: categoryData.name,
        description: categoryData.description,
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
    console.error("Error creating nutrient category:", error.response?.data || error.message);
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
        description: categoryData.description,
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
    console.error("Error updating nutrient category:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteNutrientCategory = async (nutrientCategoryId) => {
  try {
    const response = await apiClient.delete(`/api/NutrientCategory/delete-nutrient-by-id`, {
      params: {
        nutrientCategoryId: nutrientCategoryId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting nutrient category:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllNutrients = async () => {
  try {
    const response = await apiClient.get(`/api/nutrient/view-all-nutrients`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all nutrients:", error.response?.data || error.message);
    throw error;
  }
};

export const getNutrientById = async (nutrientId) => {
  try {
    const response = await apiClient.get(`/api/nutrient/view-nutrient-by-id`, {
      params: {
        nutrientId: nutrientId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const getNutrientWithDetailsById = async (nutrientId) => {
  try {
    const response = await apiClient.get(`/api/nutrient/view-nutrient-by-id`, {
      params: {
        nutrientId: nutrientId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrient with details by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createNutrient = async (nutrientData) => {
  try {
    const formData = new FormData();
    formData.append('Name', nutrientData.name);
    formData.append('Description', nutrientData.description || '');
    if (nutrientData.imageUrl) {
      formData.append('ImageUrl', nutrientData.imageUrl);
    }
    formData.append('Unit', nutrientData.unit);
    formData.append('CategoryId', nutrientData.categoryId);

    console.log('Sending create nutrient request with FormData:', Array.from(formData.entries()));
    
    const response = await apiClient.post(`/api/nutrient/add-new-nutrient`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating nutrient:', error.response?.data || error.message);
    throw error;
  }
};

export const updateNutrient = async (nutrientData) => {
  try {
    const formData = new FormData();
    formData.append('NutrientId', nutrientData.nutrientId);
    formData.append('Name', nutrientData.name);
    formData.append('Description', nutrientData.description || '');
    if (nutrientData.imageUrl) {
      formData.append('ImageUrl', nutrientData.imageUrl);
    }
    formData.append('Unit', nutrientData.unit);
    formData.append('CategoryId', nutrientData.categoryId);

    console.log('Sending update nutrient request with FormData:', Array.from(formData.entries()));
    
    const response = await apiClient.put(`/api/nutrient/update-nutrient`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating nutrient:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteNutrient = async (nutrientId) => {
  try {
    const response = await apiClient.delete(`/api/nutrient/delete-nutrient-by-id`, {
      params: {
        nutrientId: nutrientId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting nutrient:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllFoodCategories = async () => {
  try {
    const response = await apiClient.get(`/api/food-category/view-all-foods-category`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all food categories:", error.response?.data || error.message);
    throw error;
  }
};

export const getFoodCategoryById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/api/food-category/view-food-category-by-id`, {
      params: {
        id: categoryId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching food category by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const getFoodCategoryWithFoodsById = async (categoryId) => {
  try {
    const response = await apiClient.get(`/api/food-category/view-food-category-by-id-with-foods`, {
      params: {
        id: categoryId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching food category with foods by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createFoodCategory = async (categoryData) => {
  try {
    const response = await apiClient.post(
      `/api/food-category/add-food-category`,
      {
        name: categoryData.name,
        description: categoryData.description,
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
    console.error("Error creating food category:", error.response?.data || error.message);
    throw error;
  }
};
export const updateFoodCategory = async (categoryData) => {
  try {
    if (!categoryData.id || categoryData.id === '') {
      throw new Error('FoodCategory Id is null or empty');
    }
    const response = await apiClient.put(
      `/api/food-category/update-food-category`,
      {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description,
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
    console.error("Error updating food category:", error.response?.data || error.message);
    throw error;
  }
};
export const deleteFoodCategory = async (foodCategoryId) => {
  try {
    const response = await apiClient.delete(`/api/food-category/delete-food-category-by-id`, {
      params: {
        foodCategoryId: foodCategoryId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting food category:", error.response?.data || error.message);
    throw error;
  }
};