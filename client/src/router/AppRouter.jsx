import { Routes, Route } from "react-router-dom";

// Public Pages
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import HomePage from "@/features/home/HomePage";
import ProtectedRoute from "@/features/auth/ProtectedRoute"; // create this if not yet

// User Pages
import ProfileSetup from "@/features/user/profile/ProfileSetup";
import UserDashboard from "@/features/user/UserDashboard";
import Profile from "@/features/user/profile/Profile";
import MealPlan from "@/features/user/meal/MealPlan";
// import TrackFood from "@/features/user/meal/EditMealPlan";
// import Progress from "@/features/user/Progress";
// import Reports from "@/features/user/Reports";

import Notifications from "@/features/user/Notifications";

// Admin Pages
import AdminDashboard from "@/features/admin/dashboard/AdminDashboard";
import UserManagement from "@/features/admin/user/UserManagement";
import AddFood from "@/features/admin/food/AddFood";
import FoodManagement from "@/features/admin/food/FoodManagement";

// Layouts
import UserLayout from "@/layouts/UserLayout";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";

import AiSuggestions from "@/features/user/AiSuggestions";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route
        path="/user/profilesetup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />

      {/* User routes */}
      <Route element={<UserLayout />}>
        <Route
          path="/user/userdashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/mealplan"
          element={
            <ProtectedRoute>
              <MealPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/aisuggestions"
          element={
            <ProtectedRoute>
              <AiSuggestions />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/user/editmealplan"
          element={
            <ProtectedRoute>
              <TrackFood />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/user/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/admindashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usermanagement"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/managefoods"
          element={
            <ProtectedRoute adminOnly>
              <FoodManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/addfood"
          element={
            <ProtectedRoute adminOnly>
              <AddFood />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
