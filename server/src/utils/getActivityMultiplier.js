export const getActivityMultiplier = async (level) => {
  const levels = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };
  return levels[level] || 1.2;
};
