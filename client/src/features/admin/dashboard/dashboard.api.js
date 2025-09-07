// admin.api.js
import axiosInstance from "@/lib/axiosInstance";

// Dashboard Statistics
export const fetchDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("fetchDashboardStats failed", error);
    throw error;
  }
};

// Recent Activities
export const fetchRecentActivities = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard/activities");
    return response.data.activities;
  } catch (error) {
    console.error("fetchRecentActivities failed", error);
    throw error;
  }
};

// System Status
export const fetchSystemStatus = async () => {
  try {
    const response = await axiosInstance.get("/admin/system/status");
    return response.data;
  } catch (error) {
    console.error("fetchSystemStatus failed", error);
    throw error;
  }
};
