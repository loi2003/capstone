import apiClient from './url-api';

export const viewConsultantByUserId = async (userId, token) => {
  try {
    const response = await apiClient.get(
      `/api/consultant/view-consultant-by-user-id/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};