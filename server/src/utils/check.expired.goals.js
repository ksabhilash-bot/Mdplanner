import { NutritionGoal } from "../models/NutritionGoal.js";
import dayjs from "dayjs"; // modern date lib

export const checkExpiredGoals = async () => {
  const today = dayjs().endOf("day").toDate();

  // Find active goals whose endDate has passed
  const expiredGoals = await NutritionGoal.find({
    isActive: true,
    endDate: { $lte: today },
  });

  if (!expiredGoals.length) return;

  for (const goal of expiredGoals) {
    goal.isActive = false;
    await goal.save();

    // Here you can trigger notification logic
    console.log(`Goal expired for user ${goal.userId}`);

    // Optional: you can push this into a notification collection or queue
    // await sendGoalExpiryNotification(goal.userId);
  }
};
