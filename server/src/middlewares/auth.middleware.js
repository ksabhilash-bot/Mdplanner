import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("All cookies received:", req.cookies); // Debug all cookies
    console.log("Headers:", req.headers.cookie); // Debug cookie header

    const token = req.cookies.token;

    if (!token) {
      console.log("❌ No token found in cookies");
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }

    console.log("✅ Token found:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Auth error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
