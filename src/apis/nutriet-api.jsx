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
      formData.append('ImageUrl', nutrientData.imageUrl); // Assuming imageUrl is a File object
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
      formData.append('ImageUrl', nutrientData.imageUrl); // Assuming imageUrl is a File object
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