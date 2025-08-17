import Profile from "../models/Profile.js";
import MealPlan from "../models/MealPlan.js";
import User from "../models/User.js";
import { generateMealPlan } from "../services/user.service.js";

export const profileSetup = async (req, res) => {
  try {
    console.log("profile setup route");

    const userId = req.user.userId;
    console.log("user id: ", userId);

    const userProfileData = req.body;
    console.log("userprofile data: ", userProfileData);

    console.log("hi");

    // 1️⃣ Save Profile
    const profile = new Profile({
      ...userProfileData,
      user: userId,
    });
    await profile.save();

    console.log("Hi");

    // 2️⃣ Generate and Save Meal Plan
    const { mealPlanData, targetCalories } = await generateMealPlan(
      userProfileData
    );
    console.log("ooo", mealPlanData);

    // Calculate start and end dates
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + mealPlanData.length - 1);
    endDate.setHours(23, 59, 59, 999);

    // Add real dates to meals
    const mealsWithDates = mealPlanData.map((meal, index) => {
      const mealDate = new Date(startDate);
      mealDate.setDate(startDate.getDate() + index);

      return {
        ...meal,
        date: mealDate,
      };
    });

    const mealPlan = new MealPlan({
      user: userId,
      profileSnapshot: userProfileData,
      startDate: startDate,
      endDate: endDate,
      targetCalories,
      meals: mealsWithDates,
    });

    try {
      await mealPlan.save();
      console.log("daa");
    } catch (saveErr) {
      console.error("MealPlan save error:", saveErr);
      throw saveErr;
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

    console.log("mp: ", mealPlan);

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

export const updateMealCompletion = async (req, res) => {
  console.log("update meal controller");

  try {
    console.log("update meal controller 2");
    const { mealPlanId, date, mealType, eaten } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Validation
    if (!mealPlanId || !date || !mealType || typeof eaten !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: mealPlanId, date, mealType, eaten",
      });
    }
    console.log("update meal controller 3");

    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mealType. Must be breakfast, lunch, or dinner",
      });
    }
    console.log("update meal controller 4");

    // Find the meal plan and verify ownership
    const mealPlan = await MealPlan.findOne({
      _id: mealPlanId,
      user: userId,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found or access denied",
      });
    }
    console.log("update meal controller 5");

    // Find the specific meal for the given date
    const targetDate = new Date(date);
    const mealIndex = mealPlan.meals.findIndex((meal) => {
      const mealDate = new Date(meal.date);
      return mealDate.toDateString() === targetDate.toDateString();
    });

    if (mealIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No meal found for the specified date",
      });
    }
    console.log("update meal controller 6");

    // Update the eaten status for the specific meal type
    if (!mealPlan.meals[mealIndex][mealType]) {
      // Initialize meal if it doesn't exist
      mealPlan.meals[mealIndex][mealType] = {
        meal: "",
        calories: 0,
        eaten: eaten,
      };
    } else {
      mealPlan.meals[mealIndex][mealType].eaten = eaten;
    }

    // Save the updated meal plan
    await mealPlan.save();

    console.log("update meal controller 7");

    res.status(200).json({
      success: true,
      message: `${mealType} marked as ${eaten ? "eaten" : "not eaten"}`,
      data: {
        mealPlanId,
        date,
        mealType,
        eaten,
        updatedMeal: mealPlan.meals[mealIndex][mealType],
      },
    });
  } catch (error) {
    console.error("Error updating meal completion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
