import mongoose from "mongoose";

const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    foodName: { type: String, required: true },
    quantity: { type: Number, required: true },
    servingType: { type: String }, // e.g., "grams", "ml", "piece"

    // Nutrition data for this log
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    weight_grams: Number,

    date: { type: Date, required: true }, // stored as Date
  },
  { timestamps: true }
);

export const MealLog = mongoose.model("MealLog", mealLogSchema);
