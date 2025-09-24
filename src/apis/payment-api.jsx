import apiClient from './url-api';

// POST: /api/payment/checkout-session

export const createCheckoutSession = async (subscriptionPlanId, userSubscriptionId, paymentMethod, token) => {
  try {
    const response = await apiClient.post(
      "/api/payment/checkout-session",
      {
        subscriptionPlanId: subscriptionPlanId,
        userSubscriptionId: userSubscriptionId,
        paymentMethod: paymentMethod ?? 5
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
    console.error("Error creating checkout session:", error.message);
    throw error;
  }
};
