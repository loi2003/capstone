import apiClient from "./url-api";

// GET: /api/notification/view-notifications-by-user-id
export const viewNotificationsByUserId = async (userId, token) => {
  try {
    const response = await apiClient.get("/api/notification/view-notifications-by-user-id", {
      params: {
        userId: userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/plain",
      },
    });
    console.log("View notifications by user id response:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Error fetching notifications by user id:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET: /api/notification/view-notification-by-id
export const viewNotificationById = async (notificationId, token) => {
  try {
    const response = await apiClient.get("/api/notification/view-notification-by-id", {
      params: {
        notificationId: notificationId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/plain",
      },
    });
    console.log("View notification by id response:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Error fetching notification by id:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// PUT: /api/notification/mark-notification-as-read
export const markNotificationAsRead = async (notificationId, token) => {
  try {
    const response = await apiClient.put("/api/notification/mark-notification-as-read", null, {
      params: {
        notificationId: notificationId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/plain",
      },
    });
    console.log("Mark notification as read response:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Error marking notification as read:",
      error.response?.data || error.message
    );
    throw error;
  }
};