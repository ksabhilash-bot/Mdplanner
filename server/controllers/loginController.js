import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    console.log("hello");
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const matchedPassword = await bcrypt.compare(password, user.password);
    console.log(matchedPassword);
    if (!matchedPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send over HTTPS in production only
      sameSite: "Strict", // prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successfull" });
  } catch (error) {
    res.status(400).json(error.message);
  }
};
