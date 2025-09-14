import apiClient from './url-api';

// GET: /api/doctor/view-all-doctors
export const viewAllDoctors = async (token) => {
  try {
    const response = await apiClient.get(
      "/api/doctor/view-all-doctors",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching all doctors:', error.response?.data || error.message);
    throw error;
  }
};