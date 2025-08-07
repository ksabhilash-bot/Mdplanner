export const buildMealPlanPrompt = async (user, macros, perMeal) => {
  const {
    age,
    gender,
    height,
    weight,
    activityLevel,
    dietPreference,
    foodAllergies,
    otherAllergies,
    medicalConditions,
    otherMedicalConditions,
    mealFrequency,
    planType,
    cuisineRegion,
    duration,
    fitnessGoal,
  } = user;

  return {
    role: "user",
    parts: [
      {
        text: `
Create a personalized ${duration} meal plan based on the following user profile:

👤 User Profile:
- Age: ${age}
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Activity Level: ${activityLevel}
- Fitness Goal: ${fitnessGoal}
- Diet Preference: ${dietPreference}
- Food Allergies: ${foodAllergies.join(", ") || "None"}
- Other Allergies: ${otherAllergies || "None"}
- Medical Conditions: ${medicalConditions.join(", ") || "None"}
- Other Medical Conditions: ${otherMedicalConditions || "None"}
- Meals per day: ${mealFrequency}
- Plan Type: ${planType}
- Cuisine Region: ${cuisineRegion}

🍽️ Daily Nutritional Targets:
- Calories: ${macros.calories} kcal
- Protein: ${macros.protein} g
- Carbs: ${macros.carbs} g
- Fat: ${macros.fat} g

🍳 Per Meal (for ${mealFrequency} meals/day):
- Calories: ${perMeal.calories} kcal
- Protein: ${perMeal.protein} g
- Carbs: ${perMeal.carbs} g
- Fat: ${perMeal.fat} g

📋 Requirements:
1. Generate meals for ${duration}, with breakfast, lunch, and dinner for each day.
2. Each meal must match the approximate per-meal calorie and macro targets.
3. Include variety across days — no meal should repeat.
4. Use only ingredients aligned with user's diet, health, and regional preferences.
5. Avoid foods that conflict with allergies or medical conditions.

🛑 Output Format:
Return ONLY a valid JavaScript array of objects (not stringified, not in quotes, not wrapped in text).

Structure it exactly like this:
[
  {
    "day": "Day 1",
    "breakfast": {
      "meal": "Puttu with kadala curry",
      "calories": 550
    },
    "lunch": {
      "meal": "Kerala rice, aviyal, fish curry",
      "calories": 750
    },
    "dinner": {
      "meal": "Chapati with egg curry",
      "calories": 600
    }
  },
  ...
]

Important:
- Return an array of JavaScript objects only.
- Each meal must include a \`meal\` name/description and its \`calories\`.
- Do NOT include text, markdown, or stringified objects.
- Ensure the format is directly parsable with JSON.parse().
        `.trim(),
      },
    ],
  };
};
