import axiosInstance from "@/lib/axiosInstance";

// Existing functions from your code
// export const fetchMealPlan = async () => {
//   try {
//     console.log("fetch meal plan");
//     const response = await axiosInstance.get("/user/mealplan");
//     console.log("edaa meal ", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("fetchMealPlan failed", error);
//     throw error;
//   }
// };

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
      date: date.toISOString().split("T")[0],
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

// New functions for meal tracking
export const getFoodsByMeal = async (meal) => {
  try {
    console.log("Fetching foods for category:", meal);
    const response = await axiosInstance.get(`/user/foods/meal/${meal}`);
    console.log("Foods fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("getFoodsByCategory failed", error);
    throw error;
  }
};

export const getAllFoods = async (params) => {
  try {
    console.log("Fetching all foods");
    const response = await axiosInstance.get(`/user/foods`);
    console.log("Foods fetched:", response.data.foods);
    return response.data.foods;
  } catch (error) {
    console.error("getAllFoods failed", error);
    throw error;
  }
};

export const trackMeal = async (mealData) => {
  try {
    console.log(mealData);
    const response = await axiosInstance.post("/user/track-meal", {
      mealType: mealData.mealType,
      foodId: mealData.foodId,
      foodName: mealData.foodName, // Add food name
      quantity: mealData.quantity,
      servingType: mealData.servingType,
      date: mealData.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      // Nutrition data
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      fiber: mealData.fiber,
      weight_grams: mealData.weight_grams,
    });

    return response.data;
  } catch (error) {
    console.error("trackMeal failed", error);
    throw error;
  }
};

// Placeholder functions (keep these if they're used elsewhere)
export const getMealOptions = async (params) => {
  // Implementation if needed
};

export const updateMeal = async (params) => {
  // Implementation if needed
};
