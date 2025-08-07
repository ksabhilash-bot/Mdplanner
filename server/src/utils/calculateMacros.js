export const calculateMacros = async (calories, goal) => {
  const getMacroSplit = (goal) => {
    const splits = {
      "weight-loss": { protein: 0.4, carbs: 0.3, fat: 0.3 },
      "weight-gain": { protein: 0.3, carbs: 0.5, fat: 0.2 },
      "weight-maintain": { protein: 0.3, carbs: 0.4, fat: 0.3 },
    };
    return splits[goal];
  };

  const split = getMacroSplit(goal);

  const proteinGrams = (calories * split.protein) / 4;
  const carbGrams = (calories * split.carbs) / 4;
  const fatGrams = (calories * split.fat) / 9;

  return {
    calories: Math.round(calories),
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbGrams),
    fat: Math.round(fatGrams),
  };
};
