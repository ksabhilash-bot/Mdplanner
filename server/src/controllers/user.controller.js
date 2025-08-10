import Profile from "../models/Profile.js";
import MealPlan from "../models/MealPlan.js";
import User from "../models/User.js";
import { generateMealPlan } from "../services/user.service.js";

export const profileSetup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfileData = req.body;
    // console.log(userId, userProfileData);

    // 1️⃣ Save Profile
    const profile = new Profile({
      ...userProfileData,
      user: userId,
    });
    await profile.save();

    console.log("Hi");

    // 2️⃣ Generate and Save Meal Plan
    const mealPlanData = await generateMealPlan(userProfileData);
    console.log("ooo", mealPlanData);

    const mealPlan = new MealPlan({
      user: userId,
      profileSnapshot: userProfileData,
      meals: mealPlanData,
    });
    try {
      await mealPlan.save();
      console.log("daa");
    } catch (saveErr) {
      console.error("MealPlan save error:", saveErr);
      throw saveErr; // rethrow so 400 is sent
    }

    console.log("daa");

    // 3️⃣ Update User
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isProfileComplete: true,
        profile: profile._id,
        $push: { mealPlans: mealPlan._id },
      },
      { new: true }
    );
    // .populate("profile") // ✅ Get full profile data
    // .populate("mealPlans") // ✅ Get full meal plan(s)
    // .lean(); // ✅ send plain object without Mongoose metadata

    res.status(200).json({
      message: "Profile setup complete",
      user: updatedUser,
      profile,
      mealPlan,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user and populate only the profile
    const user = await User.findById(userId).populate("profile").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user,
      profile: user.profile || null,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the latest meal plan for the user, sorted by creation date descending
    const mealPlan = await MealPlan.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!mealPlan) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    res.status(200).json({ mealPlan });
  } catch (err) {
    console.error("Error fetching meal plan:", err);
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
};
