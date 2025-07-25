import User from "./src/models/User.js";
import bcrypt from "bcrypt";

export const createAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "admin@gmail.com" });
    if (existing) return console.log("Admin already exists");

    const hashedPassword = await bcrypt.hash("admin", 10);
    
    const user = await User.create({
      name: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("admin created");
  } catch (error) {
    console.log("Error creating admin", error);
  }
};
