import express from "express";
import {
  profileSetup,
  getUserProfile,
  getFoodsByMealType,
  getAllFoods, // Add this import
  getNutritionGoal,
  trackMeal,
  getDailySummary,
  getNotifications,
  markNotificationAsRead,
  updateProfile,
  aiFoodSuggestions,
  extendPlan,
  regeneratePlan,
  markPlanAsExpired,
  activatePlan
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/profilesetup", authMiddleware, profileSetup);
router.get("/profile", authMiddleware, getUserProfile);
router.patch("/updateprofile", authMiddleware, updateProfile);

router.get("/foods", authMiddleware, getAllFoods);
router.get("/foods/meal/:mealType", authMiddleware, getFoodsByMealType);
router.post("/track-meal", authMiddleware, trackMeal);

router.get("/nutritiongoal", authMiddleware, getNutritionGoal);
router.get("/nutrition/daily", authMiddleware, getDailySummary);

router.get("/notifications", authMiddleware, getNotifications);
router.patch("/notifications/:id/read", authMiddleware, markNotificationAsRead);

router.post("/aifoodsuggestions", authMiddleware, aiFoodSuggestions);
router.patch("/nutrition-goals/extend/:goalId", authMiddleware, extendPlan);
router.post(
  "/nutrition-goals/regenerate/:goalId",
  authMiddleware,
  regeneratePlan
);
router.patch("/nutrition/expire", authMiddleware, markPlanAsExpired);
router.patch("/nutrition-goals/activate",authMiddleware, activatePlan);


export default router;
