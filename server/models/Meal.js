import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  type: String,
});

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;