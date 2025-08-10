import express from "express";
import {
  profileSetup,
  getUserProfile,
  getMealPlan
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/profilesetup", authMiddleware, profileSetup);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/mealplan", authMiddleware, getMealPlan);

export default router;
