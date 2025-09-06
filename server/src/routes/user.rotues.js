import express from "express";
import {
  profileSetup,
  getUserProfile,
  getMealPlan,
  updateMealCompletion,
  getFoodsByMealType,
  getAllFoods, // Add this import
  getNutritionGoal,
  trackMeal,
  getDailySummary,
  getNotifications,
  markNotificationAsRead,
  updateProfile,
  aiFoodSuggestions
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/profilesetup", authMiddleware, profileSetup);
router.get("/profile", authMiddleware, getUserProfile);

router.post("/aifoodsuggestions", authMiddleware, aiFoodSuggestions);

router.patch("/mark-meal-eaten", authMiddleware, updateMealCompletion); // Add this route

router.get("/foods/meal/:mealType", authMiddleware, getFoodsByMealType);
router.get("/foods", authMiddleware, getAllFoods);
router.get("/nutritiongoal", authMiddleware, getNutritionGoal);

router.post("/track-meal", authMiddleware, trackMeal);
router.get("/nutrition/daily", authMiddleware, getDailySummary);
router.get("/notifications", authMiddleware, getNotifications);

router.patch("/notifications/:id/read", authMiddleware, markNotificationAsRead);
router.patch("/updateprofile", authMiddleware, updateProfile);

export default router;
