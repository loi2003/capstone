import apiClient from "./url-api";

// GET: /api/user-subscription/view-user-subscription-by-user-id/{userId}
export const viewUserSubscriptionByUserId = async (userId) => {
  try {
    const response = await apiClient.get(
      `/api/user-subscription/view-user-subscription-by-user-id/${userId}`,
      {
        headers: {
          //   Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching subscription by user id:", error.message);
    throw error;
  }
};

// POST: /api/user-subscription/create

export const createUserSubscription = async (subscriptionPlanId, token) => {
  try {
    const response = await apiClient.post(
      "/api/user-subscription/create",
      {
        subscriptionPlanId: subscriptionPlanId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating user subscription:", error.message);
    throw error;
  }
};
