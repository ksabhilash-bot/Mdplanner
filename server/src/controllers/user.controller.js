import Profile from "../models/Profile.js";
// import MealPlan from "../models/NutritionGoal.js";
import User from "../models/User.js";
import { generateMealPlan } from "../services/user.service.js";

import { GoogleGenAI } from "@google/genai";
import { buildMealPlanPrompt } from "../utils/buildMealPlanPrompt.js";
import { calculateBmr } from "../utils/calculateBmr.js";
import { calculateTdee } from "../utils/calculateTdee.js";
import { adjustCaloriesForGoal } from "../utils/adjustCaloriesForGoal.js";
import { calculateMacros } from "../utils/calculateMacros.js";

import { NutritionGoal } from "../models/NutritionGoal.js";
import Food from "../models/Food.js"; // adjust path if needed

import { MealLog } from "../models/MealLog.js";

export const getDailySummary = async (req, res) => {
  try {
    console.log("daily summary");
    
    const userId = req.user.userId;
    const { date } = req.query; // "2025-09-05"
    
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    // Get all meals for that date
    const meals = await MealLog.find({ userId, date });
    
    // Group meals by mealType and calculate totals for each group
    const groupedMeals = meals.reduce((acc, meal) => {
      const mealType = meal.mealType;
      
      // Initialize meal type if it doesn't exist
      if (!acc[mealType]) {
        acc[mealType] = {
          mealType: mealType,
          foods: [],
          totals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
          }
        };
      }
      
      // Add the food item to this meal type
      acc[mealType].foods.push({
        _id: meal._id,
        foodId: meal.foodId,
        foodName: meal.foodName,
        quantity: meal.quantity,
        servingType: meal.servingType,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        fiber: meal.fiber || 0,
        weight_grams: meal.weight_grams,
        createdAt: meal.createdAt,
        updatedAt: meal.updatedAt
      });
      
      // Add to meal type totals
      acc[mealType].totals.calories += meal.calories || 0;
      acc[mealType].totals.protein += meal.protein || 0;
      acc[mealType].totals.carbs += meal.carbs || 0;
      acc[mealType].totals.fat += meal.fat || 0;
      acc[mealType].totals.fiber += meal.fiber || 0;
      
      return acc;
    }, {});
    
    // Convert grouped object to array
    const mealsArray = Object.values(groupedMeals);
    
    // Calculate overall daily totals and round to 2 decimal places
    const dailyTotals = meals.reduce(
      (acc, meal) => {
        acc.totalCalories += meal.calories || 0;
        acc.totalProtein += meal.protein || 0;
        acc.totalCarbs += meal.carbs || 0;
        acc.totalFat += meal.fat || 0;
        acc.totalFiber += meal.fiber || 0;
        return acc;
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
      }
    );
    
    // Round daily totals to 2 decimal places
    Object.keys(dailyTotals).forEach(key => {
      dailyTotals[key] = Math.round(dailyTotals[key] * 100) / 100;
    });
    
    return res.json({
      date,
      meals: mealsArray, // Grouped by meal type
      dailyTotals, // Overall totals for the day
      totalMealTypes: mealsArray.length,
      totalFoodItems: meals.length
    });
    
  } catch (error) {
    console.error("getDailyNutrition error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const trackMeal = async (req, res) => {
  console.log("traccccccccccccccck");

  try {
    console.log("Request body:", req.body);
    const userId = req.user.userId;
    const {
      mealType,
      foodId,
      foodName,
      quantity,
      servingType,
      date,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      weight_grams,
    } = req.body;

    console.log("heeeeeeeeeeeee");

    if (!userId || !mealType || !foodId || !foodName || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("jaaaaaaaaaaaaaaa");

    const mealLog = new MealLog({
      userId,
      mealType,
      foodId,
      foodName,
      quantity,
      servingType,
      date: new Date(date), // will handle "YYYY-MM-DD"
      calories,
      protein,
      carbs,
      fat,
      fiber,
      weight_grams,
    });

    await mealLog.save();

    res.status(201).json({
      success: true,
      message: "Meal tracked successfully",
      data: mealLog,
    });
  } catch (error) {
    console.error("Error tracking meal:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getNutritionGoal = async (req, res) => {
  console.log("nuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");

  try {
    const userId = req.user.userId;

    const goal = await NutritionGoal.findOne({
      userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    console.log("goooooooooooooooo", goal);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "No active nutrition goal found",
      });
    }

    res.status(200).json({ success: true, goal });
  } catch (error) {
    console.error("Error fetching active nutrition goal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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

    // 2️⃣ Calculate calories and macronutrients (without AI meal plan generation)
    // Calculate BMR
    const bmr = await calculateBmr(userProfileData);
    console.log("bmr: ", bmr);

    // Calculate TDEE
    const tdee = await calculateTdee(bmr, userProfileData.activityLevel);
    console.log("tdee: ", tdee);

    // Adjust calories for goal
    const targetCalories = await adjustCaloriesForGoal(
      tdee,
      userProfileData.fitnessGoal
    );
    console.log("target calories: ", targetCalories);

    // Calculate macros (including fiber)
    const macros = await calculateMacros(
      targetCalories,
      userProfileData.fitnessGoal,
      userProfileData
    );
    console.log("macros: ", macros);

    // Split calories and macros by meal type
    const mealsPerDay = parseInt(userProfileData.mealFrequency) || 4;

    let mealDistribution;

    if (mealsPerDay === 3) {
      // 3 meals: Breakfast, Lunch, Dinner (equal distribution)
      mealDistribution = {
        breakfast: {
          calories: macros.calories * 0.33,
          protein: macros.protein * 0.33,
          carbs: macros.carbs * 0.33,
          fat: macros.fat * 0.33,
          fiber: macros.fiber * 0.33,
        },
        lunch: {
          calories: macros.calories * 0.33,
          protein: macros.protein * 0.33,
          carbs: macros.carbs * 0.33,
          fat: macros.fat * 0.33,
          fiber: macros.fiber * 0.33,
        },
        dinner: {
          calories: macros.calories * 0.34,
          protein: macros.protein * 0.34,
          carbs: macros.carbs * 0.34,
          fat: macros.fat * 0.34,
          fiber: macros.fiber * 0.34,
        },
      };
    } else if (mealsPerDay === 4) {
      // 3 main meals + 1 snack: Main meals equal, snack lighter
      mealDistribution = {
        breakfast: {
          calories: macros.calories * 0.3,
          protein: macros.protein * 0.3,
          carbs: macros.carbs * 0.3,
          fat: macros.fat * 0.3,
          fiber: macros.fiber * 0.3,
        },
        lunch: {
          calories: macros.calories * 0.3,
          protein: macros.protein * 0.3,
          carbs: macros.carbs * 0.3,
          fat: macros.fat * 0.3,
          fiber: macros.fiber * 0.3,
        },
        snack: {
          calories: macros.calories * 0.1,
          protein: macros.protein * 0.1,
          carbs: macros.carbs * 0.1,
          fat: macros.fat * 0.1,
          fiber: macros.fiber * 0.1,
        },
        dinner: {
          calories: macros.calories * 0.3,
          protein: macros.protein * 0.3,
          carbs: macros.carbs * 0.3,
          fat: macros.fat * 0.3,
          fiber: macros.fiber * 0.3,
        },
      };
    } else if (mealsPerDay === 5) {
      // 3 main meals + 2 snacks: Main meals equal, snacks lighter
      mealDistribution = {
        breakfast: {
          calories: macros.calories * 0.25,
          protein: macros.protein * 0.25,
          carbs: macros.carbs * 0.25,
          fat: macros.fat * 0.25,
          fiber: macros.fiber * 0.25,
        },
        snack1: {
          calories: macros.calories * 0.125,
          protein: macros.protein * 0.125,
          carbs: macros.carbs * 0.125,
          fat: macros.fat * 0.125,
          fiber: macros.fiber * 0.125,
        },
        lunch: {
          calories: macros.calories * 0.25,
          protein: macros.protein * 0.25,
          carbs: macros.carbs * 0.25,
          fat: macros.fat * 0.25,
          fiber: macros.fiber * 0.25,
        },
        snack2: {
          calories: macros.calories * 0.125,
          protein: macros.protein * 0.125,
          carbs: macros.carbs * 0.125,
          fat: macros.fat * 0.125,
          fiber: macros.fiber * 0.125,
        },
        dinner: {
          calories: macros.calories * 0.25,
          protein: macros.protein * 0.25,
          carbs: macros.carbs * 0.25,
          fat: macros.fat * 0.25,
          fiber: macros.fiber * 0.25,
        },
      };
    } else if (mealsPerDay === 6) {
      // 3 main meals + 3 snacks: Main meals equal, snacks lighter
      mealDistribution = {
        breakfast: {
          calories: macros.calories * 0.22,
          protein: macros.protein * 0.22,
          carbs: macros.carbs * 0.22,
          fat: macros.fat * 0.22,
          fiber: macros.fiber * 0.22,
        },
        lunch: {
          calories: macros.calories * 0.22,
          protein: macros.protein * 0.22,
          carbs: macros.carbs * 0.22,
          fat: macros.fat * 0.22,
          fiber: macros.fiber * 0.22,
        },
        dinner: {
          calories: macros.calories * 0.22,
          protein: macros.protein * 0.22,
          carbs: macros.carbs * 0.22,
          fat: macros.fat * 0.22,
          fiber: macros.fiber * 0.22,
        },
        snack1: {
          calories: macros.calories * 0.113,
          protein: macros.protein * 0.113,
          carbs: macros.carbs * 0.113,
          fat: macros.fat * 0.113,
          fiber: macros.fiber * 0.113,
        },
        snack2: {
          calories: macros.calories * 0.113,
          protein: macros.protein * 0.113,
          carbs: macros.carbs * 0.113,
          fat: macros.fat * 0.113,
          fiber: macros.fiber * 0.113,
        },
        snack3: {
          calories: macros.calories * 0.114,
          protein: macros.protein * 0.114,
          carbs: macros.carbs * 0.114,
          fat: macros.fat * 0.114,
          fiber: macros.fiber * 0.114,
        },
      };
    } else {
      // Fallback: equal distribution
      const equalPortion = 1 / mealsPerDay;
      mealDistribution = {
        equal: {
          calories: macros.calories * equalPortion,
          protein: macros.protein * equalPortion,
          carbs: macros.carbs * equalPortion,
          fat: macros.fat * equalPortion,
          fiber: macros.fiber * equalPortion,
        },
      };
    }

    // Round all values
    Object.keys(mealDistribution).forEach((mealType) => {
      mealDistribution[mealType].calories = Math.round(
        mealDistribution[mealType].calories
      );
      mealDistribution[mealType].protein = Math.round(
        mealDistribution[mealType].protein
      );
      mealDistribution[mealType].carbs = Math.round(
        mealDistribution[mealType].carbs
      );
      mealDistribution[mealType].fat = Math.round(
        mealDistribution[mealType].fat
      );
      mealDistribution[mealType].fiber = Math.round(
        mealDistribution[mealType].fiber
      );
    });

    console.log("meal distribution: ", mealDistribution);

    /* 
    // 🚫 COMMENTED OUT - AI Meal Plan Generation
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
    */

    // 4️⃣ Save Nutrition Goal
    await NutritionGoal.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, endDate: new Date() } }
    );

    // Calculate end date based on meal plan duration from frontend
    const startDate = new Date();
    const endDate = new Date(startDate);

    // Parse duration from userProfileData (e.g., "3-day", "7-day", "14-day")
    const durationMatch = userProfileData.duration.match(/(\d+)-day/);
    const durationDays = durationMatch ? parseInt(durationMatch[1]) : 7; // default to 7 days if parsing fails

    endDate.setDate(startDate.getDate() + durationDays - 1);

    const nutritionGoal = new NutritionGoal({
      userId,
      calories: targetCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
      mealDistribution, // 👈 save it here
      startDate: startDate,
      endDate: endDate, // 👈 add end date here
      isActive: true,
    });
    await nutritionGoal.save();

    // 3️⃣ Update User (without meal plan reference)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isProfileComplete: true,
        profile: profile._id,
        // $push: { mealPlans: mealPlan._id }, // Commented out
      },
      { new: true }
    );

    // console.log("mp: ", mealPlan);
    console.log("nutrition:", targetCalories, macros);

    res.status(200).json({
      message: "Profile setup complete",
      user: updatedUser,
      profile,
      nutritionGoal,
      extraInfo: { bmr, tdee },
      // mealPlan, // Commented out
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

export const getFoodsByMealType = async (req, res) => {};

// 📌 Get all foods
export const getAllFoods = async (req, res) => {
  try {
    console.log("Fetching all foods...");

    const foods = await Food.find().lean(); // lean() makes it faster by returning plain JS objects

    if (!foods || foods.length === 0) {
      return res.status(404).json({ message: "No foods found" });
    }

    console.log("dddd", foods);

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (err) {
    console.error("Error fetching foods:", err);
    res.status(500).json({
      success: false,
      error: "Server error while fetching foods",
    });
  }
};
