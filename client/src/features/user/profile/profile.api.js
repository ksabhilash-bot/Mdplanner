import axiosInstance from "@/lib/axiosInstance";

export const submitProfile = async (data) => {
  try {
    const response = await axiosInstance.post("/user/profilesetup", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUserProfile = async (updateData) => {
  try {
    console.log("update user profile function frontend");

    const response = await axiosInstance.patch(
      "/user/updateprofile",
      updateData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
