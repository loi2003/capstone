import apiClient from './url-api';

export const createHealthExpertAccount = async (formData, token) => {
  try {
    const response = await apiClient.post('/api/admin/create-health-expert-account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Create Health Expert Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error creating Health Expert account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const createNutrientSpecialistAccount = async (formData, token) => {
  try {
    const response = await apiClient.post('/api/admin/create-nutrient-specialist-account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Create Nutrient Specialist Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error creating Nutrient Specialist account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const createClinicAccount = async (formData, token) => {
  try {
    const response = await apiClient.post('/api/admin/create-clinic-account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Create Clinic Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error creating Clinic account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const viewAllUsers = async (token) => {
  try {
    const response = await apiClient.get('/api/admin/view-all-users', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('View All Users response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const viewAllStaff = async (token) => {
  try {
    const response = await apiClient.get('/api/admin/view-all-staff', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('View All Staff response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error fetching staff:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const viewAllClinics = async (token) => {
  try {
    const response = await apiClient.get('/api/admin/view-all-clinics', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('View All Clinics response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error fetching clinics:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const changeAccountAuthorize = async (formData, token) => {
  try {
    const response = await apiClient.put('/api/admin/change-account-authorize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Change Account Authorize response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error changing account authorization:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const banAccount = async (email, token) => {
  try {
    const response = await apiClient.put(`/api/admin/ban-account?email=${encodeURIComponent(email)}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Ban Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error banning account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const unbanAccount = async (email, token) => {
  try {
    const response = await apiClient.put(`/api/admin/unban-account?email=${encodeURIComponent(email)}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Unban Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error unbanning account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};

export const hardDeleteAccount = async (email, token) => {
  try {
    const response = await apiClient.delete(`/api/admin/hard-delete-account?email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });
    console.log('Hard Delete Account response:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error deleting account:', error.response?.data?.message || error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
};