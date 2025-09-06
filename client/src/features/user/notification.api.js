import axiosInstance from "@/lib/axiosInstance";

// Add this function to fetch real data
export const fetchNotifications = async () => {
  try {
    console.log("fetch notifications function");

    const response = await axiosInstance.get("/user/notifications");
    console.log(response.data.notifications);

    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

// ✅ Mark a single notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log(notificationId);

    const response = await axiosInstance.patch(
      `/user/notifications/${notificationId}/read`
    );
    return response.data.data; // updated notification
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

// ✅ Optional: Mark all as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axiosInstance.patch(`/user/notifications/read-all`);
    return response.data.data; // list of updated notifications
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
};
