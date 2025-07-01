import apiClient from './url-api';

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
    console.log('Create category response:', response.data);
    return response;
  } catch (error) {
    console.error('Error creating category:', error.response?.data, error.response?.status);
    throw error;
  }
};

export const getAllCategories = async (token, params = {}) => {
  try {
    const response = await apiClient.get('/api/category/view-all-active-categories', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
      params,
    });
    console.log('Get all categories response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data, error.response?.status);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryName, isActive, token) => {
  try {
    const formData = new FormData();
    formData.append('Id', categoryId);
    formData.append('CategoryName', categoryName);
    formData.append('IsActive', isActive);

    const response = await apiClient.put('/api/category/edit-category', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Update category response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating category:', error.response?.data, error.response?.status);
    throw error;
  }
};

export const deleteCategory = async (categoryId, token) => {
  try {
    const response = await apiClient.delete(`/api/category/delete-category?categoryId=${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Delete category response:', response.data);
    return response;
  } catch (error) {
    console.error('Error deleting category:', error.response?.data, error.response?.status);
    throw error;
  }
};