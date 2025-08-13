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
    const response = await apiClient.delete(`/api/NutrientCategory/delete-nutrient-by-id?nutrientCategoryId=${nutrientCategoryId}`, {
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
    const response = await apiClient.get(`/api/nutrient/view-nutrient-by-id?nutrientId=${nutrientId}`, {
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
    const response = await apiClient.get(`/api/nutrient/view-nutrient-by-id?nutrientId=${nutrientId}`, {
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
    console.log('Sending update nutrient request with data:', nutrientData);
    const response = await apiClient.put(
      `/api/nutrient/update-nutrient`,
      {
        id: nutrientData.nutrientId,
        name: nutrientData.name,
        description: nutrientData.description || '',
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log('UpdateNutrient response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating nutrient:', error.response?.data || error.message);
    throw error;
  }
};

export const updateNutrientImage = async (nutrientId, imageUrl) => {
  try {
    const formData = new FormData();
    formData.append('Id', nutrientId);
    formData.append('ImageUrl', imageUrl);

    console.log('Sending update nutrient image request with FormData:', Array.from(formData.entries()));
    
    const response = await apiClient.put(`/api/nutrient/update-nutrient-image`, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('UpdateNutrientImage response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating nutrient image:', error.response?.data || error.message);
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
    const response = await apiClient.get(`/api/food-category/view-food-category-by-id?categoryId=${categoryId}`, {
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
    console.log("Creating food category with data:", categoryData);
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
    console.log("Create food category response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating food category:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
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

// Food Management APIs
export const getAllFoods = async () => {
  try {
    const response = await apiClient.get(`/api/food/view-all-foods`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all foods:", error.response?.data || error.message);
    throw error;
  }
};

export const getFoodById = async (foodId) => {
  try {
    const response = await apiClient.get(`/api/food/view-food-by-id?foodId=${foodId}`, {
     
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching food by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createFood = async (foodData) => {
  try {
    const formData = new FormData();
    formData.append('image', foodData.image);

    const params = new URLSearchParams({
      Name: foodData.name,
      Description: foodData.description || '',
      PregnancySafe: foodData.pregnancySafe,
      FoodCategoryId: foodData.foodCategoryId,
      SafetyNote: foodData.safetyNote || ''
    });

    const response = await apiClient.post(
      `/api/food/add-food?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating food:", error.response?.data || error.message);
    throw error;
  }
};

export const updateFood = async (foodData) => {
  try {
    if (!foodData.id || foodData.id === '') {
      throw new Error('Food Id is null or empty');
    }
    const response = await apiClient.put(
      `/api/food/update-food`,
      {
        id: foodData.id,
        name: foodData.name,
        description: foodData.description,
        pregnancySafe: foodData.pregnancySafe,
        safetyNote: foodData.safetyNote
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
    console.error("Error updating food:", error.response?.data || error.message);
    throw error;
  }
};
export const updateFoodImage = async (foodId, image) => {
  try {
    const formData = new FormData();
    formData.append('id', foodId);
    formData.append('image', image);

    const response = await apiClient.put(
      `/api/food/update-food-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating food image:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteFood = async (foodId) => {
  try {
    const response = await apiClient.delete(`/api/food/delete-food-by-id`, {
      params: {
        foodId: foodId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting food:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllAgeGroups = async () => {
  try {
    const response = await apiClient.get(`/api/AgeGroup/view-all-age-groups`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all age groups:", error.response?.data || error.message);
    throw error;
  }
};

export const getAgeGroupById = async (ageGroupId) => {
  try {
    const response = await apiClient.get(`/api/AgeGroup/view-age-group-by-id?ageGroupId=${ageGroupId}`, {
 
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching age group by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createAgeGroup = async (ageGroupData) => {
  try {
    console.log("Creating age group with data:", ageGroupData);
    const response = await apiClient.post(
      `/api/AgeGroup/add-age-group`,
      {
        fromAge: ageGroupData.fromAge,
        toAge: ageGroupData.toAge,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log("Create age group response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating age group:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw error;
  }
};
export const updateAgeGroup = async (ageGroupData) => {
  try {
    if (!ageGroupData.ageGroupId || ageGroupData.ageGroupId === '') {
      throw new Error('AgeGroup Id is null or empty');
    }
    const response = await apiClient.put(
      `/api/AgeGroup/update-age-group`,
      {
        ageGroupId: ageGroupData.ageGroupId,
        fromAge: ageGroupData.fromAge,
        toAge: ageGroupData.toAge,
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
    console.error("Error updating age group:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAgeGroup = async (ageGroupId) => {
  try {
    const response = await apiClient.delete(`/api/AgeGroup/delete-age-group-by-id?ageGroupId=${ageGroupId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting age group:", error.response?.data || error.message);
    throw error;
  }
};
export const getAllDishes = async () => {
  try {
    const response = await apiClient.get(`/api/Dish`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all dishes:", error.response?.data || error.message);
    throw error;
  }
};

export const getDishById = async (dishId) => {
  try {
    const response = await apiClient.get(`/api/Dish/${dishId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dish by ID:", error.response?.data || error.message);
    throw error;
  }
};
export const createDish = async (dishData) => {
  try {
    const response = await apiClient.post(
      `/api/Dish/CreateDish`,
      {
        name: dishData.name,
        foodList: dishData.foodList.map(food => ({
          foodId: food.foodId,
          unit: food.unit,
          amount: food.amount,
        })),
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
    console.error("Error creating dish:", error.response?.data || error.message);
    throw error;
  }
};

export const updateDish = async (dishData) => {
  try {
    if (!dishData.dishID || dishData.dishID === '') {
      throw new Error('Dish ID is null or empty');
    }
    const response = await apiClient.put(
      `/api/Dish/update-dish`,
      {
        dishID: dishData.dishID,
        name: dishData.name,
        foodList: dishData.foodList.map(food => ({
          foodId: food.foodId,
          unit: food.unit,
          amount: food.amount,
        })),
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
    console.error("Error updating dish:", error.response?.data || error.message);
    throw error;
  }
};
export const deleteDish = async (dishId) => {
  try {
    const response = await apiClient.delete(`/api/Dish/${dishId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting dish:", error.response?.data || error.message);
    throw error;
  }
};