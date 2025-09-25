import apiClient from "./url-api";

// GET: /api/offline-consultation/view-all-offline-consultations/{userId}?status={status}

export const viewAllOfflineConsultation = async (
  userId,
  status = "",
  token
) => {
  try {
    const formData = new FormData();
    formData.append("UserId", userId);
    formData.append("Status", status); // always send Status, even if blank

    const response = await apiClient.get(
      `/api/offline-consultation/view-all-offline-consultations/${userId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Viewing offline consultation:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Error viewing offline consultation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET: /api/offline-consultation/view-offline-consultations-by-created-by/{userId}
export const viewOfflineConsultationsByCreatedBy = async (userId, token) => {
  try {
    const response = await apiClient.get(
      `/api/offline-consultation/view-offline-consultations-by-created-by/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching offline consultations by created by:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// POST: /api/offline-consultation/book-offline-consultation
export const bookOfflineConsultation = async (consultationData, token) => {
  try {
    const response = await apiClient.post(
      "/api/offline-consultation/book-offline-consultation",
      consultationData,
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
    console.error("Error booking offline consultation:", error.message);
    throw error;
  }
};

// GET: /api/offline-consultation/view-offline-consultation-by-id/{consultationId}
export const viewOfflineConsultationById = async (consultationId, token) => {
  try {
    const response = await apiClient.get(
      `/api/offline-consultation/view-offline-consultation-by-id/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching offline consultation by id:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// DELETE: /api/offline-consultation/soft-delete-offline-consultation/{consultationId}
export const softDeleteOfflineConsultation = async (consultationId, token) => {
  try {
    const response = await apiClient.delete(
      `/api/offline-consultation/soft-delete-offline-consultation/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error soft deleting offline consultation:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// PUT: /api/offline-consultation/update-offline-consultation
export const updateOfflineConsultation = async (consultationData, token) => {
  try {
    const response = await apiClient.put(
      "/api/offline-consultation/update-offline-consultation",
      consultationData,
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
    console.error("Error updating offline consultation:", error.message);
    throw error;
  }
};

// POST: /api/offline-consultation/add-attachments/{consultationId}
export const addAttachmentsToOfflineConsultation = async (consultationId, files, token) => {
  try {
    const formData = new FormData();
    // files: array of File objects
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await apiClient.post(
      `/api/offline-consultation/add-attachments/${consultationId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // Do NOT set Content-Type, let browser set it to multipart/form-data
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding attachments:", error.message);
    throw error;
  }
};

// Send booking offline consultation emails by consultationId
export const sendBookingOfflineConsultationEmails = async (consultationId, token) => {
  try {
    const response = await apiClient.post(
      `/api/offline-consultation/send-booking-offline-consultation-emails/${consultationId}`,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending booking offline consultation emails:", error.message);
    throw error;
  }
};