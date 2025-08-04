import express from "express";
import { profileSetup } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/profilesetup", profileSetup);

export default router;
