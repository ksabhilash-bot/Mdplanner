import { jwt } from "jsonwebtoken";
import { signUpService, loginService } from "../services/auth.service.js";

import loginSchema from "../validators/signup.schema.js";
import signupSchema from "../validators/signup.schema.js";

export const signUp = async (req, res) => {
  try {
    const { token, user } = await signUpService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send over HTTPS in production only
      sameSite: "Strict", // prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Signup successfull",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token, user } = await loginService(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send over HTTPS in production only
      sameSite: "Strict", // prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const check = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "Not logged in" });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
