import mongoose from "mongoose";

const nutritionGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },

    // Per-meal breakdown (flexible object)
    mealDistribution: {
      type: Map,
      of: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number,
      },
      default: {},
    },

    // Date range for when this goal is valid
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },

    mealTimes: {
      breakfast: { type: String, default: "08:00" }, // HH:mm
      lunch: { type: String, default: "13:00" },
      snack: { type: String, default: "17:00" },
      dinner: { type: String, default: "20:00" },
    },
  },
  { timestamps: true }
);

export const NutritionGoal = mongoose.model(
  "NutritionGoal",
  nutritionGoalSchema
);
