import { Routes, Route } from "react-router-dom";

// Public Pages
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomePage from "@/features/home/HomePage";

// Protected Pages
import UserDashboard from "@/features/dashboard/UserDashboard";
import AdminDashboard from "@/features/dashboard/AdminDashboard";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes (optional layout) */}
      <Route path="/userdashboard" element={<UserDashboard />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
