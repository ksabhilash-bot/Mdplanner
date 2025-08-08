import {
  generateMealPlan,
  markProfileComplete,
} from "../services/user.service.js";

export const profileSetup = async (req, res) => {
  try {
    console.log(req.user);

    console.log(req.body);
    const userProfileData = req.body;
    const userId = req.user.userId;

    const mealPlan = await generateMealPlan(userProfileData);
    console.log("Meal plan: ", mealPlan);

    const response = markProfileComplete(userId);
    const updatedUser = response?.data;

    res.status(200).json({ message: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
