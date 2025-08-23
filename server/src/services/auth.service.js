import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const signUpService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isProfileComplete: false,
  });

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginService = async ({ email, password }) => {
  // Find user and exclude password from the query result
  const user = await User.findOne({ email }).select("-password");
  console.log("User found (without password):", user);

  if (!user) {
    throw new Error("User not found");
  }

  // We need to get the password separately for comparison
  const userWithPassword = await User.findOne({ email }).select("password");
  const matchedPassword = await bcrypt.compare(password, userWithPassword.password);
  
  if (!matchedPassword) {
    throw new Error("Incorrect password");
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isProfileComplete: user.isProfileComplete, // ✅ Include this crucial field
      // Include any other fields you need on the frontend
      profile: user.profile,
      mealPlans: user.mealPlans,
    },
  };
};
