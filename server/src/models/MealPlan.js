import mongoose from "mongoose";

const mealSubSchema = new mongoose.Schema({
  meal: String,
  calories: Number,
  eaten: { type: Boolean, default: false }, // New
});

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  profileSnapshot: Object, // optional: store profile data at time of plan creation

  planNo: { type: Number }, // remove required: true

  createdAt: { type: Date, default: Date.now },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targetCalories: { type: Number },
  
  meals: [
    {
      date: Date,
      breakfast: mealSubSchema,
      lunch: mealSubSchema,
      dinner: mealSubSchema,
    },
  ],
});

// Auto-increment plan number per user
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
