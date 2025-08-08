import { GoogleGenAI } from "@google/genai";
import { buildMealPlanPrompt } from "../utils/buildMealPlanPrompt.js";
import { calculateBmr } from "../utils/calculateBmr.js";
import { calculateTdee } from "../utils/calculateTdee.js";
import { adjustCaloriesForGoal } from "../utils/adjustCaloriesForGoal.js";
import { calculateMacros } from "../utils/calculateMacros.js";
import User from "../models/User.js";

export const generateMealPlan = async (user) => {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBZNbCee_ngv7ZtGk6XeMAmOuCo3snyKWE",
  });

  // console.log(user.activityLevel);
  // console.log("fitness goal: ", user.fitnessGoal);

  // 1. Calculate bmr
  const bmr = await calculateBmr(user);
  console.log("bmr: ", bmr);

  // 2. Calculate tdee
  const tdee = await calculateTdee(bmr, user.activityLevel);
  console.log("tdee: ", tdee);

  // 3. Adjust calories for user specific goal
  const targetCalories = await adjustCaloriesForGoal(tdee, user.fitnessGoal);
  console.log("target calories: ", targetCalories);

  // 4. Get macros
  const macros = await calculateMacros(targetCalories, user.fitnessGoal);
  console.log(macros);

  // 5. Split calories and macors per meal
  const mealsPerDay = parseInt(user.mealFrequency) || 3; // default to 3 meals

  const perMeal = {
    calories: Math.round(macros.calories / mealsPerDay),
    protein: Math.round(macros.protein / mealsPerDay),
    carbs: Math.round(macros.carbs / mealsPerDay),
    fat: Math.round(macros.fat / mealsPerDay),
  };

  // 6. Generate Meal Plan using Gemini
  const promptObject = await buildMealPlanPrompt(user, macros, perMeal);

  console.log("🤖 Generating personalized meal plan...");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [promptObject],
  });

  const rawText = response.text;

  // Optional: Clean any markdown wrapping
  const cleaned = rawText
    .replace(/```javascript/g, "")
    .replace(/```/g, "")
    .trim();

  // Parse to usable JSON object
  const mealPlan = JSON.parse(cleaned);

  return mealPlan;
};

export const markProfileComplete = async (userId) => {
  try {
    // console.log(userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isProfileComplete: true,
      },
      { new: true }
    );

    console.log(updatedUser);

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: updatedUser };
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
