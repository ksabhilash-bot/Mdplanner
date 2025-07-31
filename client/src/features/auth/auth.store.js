import axiosInstance from "@/lib/axiosInstance";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  // Function to check if user is logged in or not
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true,
      });
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      console.warn(
        "🔒 User not authenticated yet: ",
        err.response?.data?.message || err.message
      );
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  // To set user after tanstack query login
  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  // Function to logout user
  logout: async () => {
    await axiosInstance.post("/auth/logout", { withCredentials: true });
    set({ user: null, isAuthenticated: false });
  },
}));
