import User from "../models/User.js";
import bcrypt from "bcrypt"; // for password hashing

import Food from "../models/Food.js";
import mongoose from "mongoose";
import os from "os";

// 📊 1. Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Count users and foods
    const [totalUsers, totalFoods] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
    ]);

    // Active users (based on status field)
    const activeUsers = await User.countDocuments({ status: "active" });

    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // Growth percentage (last 30 days vs previous 30 days)
    const now = new Date();
    const last30 = new Date(now.setDate(now.getDate() - 30));
    const prev30 = new Date(now.setDate(now.getDate() - 30));

    const [last30Users, prev30Users] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: last30 } }),
      User.countDocuments({ createdAt: { $gte: prev30, $lt: last30 } }),
    ]);

    let growthPercentage = 0;
    if (prev30Users > 0) {
      growthPercentage = ((last30Users - prev30Users) / prev30Users) * 100;
    }

    res.status(200).json({
      totalUsers,
      totalFoods,
      activeUsers,
      newUsersThisWeek,
      growthPercentage: Math.round(growthPercentage),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 📝 2. Get Dashboard Activities (last 10 users & foods)
export const getDashboardActivities = async (req, res) => {
  try {
    const [recentUsers, recentFoods] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5),
      Food.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        type: "user",
        user: user.name || user.email,
        action: "joined the platform",
        time: user.createdAt
          ? new Date(user.createdAt).toLocaleString()
          : "N/A",
        sortDate: user.createdAt || new Date(0), // fallback so sorting works
      })),
      ...recentFoods.map((food) => ({
        type: "food",
        item: food.name,
        action: "added to database",
        time: food.createdAt
          ? new Date(food.createdAt).toLocaleString()
          : "N/A",
        sortDate: food.createdAt || new Date(0),
      })),
    ]
      .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))
      .slice(0, 8);

    res.status(200).json({ activities });
  } catch (error) {
    console.error("Error fetching dashboard activities:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// 🖥️ 3. Get System Status
export const getSystemStatus = async (req, res) => {
  try {
    // Check DB connection
    const dbState = mongoose.connection.readyState;
    const databaseStatus =
      dbState === 1
        ? "connected"
        : dbState === 2
        ? "connecting"
        : "disconnected";

    // Simple API status check
    const apiStatus = "operational";

    // Get server load
    const loadAvg = os.loadavg()[0]; // 1-min avg
    const serverLoad = loadAvg > 2 ? "high" : "normal";

    // Uptime
    const uptime = process.uptime(); // seconds
    const uptimePercentage = ((uptime / (60 * 60 * 24)) * 100).toFixed(1); // relative to 24h

    res.status(200).json({
      api: apiStatus,
      database: databaseStatus,
      serverLoad,
      uptime: `${uptimePercentage}%`,
    });
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({ message: "Failed to fetch system status" });
  }
};

// ✅ Fetch Users (with filters, search, and role/status)
export const fetchUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      // .populate("profile")
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("users list server", users);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ✅ Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
    });

    const sanitizedUser = newUser.toObject();
    delete sanitizedUser.password;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      sanitizedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("update user backend", id);

    const { name, email, password, role, status } = req.body;
    console.log(name, email, password, role, status);

    const updateData = { name, email, role, status };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    console.log("delete user backend");

    const { id } = req.params;

    console.log("eyddd", id);

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// server/src/controllers/admin.controller.js
// import Food from "../models/Food.js";

// ✅ Fetch all foods
export const fetchFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ name: 1 }); // Sort alphabetically
    res.status(200).json({ success: true, foods });
  } catch (error) {
    console.error("fetchFoods error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch foods" });
  }
};

// ✅ Create a new food
export const createFood = async (req, res) => {
  try {
    const newFood = new Food(req.body);
    await newFood.save();

    res.status(201).json({ success: true, food: newFood });
  } catch (error) {
    console.error("createFood error:", error);
    res.status(500).json({ success: false, message: "Failed to create food" });
  }
};

// ✅ Update a food
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedFood = await Food.findByIdAndUpdate(id, req.body, {
      new: true, // return updated document
      runValidators: true, // validate against schema
    });

    if (!updatedFood) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    res.status(200).json({ success: true, food: updatedFood });
  } catch (error) {
    console.error("updateFood error:", error);
    res.status(500).json({ success: false, message: "Failed to update food" });
  }
};

// ✅ Delete a food
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFood = await Food.findByIdAndDelete(id);
    if (!deletedFood) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Food deleted successfully" });
  } catch (error) {
    console.error("deleteFood error:", error);
    res.status(500).json({ success: false, message: "Failed to delete food" });
  }
};
