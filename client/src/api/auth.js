import axiosInstance from "@/lib/axiosInstance";

const signUp = async (data) => {
  const response = axiosInstance.post("/auth/signup", data);
  return response.data;
};

const login = async (data) => {
  const response = axiosInstance.post("/auth/login", data);
  return response.data;
};

export { signUp, login };
