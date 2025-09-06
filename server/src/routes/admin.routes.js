import express from "express";
import {
  
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/fetchusers", authMiddleware, fetchUsers);

export default router;
