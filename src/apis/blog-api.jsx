import apiClient from '../apis/url-api'; // Corrected path

export const createCategory = async (userId, categoryName, token) => {
  try {
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('CategoryName', categoryName);

    const response = await apiClient.post('/api/category/add-new-category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const getAllCategories = async (token) => {
  try {
    const response = await apiClient.get('/api/category/view-all-categories', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};