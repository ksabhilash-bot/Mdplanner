import axiosInstance from "@/lib/axiosInstance";

export const submitProfile = async (data) => {
  const response = await axiosInstance.post("/user/profilesetup", data);
  return response.data;
};
