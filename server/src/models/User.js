import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  isProfileComplete: { type: Boolean, default: false },

  // Reference to Profile (1-to-1)
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },

  // References to Meal Plans (1-to-many)
  mealPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" }],
});

export default mongoose.model("User", userSchema);
