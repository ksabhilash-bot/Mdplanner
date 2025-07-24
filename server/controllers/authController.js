import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";

export const signUp = async (req, res) => {
  try {
    console.log(req.body);
    const saltRounds = 10;

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: " User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // send over HTTPS in production only
      sameSite: "Strict", // prevents CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Signup successfull",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
