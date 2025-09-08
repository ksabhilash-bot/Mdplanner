import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://mdplanner-backend.onrender.com",
  withCredentials: true, // keep this if you are using cookies
});

// ✅ Interceptor to attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
