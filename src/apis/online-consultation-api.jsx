import apiClient from './url-api';

// Fetch all online consultations by consultant ID from the API
export const getAllOnlineConsultationsByConsultantId = async (consultantId, token) => {
  try {
    const response = await apiClient.get(
      `/api/online-consultation/view-all-online-consultations-by-consultant-id/${consultantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching online consultations:', error.message);
    throw error;
  }
};

// Fetch all online consultations by user ID from the API
export const getAllOnlineConsultationsByUserId = async (userId, token) => {
  try {
    const response = await apiClient.get(
      `/api/online-consultation/view-all-online-consultations-by-user-id/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching online consultations by user ID:', error.message);
    throw error;
  }
};

// Fetch a single online consultation by consultation ID from the API
export const getOnlineConsultationById = async (consultationId, token) => {
  try {
    const response = await apiClient.get(
      `/api/online-consultation/view-online-consultation-by-id/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching online consultation by ID:', error.message);
    throw error;
  }
};

// Create a new online consultation using the API
export const createOnlineConsultation = async (consultationData, token) => {
  try {
    const response = await apiClient.post(
      '/api/online-consultation/create-online-consultation',
      consultationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating online consultation:', error.message);
    throw error;
  }
};

// Update an existing online consultation using the API
export const updateOnlineConsultation = async (consultationData, token) => {
  try {
    // Prepare form data for FromForm API
    const formData = new FormData();
    formData.append("Id", consultationData.Id ?? "");
    formData.append("Trimester", consultationData.Trimester ?? "");
    formData.append("Date", consultationData.Date ?? "");
    formData.append("GestationalWeek", consultationData.GestationalWeek ?? "");
    formData.append("Summary", consultationData.Summary ?? "");
    formData.append("ConsultantNote", consultationData.ConsultantNote ?? "");
    formData.append("UserNote", consultationData.UserNote ?? "");
    formData.append("VitalSigns", consultationData.VitalSigns ?? "");
    formData.append("Recommendations", consultationData.Recommendations ?? "");

    // If Attachments is an array, append each file (if any)
    if (Array.isArray(consultationData.Attachments)) {
      consultationData.Attachments.forEach((file) => {
        if (file) formData.append("Attachments", file);
      });
    }

    const response = await apiClient.put(
      "/api/online-consultation/update-online-consultation",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating online consultation:", error.message);
    throw error;
  }
};

// Soft delete an online consultation by consultation ID
export const softDeleteOnlineConsultation = async (consultationId, token) => {
  try {
    const response = await apiClient.delete(
      `/api/online-consultation/soft-delete-online-consultation/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error soft deleting online consultation:', error.message);
    throw error;
  }
};

// Send online consultation emails by consultation ID
export const sendOnlineConsultationEmails = async (consultationId, token) => {
  try {
    const response = await apiClient.post(
      `/api/online-consultation/send-online-consultation-emails/${consultationId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending online consultation emails:', error.message);
    throw error;
  }
};