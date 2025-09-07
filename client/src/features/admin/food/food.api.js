// food.api.js
import axiosInstance from "@/lib/axiosInstance";

// Food Management APIs
export const fetchFoods = async () => {
  try {
    console.log("fetch foods function client");
    const response = await axiosInstance.get("/admin/fetchfoods");
    return response.data.foods;
  } catch (error) {
    console.error("fetchFoods failed", error);
    throw error;
  }
};

export const createFood = async (foodData) => {
  try {
    console.log("create food function client");
    const response = await axiosInstance.post("/admin/createfood", foodData);
    return response.data.food;
  } catch (error) {
    console.error("createFood failed", error);
    throw error;
  }
};

export const updateFood = async (id, foodData) => {
  try {
    console.log("update food function client");
    const response = await axiosInstance.patch(
      `/admin/updatefood/${id}`,
      foodData
    );
    return response.data.food;
  } catch (error) {
    console.error("updateFood failed", error);
    throw error;
  }
};

export const deleteFood = async (id) => {
  try {
    console.log("delete food function client");
    const response = await axiosInstance.delete(`/admin/deletefood/${id}`);
    return response.data;
  } catch (error) {
    console.error("deleteFood failed", error);
    throw error;
  }
};
