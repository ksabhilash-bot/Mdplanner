import jwt from "jsonwebtoken";
import { signUpService, loginService } from "../services/auth.service.js";

import User from "../models/User.js";

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

    console.log("token to be set in cookie:", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
      sameSite: "None", // ✅ allows cookie to be sent from cross-origin frontend
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
  console.log("you are on auth check in server");
  const token = req.cookies.token;
  console.log("🔐 Token from cookie:", token); // 🔍 debug log

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password"); // get full user
    // console.log("daaa", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  console.log("logout router");
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
