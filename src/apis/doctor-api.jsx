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

// GET: /api/doctor/view-doctor-by-id/{id}
export const viewDoctorById = async (id, token) => {
  try {
    const response = await apiClient.get(
      `/api/doctor/view-doctor-by-id/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor by id:', error.response?.data || error.message);
    throw error;
  }
};

// GET: /api/clinic/view-clinic-by-user-id/{userId}
export const viewClinicByUserId = async (userId, token) => {
  try {
    const response = await apiClient.get(
      `/api/clinic/view-clinic-by-user-id/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching clinic by user id:', error.response?.data || error.message);
    throw error;
  }
};

// POST: /api/doctor/create-doctor
export const createDoctor = async (doctorData, token) => {
  try {
    const response = await apiClient.post(
      "/api/doctor/create-doctor",
      doctorData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating doctor:', error.response?.data || error.message);
    throw error;
  }
};

// PUT: /api/doctor/update-doctor
export const updateDoctor = async (doctorData, token) => {
  try {
    const response = await apiClient.put(
      "/api/doctor/update-doctor",
      doctorData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating doctor:', error.response?.data || error.message);
    throw error;
  }
};

// DELETE: /api/doctor/soft-delete-doctor/{id}
export const softDeleteDoctor = async (id, token) => {
  try {
    const response = await apiClient.delete(
      `/api/doctor/soft-delete-doctor/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error soft deleting doctor:', error.response?.data || error.message);
    throw error;
  }
};