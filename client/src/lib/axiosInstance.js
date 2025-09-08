import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "https://mdplanner-backend.onrender.com",
  withCredentials: true, // required if using cookies
});

// 🔑 Add token automatically to every request
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
