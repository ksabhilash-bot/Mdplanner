import axiosInstance from "@/lib/axiosInstance";

export const fetchMealPlan = async () => {
  try {
    console.log("fetch meal plan");
    const response = await axiosInstance.get("/user/mealplan");
    console.log("edaa meal ", response.data);
    return response.data;
  } catch (error) {
    console.error("fetchMealPlan failed", error);
    throw error; // rethrow so react-query knows fetch failed
  }
};
