import axiosInstance from "@/lib/axiosInstance";

export const fetchUsers = async (params) => {
  try {
    console.log("fetch users function");
    const response = await axiosInstance.get("/admin/fetchusers");
    console.log("edaa users ", response.data.users);
    return response.data.users;
  } catch (error) {
    console.error("fetchUsers failed", error);
    throw error;
  }
};
