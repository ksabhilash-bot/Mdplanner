import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://mdplanner-backend.onrender.com",
  withCredentials: true,
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage, sessionStorage, or your auth context
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;