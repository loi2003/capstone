import apiClient from './url-api';

// GET: /api/SubscriptionPlan/GetAllSubscriptionPlans

export const getAllSubscriptionPlans = async () => {
  try {
    const response = await apiClient.get(
      `/api/SubscriptionPlan/GetAllSubscriptionPlans`, 
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching all subscription plans ', error.message);
    throw error;
  }
};

// GET: /api/SubscriptionPlan/GetSubscriptionPlanById/{id}

// POST: /api/SubscriptionPlan/CreateSubscriptionPlan

// PUT: /api/SubscriptionPlan/UpdateSubscriptionPlan

// DELETE: /api/SubscriptionPlan/DeleteSubscriptionPlan/{id}

// PATCH: /api/SubscriptionPlan/ToggleSubscriptionPlanStatus/{id}