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

export const extendPlan = async (goalId, extraDays) => {
  try {
    const response = await axiosInstance.patch(
      `/user/nutrition-goals/extend/${goalId}`,
      {
        extraDays,
      }
    );

    alert("Plan extended successfully!");
  } catch (error) {
    console.error("Error extending nutrition plan:", error);
    const message =
      error.response?.data?.message ||
      "Something went wrong while extending the plan";
    alert(message);
  }
};

export const regeneratePlan = async (goalId) => {
  try {
    const response = await axiosInstance.post(
      `/user/nutrition-goals/regenerate/${goalId}`
    );

    alert("New plan generated successfully!");
  } catch (error) {
    console.error("Error regenerating nutrition plan:", error);
    const message =
      error.response?.data?.message ||
      "Something went wrong while regenerating the plan";
    alert(message);
  }
};
