import jwt from "jsonwebtoken";
import { signUpService, loginService } from "../services/auth.service.js";
import User from "../models/User.js";

// --------------------
// Cookie helpers
// --------------------
const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd, // only true in production (HTTPS)
  sameSite: isProd ? "none" : "lax", // "none" allows cross-site cookies in prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, cookieOptions);
};

const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0,
  });
};

// --------------------
// Controllers
// --------------------

export const signUp = async (req, res) => {
  try {
    const { token, user } = await signUpService(req.body);

    setTokenCookie(res, token);

    res.status(201).json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token, user } = await loginService(req.body);

    console.log("🔑 Token to be set in cookie:", token);

    setTokenCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const check = async (req, res) => {
  console.log("➡️ auth/check hit");
  const token = req.cookies.token;
  console.log("🔐 Token from cookie:", token);

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req, res) => {
  console.log("➡️ logout route hit");

  clearTokenCookie(res);

  res.status(200).json({ message: "Logged out successfully" });
};
