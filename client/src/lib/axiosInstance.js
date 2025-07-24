import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // change to your backend
  withCredentials: true, // for cookies (optional)
});

export default axiosInstance;
