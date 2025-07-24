import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchmea = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchmea.parse(req.body);

    const user = User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const matchedPassword = await bcrypt.compare(password, user.password);
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
