import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  profileSnapshot: Object, // optional: store profile data at time of plan creation

  planNo: { type: Number }, // remove required: true

  createdAt: { type: Date, default: Date.now },

  meals: [
    {
      day: String,
      breakfast: { meal: String, calories: Number },
      lunch: { meal: String, calories: Number },
      dinner: { meal: String, calories: Number },
    },
  ],
});

// Optional: auto-increment plan number per user
mealPlanSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const lastPlan = await mongoose
    .model("MealPlan")
    .findOne({ user: this.user })
    .sort({ planNo: -1 });

  this.planNo = lastPlan ? lastPlan.planNo + 1 : 1;
  next();
});

export default mongoose.model("MealPlan", mealPlanSchema);
