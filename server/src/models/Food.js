import mongoose from "mongoose";

const servingSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g., "cup", "bowl"
    quantity: { type: Number, required: true },
    weight_grams: { type: Number, default: null }, // solid foods
    volume_ml: { type: Number, default: null }, // liquid foods
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  { _id: false } // don’t auto-generate _id for each serving
);

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    meals: {
      type: [String], // ["breakfast", "lunch", "dinner"]
      enum: ["breakfast", "lunch", , "snack", "dinner"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "main dish",
        "curry",
        "veg side",
        "non-veg side",
        "snack",
        "beverage",
        "accompaniment",
      ],
      required: true,
    },
    subCategory: { type: String }, // e.g., "others", "thoran", "mezhukkuperatti"
    servings: { type: [servingSchema], required: true },
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);

export default Food;
