import apiClient from "./url-api";

export const register = async (data) => {
  try {
    const response = await apiClient.post(`/api/Auth/user/register/user`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });
    return response;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await apiClient.post(`/api/Auth/user/otp/verify`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const login = async (data) => {
  try {
    const response = await apiClient.post(`/api/auth/user/login`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });
    console.log('Login API response:', response);
    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get(`/api/User/get-current-user`, {
      headers: {
        "Accept": "*/*",
      },
    });
    console.log('Get current user API response:', response);
    return response;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const logout = async (userId) => {
  try {
    const response = await apiClient.post(`/api/auth/user/logout`, `"${userId}"`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });
    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const formData = new FormData();
    formData.append('EmailOrPhoneNumber', email);
    const response = await apiClient.post(`/api/auth/user/password/forgot`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "*/*",
      },
    });
    return response;
  } catch (error) {
    console.error("Error sending OTP for password reset:", error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post(`/api/auth/user/password/reset`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });
    return response;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};