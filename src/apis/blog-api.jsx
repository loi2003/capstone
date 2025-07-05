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
    console.error('Error creating category:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const getAllCategories = async (token, params = {}) => {
  try {
    const response = await apiClient.get('/api/category/view-all-categories-not-deleted', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
      params,
    });
    console.log('Get all categories response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
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
    console.error('Error updating category:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
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
    console.error('Error deleting category:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const addBlog = async (blogData, token) => {
  try {
    const formData = new FormData();
    formData.append('Id', blogData.id || '');
    formData.append('UserId', blogData.userId);
    formData.append('CategoryId', blogData.categoryId);
    formData.append('Title', blogData.title);
    formData.append('Body', blogData.body);
    blogData.tags.forEach((tag, index) => formData.append(`Tags[${index}]`, tag));
    blogData.images.forEach((image, index) => formData.append(`Images`, image));

    const response = await apiClient.post('/api/blog/upload-blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Add blog response:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding blog:', error.response?.data || error.message);
    throw error;
  }
};

export const editBlog = async (formData, token) => {
  try {
    // Validate required fields
    const requiredFields = ['Id', 'CategoryId', 'Title', 'Body'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Extract tags from FormData, default to empty array
    const tags = formData.getAll('Tags') || [];
    // Clear existing Tags entries to avoid duplicates
    for (const key of formData.keys()) {
      if (key.startsWith('Tags[')) {
        formData.delete(key);
      }
    }
    // Re-append tags to ensure correct formatting
    tags.forEach((tag, index) => formData.append(`Tags[${index}]`, tag.trim()));

    // Extract images from FormData, default to empty array
    const images = formData.getAll('Images') || [];
    // Clear existing Images entries to avoid duplicates
    for (const key of formData.keys()) {
      if (key === 'Images') {
        formData.delete(key);
      }
    }
    // Re-append images
    images.forEach((image, index) => formData.append(`Images`, image));

    // Debug: Log FormData contents
    console.log('editBlog FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    const response = await apiClient.put('/api/blog/edit-blog', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Edit blog response:', response.data);
    return response;
  } catch (error) {
    console.error('Error editing blog:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const getAllBlogs = async (token) => {
  try {
    const response = await apiClient.get('/api/blog/view-all-blogs', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Get all blogs response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching blogs:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteBlog = async (blogId, token) => {
  try {
    const response = await apiClient.delete(`/api/blog/delete-blog?blogId=${blogId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Delete blog response:', response.data);
    return response;
  } catch (error) {
    console.error('Error deleting blog:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const approveBlog = async (blogId, approvedByUserId, token) => {
  try {
    const response = await apiClient.put(
      `/api/blog/approve-blog?blogId=${blogId}&approvedByUserId=${approvedByUserId}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      }
    );
    console.log('Approve blog response:', response.data);
    return response;
  } catch (error) {
    console.error('Error approving blog:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const rejectBlog = async (blogId, approvedByUserId, rejectionReason, token) => {
  try {
    const response = await apiClient.put(
      `/api/blog/reject-blog?blogId=${blogId}&approvedByUserId=${approvedByUserId}&rejectionReason=${encodeURIComponent(rejectionReason)}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain',
        },
      }
    );
    console.log('Reject blog response:', response.data);
    return response;
  } catch (error) {
    console.error('Error rejecting blog:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};

export const getBlogsByUser = async (userId, token) => {
  try {
    const response = await apiClient.get('/api/blog/view-blogs-from-user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
      params: {
        userId,
      },
    });
    console.log('Get blogs by user response:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching user blogs:', error.response?.data?.message || error.message, error.response?.status, error.response?.data);
    throw error;
  }
};