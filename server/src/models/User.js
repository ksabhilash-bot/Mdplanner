import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isProfileComplete: { type: Boolean, default: false },

    // New field: status (active, inactive, banned)
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },

    // Reference to Profile (1-to-1)
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },

    // References to Meal Plans (1-to-many)
    mealPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MealPlan" }],
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, // Adds createdAt & updatedAt automatically
  }
);

export default mongoose.model("User", userSchema);
