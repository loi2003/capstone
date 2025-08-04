import apiClient from './url-api';

// GET: /api/symptom/view-all-symptoms
export const getAllSymptoms = async (token) => {
  try {
    const response = await apiClient.get('/api/symptom/view-all-symptoms', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    console.log('Fetched all symptoms:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching all symptoms:', error.response?.data || error.message);
    throw error;
  }
};

// GET: /api/symptom/view-symptom-by-id
export const getSymptomById = async (symptomId, token) => {
  try {
    const response = await apiClient.get('/api/symptom/view-symptom-by-id', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      params: {
        symptomId,
      },
    });
    console.log('Fetched symptom by ID:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching symptom by ID:', error.response?.data || error.message);
    throw error;
  }
};

// GET: /api/symptom/view-all-symptoms-for-user
export const getSymptomsForUser = async (userId, token) => {
  try {
    const response = await apiClient.get('/api/symptom/view-all-symptoms-for-user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      params: {
        userId,
      },
    });
    console.log('Fetched symptoms for user:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching user symptoms:', error.response?.data || error.message);
    throw error;
  }
};

// POST: /api/symptom/add-new-custom-symptom
export const addNewCustomSymptom = async (userId, symptomName, token) => {
  try {
    const response = await apiClient.post('/api/symptom/add-new-custom-symptom', {
      UserId: userId,
      SymptomName: symptomName,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('Added new custom symptom:', response.data);
    return response;
  } catch (error) {
    console.error('Error adding custom symptom:', error.response?.data || error.message);
    throw error;
  }
};
