import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://mdplanner-backend.onrender.com", // change to your backend
  withCredentials: true, // for cookies (optional)
});

export default axiosInstance;
