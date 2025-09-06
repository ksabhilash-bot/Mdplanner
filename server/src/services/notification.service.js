// services/notification.service.js
import Notification from "../models/Notification.js";

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
