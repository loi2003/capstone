import apiClient from './url-api';

// GET: /api/recommended-checkup-reminder/view-all-recommended-reminders

export const ViewAllRecommendedCheckupReminders = async (growthDataId, token) => {
  try {
    const response = await apiClient.get(
      `/api/recommended-checkup-reminder/view-all-recommended-reminders`,
      {
        params: { growthDataId },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/plain",
        },
      }
    );
    console.log(
      "Get recommended checkup reminders by growthDataId response:",
      response.data
    );
    return response;
  } catch (error) {
    console.error(
      "Error fetching recommended checkup reminders by growthDataId:",
      error.response?.data || error.message
    );
    throw error;
  }
};
