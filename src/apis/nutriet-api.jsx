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

export const updateFoodNutrient = async (nutrientData) => {
  try {
    const response = await apiClient.put(
      `/api/food/update-food-nutrient`,
      {
        foodId: nutrientData.foodId,
        nutrientId: nutrientData.nutrientId,
        nutrientEquivalent: nutrientData.nutrientEquivalent,
        unit: nutrientData.unit,
        amountPerUnit: nutrientData.amountPerUnit,
        totalWeight: nutrientData.totalWeight,
        foodEquivalent: nutrientData.foodEquivalent,
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
    console.error("Error updating food nutrient:", error.response?.data || error.message);
    throw error;
  }
};

export const addNutrientsToFood = async (data) => {
  try {
    const response = await apiClient.put(
      `/api/food/add-nutrients-to-food`,
      {
        foodId: data.foodId,
        nutrients: data.nutrients,
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
    console.error("Error adding nutrients to food:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteFoodNutrient = async (foodId, nutrientId) => {
  try {
    const response = await apiClient.delete(`/api/food/delete-food-nutrient-by-foodId-nutrientId`, {
      params: {
        FoodId: foodId,
        NutrientId: nutrientId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting food nutrient:", error.response?.data || error.message);
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
    const response = await apiClient.post(
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
    const response = await apiClient.get(`/api/dish/view-all-dishes`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data; // Returns { error: 0, message: null, data: [...] }
  } catch (error) {
    console.error("Error fetching all dishes:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getDishById = async (dishId) => {
  try {
    if (!dishId || dishId === '') {
      throw new Error('Dish ID is null or empty');
    }
    const response = await apiClient.get(`/api/dish/view-dish-by-id?dishId=${dishId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dish by ID:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const createDish = async (dishData) => {
  try {
    if (!dishData.dishName || dishData.dishName.trim() === '') {
      throw new Error('Dish name is required');
    }
    if (!dishData.foodList || dishData.foodList.length === 0) {
      throw new Error('At least one food item is required');
    }
    if (dishData.foodList.some((food) => !food.unit || food.amount <= 0)) {
      throw new Error('All food items must have a valid unit and amount greater than 0');
    }

    const formData = new FormData();
    formData.append('FoodList', JSON.stringify(dishData.foodList.map(food => ({
      foodId: food.foodId,
      unit: food.unit === "grams" ? "g" : food.unit,
      amount: parseFloat(food.amount),
    }))));

    if (dishData.image) {
      formData.append('Image', dishData.image);
    }

    const params = new URLSearchParams({
      DishName: dishData.dishName,
      Description: dishData.description || '',
    });

    console.log('Sending create dish request with FormData:', Array.from(formData.entries()));
    console.log('Query params:', params.toString());

    const response = await apiClient.post(
      `/api/dish/add-dish?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      }
    );

    console.log('Create dish response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating dish:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const updateDish = async (dishData) => {
  try {
    if (!dishData.dishId || dishData.dishId === "") {
      throw new Error("Dish ID is null or empty");
    }
    if (!dishData.dishName || dishData.dishName.trim() === "") {
      throw new Error("Dish name is required");
    }
    if (dishData.foodList.length === 0) {
      throw new Error("At least one food item is required");
    }
    if (dishData.foodList.some((food) => !food.unit || food.amount <= 0)) {
      throw new Error(
        "All food items must have a valid unit and amount greater than 0"
      );
    }

    const payload = {
      dishID: dishData.dishId,
      dishName: dishData.dishName,
      description: dishData.description || "",
      foodList: dishData.foodList.map((food) => ({
        foodId: food.foodId,
        unit: food.unit === "grams" ? "g" : food.unit,
        amount: parseFloat(food.amount),
      })),
    };

    console.log("Sending update dish request with payload:", payload);

    const response = await apiClient.put("/api/dish/update-dish", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("Update dish response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating dish:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const deleteDish = async (dishId) => {
  try {
    if (!dishId || dishId === '') {
      throw new Error('Dish ID is null or empty');
    }
    const response = await apiClient.delete(`/api/dish/delete-dish-by-id?dishId=${dishId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting dish:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getAllAllergyCategories = async (token) => {
  try {
    const response = await apiClient.get(`/api/allergy-category/view-all-allergy-category`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all allergy categories:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllergyCategoryById = async (categoryId, token) => {
  try {
    if (!categoryId || categoryId === '') {
      throw new Error('Allergy Category ID is null or empty');
    }
    console.log('Fetching allergy category with ID:', categoryId);
    const response = await apiClient.get(`/api/allergy-category/view-allergy-category-by-id?categoryId=${categoryId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
    console.log('Get allergy category by ID response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching allergy category by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllergyCategoryWithAllergiesById = async (categoryId) => {
  try {
    if (!categoryId || categoryId === '') {
      throw new Error('Allergy Category ID is null or empty');
    }
    const response = await apiClient.get(`/api/allergy-category/view-allergy-category-by-id-with-allergies?categoryId=${categoryId}`, {
      headers: {
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching allergy category with allergies by ID:", error.response?.data || error.message);
    throw error;
  }
};

export const createAllergyCategory = async (categoryData) => {
  try {
    console.log("Creating allergy category with data:", categoryData);
    const response = await apiClient.post(
      `/api/allergy-category/add-allergy-category`,
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
    console.log("Create allergy category response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating allergy category:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw error;
  }
};

export const deleteAllergyCategory = async (categoryId) => {
  try {
    if (!categoryId || categoryId === '') {
      throw new Error('Allergy Category ID is null or empty');
    }
    console.log('Sending delete request for allergy category ID:', categoryId);
    const response = await apiClient.delete(`/api/allergy-category/delete-allergy-category-by-id`, {
      params: {
        allergyCategoryId: categoryId,
      },
      headers: {
        "Accept": "application/json",
      },
    });
    console.log('Delete allergy category response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting allergy category:", error.response?.data || error.message);
    throw error;
  }
};

export const updateAllergyCategory = async (categoryData) => {
  try {
    if (!categoryData.id || categoryData.id === '') {
      throw new Error('Allergy Category ID is null or empty');
    }
    console.log("Updating allergy category with data:", categoryData);
    const response = await apiClient.put(
      `/api/allergy-category/update-allergy-category`,
      {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log("Update allergy category response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating allergy category:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllAllergies = async (token) => {
  try {
    const response = await apiClient.get(`/api/Allergy/view-all-allergies`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all allergies:", error.response?.data || error.message);
    throw error;
  }
};

export const createAllergy = async (allergyData, token) => {
  try {
    console.log("Creating allergy with data:", allergyData);
    const response = await apiClient.post(
      `/api/Allergy/add-allergy`,
      {
        name: allergyData.name,
        description: allergyData.description || '',
        allergyCategoryId: allergyData.allergyCategoryId || null,
        commonSymptoms: allergyData.commonSymptoms || '',
        pregnancyRisk: allergyData.pregnancyRisk || ''
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log("Create allergy response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating allergy:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    throw error;
  }
};

export const updateAllergy = async (allergyData, token) => {
  try {
    if (!allergyData.id || allergyData.id === '') {
      throw new Error('Allergy ID is null or empty');
    }
    console.log("Updating allergy with data:", allergyData);
    const response = await apiClient.put(
      `/api/Allergy/update-allergy`,
      {
        allergyId: allergyData.id,
        name: allergyData.name,
        description: allergyData.description || '',
        allergyCategoryId: allergyData.allergyCategoryId || null,
        commonSymptoms: allergyData.commonSymptoms || '',
        pregnancyRisk: allergyData.pregnancyRisk || ''
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    console.log("Update allergy response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating allergy:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAllergy = async (allergyId, token) => {
  try {
    if (!allergyId || allergyId === '') {
      throw new Error('Allergy ID is null or empty');
    }
    console.log('Sending delete request for allergy ID:', allergyId);
    const response = await apiClient.delete(`/api/Allergy/delete-allergy-by-id`, {
      params: {
        allergyId: allergyId,
      },
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
    console.log('Delete allergy response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting allergy:", error.response?.data || error.message);
    throw error;
  }
};