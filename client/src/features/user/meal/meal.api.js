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

export const updateMealCompletion = async ({
  mealPlanId,
  date,
  mealType,
  eaten,
}) => {
  try {
    console.log("Updating meal completion:", {
      mealPlanId,
      date,
      mealType,
      eaten,
    });

    const response = await axiosInstance.patch("/user/mark-meal-eaten", {
      mealPlanId,
      date: date.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      mealType,
      eaten,
    });

    console.log("Meal completion updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("updateMealCompletion failed", error);
    throw error;
  }
};

export const getMealOptions = async (params) => {};
export const updateMeal = async (params) => {};
