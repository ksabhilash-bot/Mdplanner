import axiosInstance from "@/lib/axiosInstance";

export const submitProfile = async (data) => {
  const response = await axiosInstance.post("/user/profilesetup", data);
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await axiosInstance.get("/user/profile");

  //   console.log("shoooo", response);
  return response.data;
};
