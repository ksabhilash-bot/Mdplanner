export const calculateMacros = async (calories, goal, user) => {
  const weightKg = user?.weight || 70;
  const age = user?.age || 30;
  const gender = user?.gender?.toLowerCase() || "female";

  // 1️⃣ Protein (based on body weight, not just %)
  let proteinPerKg;
  switch (goal) {
    case "weight-loss":
      proteinPerKg = 2.0; // slightly higher
      break;
    case "weight-gain":
      proteinPerKg = 1.6;
      break;
    case "weight-maintain":
    default:
      proteinPerKg = 1.8;
      break;
  }
  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // 2️⃣ Fat (20–30% of total calories)
  const fatCalories = Math.round(calories * 0.25); // 25% default
  const fatGrams = Math.round(fatCalories / 9);

  // 3️⃣ Carbs (remaining calories)
  const carbCalories = calories - (proteinCalories + fatCalories);
  const carbGrams = Math.max(0, Math.round(carbCalories / 4));

  // 4️⃣ Fiber (based on age & gender)
  const calculateDailyFiber = () => {
    if (gender === "male") {
      return age <= 50 ? 38 : 30;
    } else if (gender === "female") {
      return age <= 50 ? 25 : 21;
    } else {
      return 25;
    }
  };
  const fiberGrams = calculateDailyFiber();

  return {
    calories: Math.round(calories),
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    fiber: fiberGrams,
  };
};
