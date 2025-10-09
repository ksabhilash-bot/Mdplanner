import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { GoogleGenAI } from "@google/genai";
import { calculateBmr } from "../utils/calculateBmr.js";
import { calculateTdee } from "../utils/calculateTdee.js";
import { adjustCaloriesForGoal } from "../utils/adjustCaloriesForGoal.js";
import { calculateMacros } from "../utils/calculateMacros.js";
import { NutritionGoal } from "../models/NutritionGoal.js";
import Food from "../models/Food.js"; // adjust path if needed
import { MealLog } from "../models/MealLog.js";
import Notification from "../models/Notification.js";
import { buildFoodSuggestionsPrompt } from "../utils/buildFoodSuggestionsPrompt.js";

// Extend an existing active nutrition plan by a given number of days
export const extendPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { extraDays } = req.body; // Number of days to extend

    if (!extraDays || extraDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid number of days to extend",
      });
    }

    // Find the active nutrition goal
    const activeGoal = await NutritionGoal.findOne({ userId, isActive: true });
    if (!activeGoal) {
      return res.status(404).json({
        success: false,
        message: "No active nutrition plan found to extend",
      });
    }

    // Extend the end date
    const newEndDate = new Date(activeGoal.endDate);
    newEndDate.setDate(newEndDate.getDate() + extraDays);

    activeGoal.endDate = newEndDate;
    await activeGoal.save();

    res.status(200).json({
      success: true,
      message: `Nutrition plan extended by ${extraDays} day(s)`,
      nutritionGoal: activeGoal,
    });
  } catch (err) {
    console.error("Error extending nutrition plan:", err);
    res.status(500).json({
      success: false,
      message: "Server error while extending plan",
      error: err.message,
    });
  }
};

// Regenerate nutrition plan: recalculates calories/macros and creates a new plan
export const regeneratePlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Deactivate existing active plans
    await NutritionGoal.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, endDate: new Date() } }
    );

    // Recalculate nutrition values
    const bmr = await calculateBmr(profile.toObject());
    const tdee = await calculateTdee(bmr, profile.activityLevel);
    const targetCalories = await adjustCaloriesForGoal(
      tdee,
      profile.fitnessGoal
    );
    const macros = await calculateMacros(
      targetCalories,
      profile.fitnessGoal,
      profile.toObject()
    );

    // Calculate meal distribution
    const mealsPerDay = parseInt(profile.mealFrequency) || 4;
    const mealDistribution = calculateMealDistribution(macros, mealsPerDay);

    // Set new plan duration (default 7 days)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Create new nutrition goal
    const newGoal = new NutritionGoal({
      userId,
      calories: targetCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
      mealDistribution,
      startDate,
      endDate,
      isActive: true,
    });

    await newGoal.save();

    res.status(200).json({
      success: true,
      message: "Nutrition plan regenerated successfully",
      nutritionGoal: newGoal,
      extraInfo: { bmr, tdee },
    });
  } catch (err) {
    console.error("Error regenerating nutrition plan:", err);
    res.status(500).json({
      success: false,
      message: "Server error while regenerating plan",
      error: err.message,
    });
  }
};

