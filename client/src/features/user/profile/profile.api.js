import axiosInstance from "@/lib/axiosInstance";

export const fetchUserProfile = async () => {
  const response = await axiosInstance.get("/user/profile");

  //   console.log("shoooo", response);
  return response.data;
};
