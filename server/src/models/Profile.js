import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  age: Number,
  height: Number,
  weight: Number,
  gender: String,

  activityLevel: String,
  fitnessGoal: String,
  targetWeight: String,

  dietPreference: String,
  foodAllergies: [String],
  otherAllergies: String,

  medicalConditions: [String],
  otherMedicalConditions: String,

  mealFrequency: String,
  planType: String,
  cuisineRegion: String,
  duration: String,
});

export default mongoose.model("Profile", profileSchema);
