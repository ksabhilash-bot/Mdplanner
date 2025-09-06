// services/reminder.service.js
import NutritionGoal from "../models/NutritionGoal.js";
import User from "../models/User.js";
import { sendNotification } from "./notification.service.js";

export const sendReminder = async (mealType) => {
  try {
    // Find active goals
    const goals = await NutritionGoal.find({ isActive: true });

    for (const goal of goals) {
      const user = await User.findById(goal.userId);

      if (!user) continue;

      await sendNotification(
        user,
        `⏰ Time for your ${mealType}! Don't skip it.`,
        mealType,
        "reminder"
      );
    }
  } catch (err) {
    console.error("Reminder error:", err);
  }
};
