import axiosInstance from "@/lib/axiosInstance";

// API functions
export const getDailyNutrition = async (date) => {
  try {
    const response = await axiosInstance.get(
      `/user/nutrition/daily?date=${date}`
    );
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching daily nutrition:", error);
    return null;
  }
};

export const getNutritionHistory = async () => {
  try {
    const response = await axiosInstance.get("/nutrition/history");
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrition history:", error);
    return [];
  }
};

export const getUserNutritionGoals = async () => {
  try {
    const response = await axiosInstance.get("/user/nutritiongoal");
    console.log(response.data);
    return response.data.goal;
  } catch (error) {
    console.error("Error fetching nutrition goal:", error);
  }
};
