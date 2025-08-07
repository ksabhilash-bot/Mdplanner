export const adjustCaloriesForGoal = async (tdee, goal) => {
  if (goal === "weight-loss") return tdee - 500;
  if (goal === "weight-gain") return tdee + 500;
  return tdee;
};
