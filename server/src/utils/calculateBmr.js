export const calculateBmr = async (user) => {
  const { age, height, weight, gender } = user;

  return gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
};
