import apiClient from './url-api';

// GET: /api/user/view-user-by-id

export const getUserById = async (id, token) => {
  try {
    const response = await apiClient.get(
      `/api/user/view-user-by-id?id=${id}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user by id:', error.message);
    throw error;
  }
};
