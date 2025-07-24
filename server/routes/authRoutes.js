import express from "express";
import { signUp } from "../controllers/authController.js";
import { login } from "../controllers/loginController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);

export default router;
