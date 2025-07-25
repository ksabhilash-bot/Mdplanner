import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const signUpService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
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
    },
  };
};