export const aiFoodSuggestions = async (req, res) => {
  console.log("AI food suggestions backend");

  try {
    const userId = req.user.userId;
    const { moodDescription } = req.body;
    console.log("Mood description:", moodDescription);

    if (!moodDescription) {
      return res.status(400).json({
        success: false,
        message: "Mood description is required",
      });
    }

    // Get user profile for personalized suggestions
    let userProfile = null;
    if (userId) {
      try {
        userProfile = await User.findById(userId).populate("profile");
      } catch (err) {
        console.log(
          "Could not fetch user profile, proceeding with general suggestions"
        );
      }
    }

    // Initialize Google AI
    const ai = new GoogleGenAI({
      apiKey:
        process.env.GOOGLE_AI_API_KEY ||
        "AIzaSyBZNbCee_ngv7ZtGk6XeMAmOuCo3snyKWE",
    });

    // Build the prompt for food suggestions based on mood/hormones
    const promptObject = await buildFoodSuggestionsPrompt(
      moodDescription,
      userProfile
    );

    console.log(
      "🧠 Generating science-based food suggestions for mood/hormones..."
    );

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [promptObject],
    });

    const rawText = response.text;

    // Clean any markdown wrapping
    const cleaned = rawText
      .replace(/```javascript/g, "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse the AI response
    let foodSuggestions;
    try {
      foodSuggestions = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate food suggestions",
      });
    }

    console.log("blaaaaaaaaaaaaaaaa", foodSuggestions);
    //  moodAnalysis: foodSuggestions.moodAnalysis,
    //         hormonalFactors: foodSuggestions.hormonalFactors,
    //         recommendedFoods: foodSuggestions.recommendedFoods,
    //         mealSuggestions: foodSuggestions.mealSuggestions,
    //         avoidFoods: foodSuggestions.avoidFoods,
    //         scientificBasis: foodSuggestions.scientificBasis,
    //         additionalTips: foodSuggestions.additionalTips,
    // Send successful response
    res.status(200).json({
      success: true,
      foodSuggestions,
      message: "Food suggestions generated successfully",
    });
  } catch (error) {
    console.error("Error in aiFoodSuggestions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while generating food suggestions",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("update profile controller backend");

    const userId = req.user.userId;
    const updateData = req.body;

    // 1️⃣ Find existing profile
    const existingProfile = await Profile.findOne({ user: userId });
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2️⃣ Update profile with new data
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // 3️⃣ Check if nutrition-affecting fields changed
    const nutritionFields = [
      "weight",
      "height",
      "age",
      "gender",
      "activityLevel",
      "fitnessGoal",
      "mealFrequency",
    ];
    const needsNutritionRecalc = nutritionFields.some(
      (field) =>
        updateData.hasOwnProperty(field) &&
        updateData[field] !== existingProfile[field]
    );

    let nutritionGoal = null;
    let extraInfo = {};

    if (needsNutritionRecalc) {
      console.log(
        "Recalculating nutrition due to changes in:",
        nutritionFields.filter(
          (field) =>
            updateData.hasOwnProperty(field) &&
            updateData[field] !== existingProfile[field]
        )
      );

      // 4️⃣ Recalculate nutrition values
      const profileData = updatedProfile.toObject();

      const bmr = await calculateBmr(profileData);
      const tdee = await calculateTdee(bmr, profileData.activityLevel);
      const targetCalories = await adjustCaloriesForGoal(
        tdee,
        profileData.fitnessGoal
      );
      const macros = await calculateMacros(
        targetCalories,
        profileData.fitnessGoal,
        profileData
      );

      // 5️⃣ Recalculate meal distribution
      const mealsPerDay = parseInt(profileData.mealFrequency) || 4;
      const mealDistribution = calculateMealDistribution(macros, mealsPerDay);

      // 6️⃣ Update existing nutrition goal (don't create new one)
      const currentGoal = await NutritionGoal.findOne({
        userId,
        isActive: true,
      });

      if (currentGoal) {
        nutritionGoal = await NutritionGoal.findByIdAndUpdate(
          currentGoal._id,
          {
            calories: targetCalories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            fiber: macros.fiber,
            mealDistribution,
            // Keep the same start/end dates
          },
          { new: true }
        );
      } else {
        // Create new goal if none exists (edge case)
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Default 7-day plan

        nutritionGoal = new NutritionGoal({
          userId,
          calories: targetCalories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          fiber: macros.fiber,
          mealDistribution,
          startDate,
          endDate,
          isActive: true,
        });
        await nutritionGoal.save();
      }

      extraInfo = { bmr, tdee };
    } else {
      // Just get the existing nutrition goal
      nutritionGoal = await NutritionGoal.findOne({ userId, isActive: true });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
      nutritionGoal,
      recalculated: needsNutritionRecalc,
      extraInfo,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Helper function to calculate meal distribution (extracted from your original code)
const calculateMealDistribution = (macros, mealsPerDay) => {
  let mealDistribution;

  if (mealsPerDay === 3) {
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
    mealDistribution[mealType].fat = Math.round(mealDistribution[mealType].fat);
    mealDistribution[mealType].fiber = Math.round(
      mealDistribution[mealType].fiber
    );
  });

  return mealDistribution;
};

// ✅ Mark a single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.userId }, // ensure user owns it
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId; // assuming auth middleware sets req.user

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    }); // latest first

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching notifications",
    });
  }
};

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
          },
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
        updatedAt: meal.updatedAt,
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
    Object.keys(dailyTotals).forEach((key) => {
      dailyTotals[key] = Math.round(dailyTotals[key] * 100) / 100;
    });

    return res.json({
      date,
      meals: mealsArray, // Grouped by meal type
      dailyTotals, // Overall totals for the day
      totalMealTypes: mealsArray.length,
      totalFoodItems: meals.length,
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

    // 1️⃣ Save Profile
    const profile = new Profile({
      ...userProfileData,
      user: userId,
    });
    await profile.save();

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

    // 4️⃣ Save Nutrition Goal
    await NutritionGoal.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, endDate: new Date() } }
    );

    // Calculate end date based on meal plan duration from frontend
    const startDate = new Date();
    const endDate = new Date(startDate);

    // Parse duration from userProfileData - handle both day and month formats
    let durationDays = 7; // default to 7 days

    if (userProfileData.duration) {
      // Check for day format (e.g., "3-day", "7-day")
      const dayMatch = userProfileData.duration.match(/(\d+)-day/);
      if (dayMatch) {
        durationDays = parseInt(dayMatch[1]);
      }
      // Check for week format (e.g., "1-week", "2-weeks")
      else if (userProfileData.duration.includes("week")) {
        const weekMatch = userProfileData.duration.match(/(\d+)-week/);
        if (weekMatch) {
          durationDays = parseInt(weekMatch[1]) * 7;
        }
      }
      // Check for month format (e.g., "1-month", "3-months")
      else if (userProfileData.duration.includes("month")) {
        const monthMatch = userProfileData.duration.match(/(\d+)-month/);
        if (monthMatch) {
          durationDays = parseInt(monthMatch[1]) * 30; // Approximate 30 days per month
        }
      }
    }

    endDate.setDate(startDate.getDate() + durationDays - 1);

    const nutritionGoal = new NutritionGoal({
      userId,
      calories: targetCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
      mealDistribution,
      startDate: startDate,
      endDate: endDate,
      isActive: true,
    });
    await nutritionGoal.save();

    // 3️⃣ Update User (without meal plan reference)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isProfileComplete: true,
        profile: profile._id,
      },
      { new: true }
    );

    console.log("nutrition:", targetCalories, macros);

    res.status(200).json({
      message: "Profile setup complete",
      user: updatedUser,
      profile,
      nutritionGoal,
      extraInfo: { bmr, tdee },
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
