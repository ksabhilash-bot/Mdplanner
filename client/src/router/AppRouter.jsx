import { Routes, Route } from "react-router-dom";

// Public Pages
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomePage from "@/features/home/HomePage";

// Protected Pages
import UserDashboard from "@/features/user/UserDashboard";
import AdminDashboard from "@/features/admin/AdminDashboard";

import UserLayout from "@/layouts/UserLayout";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      {/* User routes */}
      <Route element={<UserLayout />}>
        <Route path="/userdashboard" element={<UserDashboard />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
