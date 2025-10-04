import apiClient from "./url-api";

// GET: /api/user/view-user-by-id

export const getUserById = async (id, token) => {
  try {
    const response = await apiClient.get(`/api/user/view-user-by-id?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user by id:", error.message);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get("/api/admin/view-all-users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users", error.message);
    throw error;
  }
};

// GET:/api/user/get-allergies-and-diseases-by-userid
export const getAllergiesAndDiseasesByUserId = async (userId) => {
  try {
    const response = await apiClient.get(
      `/api/user/get-allergies-and-diseases-by-userid?userId=${userId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching allergies and diseases by user id:",
      error.message
    );
    throw error;
  }
};

// POST:/api/user/add-disease-to-user
export const addDiseaseToUser = async (userId, diseaseData) => {
  try {
    // Filter out null/undefined optional fields
    const payload = {
      diseaseId: diseaseData.diseaseId,
      isBeforePregnancy: diseaseData.isBeforePregnancy || false,
      diseaseType: parseInt(diseaseData.diseaseType) || 0,
    };

    // Add optional fields only if they have values
    if (diseaseData.diagnosedAt) {
      payload.diagnosedAt = diseaseData.diagnosedAt;
    }
    if (diseaseData.expectedCuredAt) {
      payload.expectedCuredAt = diseaseData.expectedCuredAt;
    }
    if (diseaseData.actualCuredAt) {
      payload.actualCuredAt = diseaseData.actualCuredAt;
    }
    if (diseaseData.isCured !== null && diseaseData.isCured !== undefined) {
      payload.isCured = diseaseData.isCured;
    }

    const response = await apiClient.post(
      `/api/user/add-disease-to-user?userId=${userId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding disease to user:", error.message);
    throw error;
  }
};

// PUT:/api/user/update-disease-to-user
export const updateDiseaseToUser = async (userId, diseaseData) => {
  try {
    // Filter out null/undefined optional fields
    const payload = {
      diseaseId: diseaseData.diseaseId,
      isBeforePregnancy: diseaseData.isBeforePregnancy || false,
      diseaseType: parseInt(diseaseData.diseaseType) || 0,
    };

    // Add optional fields only if they have values
    if (diseaseData.diagnosedAt) {
      payload.diagnosedAt = diseaseData.diagnosedAt;
    }
    if (diseaseData.expectedCuredAt) {
      payload.expectedCuredAt = diseaseData.expectedCuredAt;
    }
    if (diseaseData.actualCuredAt) {
      payload.actualCuredAt = diseaseData.actualCuredAt;
    }
    if (diseaseData.isCured !== null && diseaseData.isCured !== undefined) {
      payload.isCured = diseaseData.isCured;
    }

    const response = await apiClient.put(
      `/api/user/update-disease-to-user?userId=${userId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating disease for user:", error.message);
    throw error;
  }
};

// POST:/api/user/add-allergy-to-user
export const addAllergyToUser = async (userId, allergyData) => {
  try {
    const response = await apiClient.post(
      `/api/user/add-allergy-to-user?userId=${userId}`,
      {
        allergyId: allergyData.allergyId,
        severity: allergyData.severity,
        notes: allergyData.notes,
        diagnosedAt: allergyData.diagnosedAt,
        isActive: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding allergy to user:", error.message);
    throw error;
  }
};

// DELETE:/api/user/remove-disease-from-user
export const removeDiseaseFromUser = async (userId, diseaseId) => {
  try {
    const response = await apiClient.delete(
      `/api/user/remove-disease-from-user?userId=${userId}&diseaseId=${diseaseId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error removing disease from user:", error.message);
    throw error;
  }
};

// DELETE:/api/user/remove-allergy-from-user
export const removeAllergyFromUser = async (userId, allergyId) => {
  try {
    const response = await apiClient.delete(
      `/api/user/remove-allergy-from-user?userId=${userId}&allergyId=${allergyId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error removing allergy from user:", error.message);
    throw error;
  }
};

// PUT:/api/user/update-allergy-to-user
export const updateAllergyToUser = async (userId, allergyData) => {
  try {
    const response = await apiClient.put(
      `/api/user/update-allergy-to-user?userId=${userId}`,
      {
        allergyId: allergyData.allergyId,
        severity: allergyData.severity,
        notes: allergyData.notes,
        diagnosedAt: allergyData.diagnosedAt,
        isActive: allergyData.isActive,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating allergy for user:", error.message);
    throw error;
  }
};
