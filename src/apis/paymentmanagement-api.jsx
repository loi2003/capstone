import apiClient from "./url-api";

export const getMonthlyRevenue = async (year) => {
  try {
    const response = await apiClient.get(`/api/payment/revenue/month/${year}`, {
      headers: {
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly revenue for year ${year}:`, error);
    throw error;
  }
};

export const getQuarterlyRevenue = async (year) => {
  try {
    const response = await apiClient.get(`/api/payment/revenue/quarter/${year}`, {
      headers: {
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching quarterly revenue for year ${year}:`, error);
    throw error;
  }
};

export const getYearlyRevenue = async () => {
  try {
    const response = await apiClient.get(`/api/payment/revenue/year`, {
      headers: {
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching yearly revenue:", error);
    throw error;
  }
};

export const getPaymentHistory = async (params = {}) => {
  try {
    const { fromDate, toDate, userId, status } = params;
    const queryParams = new URLSearchParams();
    
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);
    if (userId) queryParams.append("userId", userId);
    if (status) queryParams.append("status", status);

    const response = await apiClient.get(`/api/payment/history${queryParams.toString() ? `?${queryParams}` : ''}`, {
      headers: {
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};

export const getUserPaymentHistory = async (userId) => {
  try {
    const response = await apiClient.get(`/api/payment/history/user/${userId}`, {
      headers: {
        Accept: "*/*",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment history for user ${userId}:`, error);
    throw error;
  }
};

export const getPaymentDashboardByYear = async (year) => {
  try {
    const response = await apiClient.get(`/api/payment/view-payment-dashboard-by-year/${year}`, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment dashboard for year ${year}:`, error);
    throw error;
  }
};