export const buildFoodSuggestionsPrompt = async (
  moodDescription,
  userProfile = null
) => {
  // Extract user profile data if available
  let profileInfo = "";
  if (userProfile) {
    const {
      age,
      gender,
      dietPreference,
      foodAllergies,
      medicalConditions,
      cuisineRegion,
      fitnessGoal,
    } = userProfile;

    profileInfo = `
👤 User Profile Context:
- Age: ${age || "Not specified"}
- Gender: ${gender || "Not specified"}
- Diet Preference: ${dietPreference || "No specific preference"}
- Food Allergies: ${foodAllergies?.join(", ") || "None"}
- Medical Conditions: ${medicalConditions?.join(", ") || "None"}
- Preferred Cuisine: ${cuisineRegion || "No specific preference"}
- Fitness Goal: ${fitnessGoal || "General health"}
    `;
  }

  return {
    role: "user",
    parts: [
      {
        text: `
You are a nutrition expert specializing in the relationship between food, hormones, and mental health. 
Analyze the following mood description and provide science-based food and meal suggestions.

🧠 User's Mood/State Description:
"${moodDescription}"

${profileInfo}

📋 Requirements:
1. Analyze the mood/emotional state and identify potential hormonal imbalances
2. Recommend specific foods that can help balance hormones and improve the described mood
3. Suggest 3-4 complete meal ideas that incorporate these foods
4. List foods to avoid that might worsen the condition
5. Provide scientific explanations for each recommendation
6. Include practical tips for implementation

🛑 Output Format:
Return ONLY a valid JSON object with this exact structure:

{
  "moodAnalysis": "Brief analysis of the mood/emotional state described",
  "hormonalFactors": [
    "List of potential hormonal imbalances or factors contributing to this mood"
  ],
  "recommendedFoods": [
    {
      "food": "Food name",
      "benefits": "How this food helps with hormones/mood",
      "nutrients": "Key nutrients responsible for the benefits"
    }
  ],
  "mealSuggestions": [
    {
      "mealType": "breakfast/lunch/dinner/snack",
      "meal": "Complete meal description",
      "hormonalBenefits": "How this meal helps balance hormones/mood",
      "keyIngredients": ["ingredient1", "ingredient2"]
    }
  ],
  "avoidFoods": [
    {
      "food": "Food to avoid",
      "reason": "Why this food should be avoided for this mood/hormonal state"
    }
  ],
  "scientificBasis": [
    "Research-backed explanations for the recommendations"
  ],
  "additionalTips": [
    "Practical lifestyle tips to support hormonal balance and mood improvement"
  ]
}

Important Guidelines:
- Base all recommendations on established nutritional science
- Consider interactions with any mentioned allergies or medical conditions
- Focus on whole foods and natural sources
- Include foods rich in omega-3s, magnesium, B-vitamins, vitamin D, and other mood-supporting nutrients
- Consider timing of meals for hormonal optimization
- Ensure suggestions are practical and accessible
- Do NOT include any markdown, text explanations, or code blocks - only the JSON object
        `.trim(),
      },
    ],
  };
};
