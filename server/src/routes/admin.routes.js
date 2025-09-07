import express from "express";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchFoods,
  createFood,
  updateFood,
  deleteFood,
  getDashboardStats,
  getDashboardActivities,
  getSystemStatus,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/fetchusers", authMiddleware, fetchUsers);
router.post("/createuser", authMiddleware, createUser);
router.patch("/updateuser/:id", authMiddleware, updateUser);
router.delete("/deleteuser/:id", authMiddleware, deleteUser);

router.get("/fetchfoods", authMiddleware, fetchFoods);
router.post("/createfood", authMiddleware, createFood);
router.patch("/updatefood/:id", authMiddleware, updateFood);
router.delete("/deletefood/:id", authMiddleware, deleteFood);

router.get("/dashboard/stats", authMiddleware, getDashboardStats);
router.get("/dashboard/activities", authMiddleware, getDashboardActivities);
router.get("/system/status", authMiddleware, getSystemStatus);

export default router;
