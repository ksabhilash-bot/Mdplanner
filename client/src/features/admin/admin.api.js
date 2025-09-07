// admin.api.js
import axiosInstance from "@/lib/axiosInstance";

export const fetchUsers = async () => {
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

export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/admin/createuser", userData);
    return response.data.sanitizedUser;
  } catch (error) {
    console.error("createUser failed", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    console.log("update user function", id, userData);

    const response = await axiosInstance.patch(
      `/admin/updateuser/${id}`,
      userData
    );
    return response.data.updatedUser;
  } catch (error) {
    console.error("updateUser failed", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    console.log("delete user function", id);
    const response = await axiosInstance.delete(`/admin/deleteuser/${id}`);
    return response.data;
  } catch (error) {
    console.error("deleteUser failed", error);
    throw error;
  }
};
