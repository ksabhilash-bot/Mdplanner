// cron/reminder.cron.js
import cron from "node-cron";
import { MealLog } from "../models/MealLog.js";
import { NutritionGoal } from "../models/NutritionGoal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { checkExpiredGoals } from "../utils/check.expired.goals.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily goal expiration check...");
  await checkExpiredGoals();
});

export const sendNotification = async (
  user,
  message,
  mealType,
  type = "reminder"
) => {
  const today = new Date().toISOString().split("T")[0];

  await Notification.create({
    userId: user._id,
    message,
    mealType,
    type,
    date: today,
  });

  console.log(`📢 Notification for ${user.email}: ${message}`);
};

// Default meal times if user doesn't have custom times
const defaultMealTimes = {
  breakfast: "8:00",
  lunch: "13:00",
  snack: "17:00",
  snack2: "18:13", // ⬅️ updated
  dinner: "20:00",
};

// Send meal reminders at meal times
cron.schedule("0 8,13,17,20 * * *", async () => {
  const currentHour = new Date().getHours();
  let mealType;

  switch (currentHour) {
    case 8:
      mealType = "breakfast";
      break;
    case 13:
      mealType = "lunch";
      break;
    case 17:
      mealType = "snack";
      break;
    case 20:
      mealType = "dinner";
      break;
  }

  if (mealType) {
    console.log(`⏰ Sending ${mealType} reminders...`);
    await sendMealReminder(mealType);
  }
});

// Send breakfast reminder at 9:55 AM
cron.schedule("53 9 * * *", async () => {
  console.log("⏰ Sending breakfast reminders...");
  await sendMealReminder("breakfast");
});

// Separate cron for snack at 6:13 PM
// cron.schedule("15 18 * * *", async () => {
//   console.log("⏰ Sending 6:15 PM snack reminders...");
//   await sendMealReminder("snack2"); // use your new "snack2"
// });

// For testing: run every 3 minutes
// cron.schedule("*/3 * * * *", async () => {
//   const currentHour = new Date().getHours();
//   const currentMinute = new Date().getMinutes();

//   // Cycle through mealTypes for testing
//   const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
//   const mealType = mealTypes[currentMinute % mealTypes.length];

//   console.log(`⏰ [TEST MODE] Sending ${mealType} reminders...`);
//   await sendMealReminder(mealType);
// });

// Check for skipped meals every hour
cron.schedule("0 * * * *", async () => {
  console.log("🔍 Checking for skipped meals...");
  await checkSkippedMeals();
});

// Check for skipped meals every 1 minute (testing mode)
// cron.schedule("*/1 * * * *", async () => {
//   console.log("🔍 [TEST MODE] Checking for skipped meals...");
//   await checkSkippedMeals();
// });

// Send meal reminder function
async function sendMealReminder(mealType) {
  try {
    console.log("send meal reminder function");

    const today = new Date().toISOString().split("T")[0];
    console.log("today", today);

    // Get active nutrition goals
    const activeGoals = await NutritionGoal.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    }).populate("userId");

    console.log("activegoals");

    for (const goal of activeGoals) {
      const user = goal.userId;
      console.log("user", user);

      // if (user?.isActive) continue;
      console.log("hello");

      // Check if meal already logged
      const mealExists = await MealLog.findOne({
        userId: user._id,
        mealType,
        date: today,
      });
      console.log("mealexists", mealExists);

      if (!mealExists) {
        // Check if reminder already sent
        const reminderSent = await Notification.findOne({
          userId: user._id,
          mealType,
          date: today,
          type: "reminder",
        });
        if (reminderSent) {
          console.log("reminder already sended");
        }

        if (!reminderSent) {
          const mealTime =
            goal.mealTimes?.[mealType] || defaultMealTimes[mealType];
          console.log(
            `⏰ Time for your ${mealType}! (${mealTime})`,
            mealType,
            "reminder"
          );

          await sendNotification(
            user,
            `⏰ Time for your ${mealType}! (${mealTime})`,
            mealType,
            "reminder"
          );
        }
      }
    }
  } catch (error) {
    console.error(`Error sending ${mealType} reminders:`, error);
  }
}

// Check for skipped meals (enhanced from your original)
async function checkSkippedMeals() {
  try {
    console.log("checkSkippedMeals function");

    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split("T")[0];

    const mealWindows = {
      breakfast: { endHour: 10 },
      lunch: { endHour: 15 },
      snack: { endHour: 19 },
      dinner: { endHour: 22 },
    };

    // Get active nutrition goals
    const activeGoals = await NutritionGoal.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
    }).populate("userId");

    for (const goal of activeGoals) {
      const user = goal.userId;
      // if (!user?.isActive) continue;
      console.log("user");

      for (const [mealType, { endHour }] of Object.entries(mealWindows)) {
        console.log("mealWindows");
        // Check if meal window has passed
        if (currentHour >= endHour) {
          const mealLogged = await MealLog.findOne({
            userId: user._id,
            mealType,
            date: today,
          });

          console.log("meallogged", mealLogged);

          // Check if skip notification already sent
          const skipNotificationSent = await Notification.findOne({
            userId: user._id,
            mealType,
            date: today,
            type: "skipped",
          });

          if (!mealLogged && !skipNotificationSent) {
            console.log(
              user,
              `⚠️ You missed your ${mealType}. Try not to skip it next time!`,
              mealType,
              "skipped"
            );

            await sendNotification(
              user,
              `⚠️ You missed your ${mealType}. Try not to skip it next time!`,
              mealType,
              "skipped"
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking skipped meals:", error);
  }
}

console.log("✅ Meal reminder system started");
console.log("⏰ Reminders: 8AM, 1PM, 5PM, 8PM");
console.log("🔍 Skip checks: Every hour");
