import express from "express";
import { profileSetup } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/profilesetup", authMiddleware, profileSetup);

export default router;
