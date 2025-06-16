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
    console.log('Login API response:', response); // Log for debugging
    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};