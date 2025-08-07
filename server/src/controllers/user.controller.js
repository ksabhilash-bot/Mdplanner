import { generateMealPlan } from "../services/user.service.js";

export const profileSetup = async (req, res) => {
  try {
    console.log(req.body);
    const userProfileData = req.body;
    const response = await generateMealPlan(userProfileData);
    console.log("Meal plan: ", response);

    res.status(200).json({ message: response });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
