import { create } from "zustand";

export const useProfileStore = create((set, get) => ({
  // Default values for development
  profileData: {
    // Section 1: Basic Information
    age: 30,
    height: 170,
    weight: 70,
    gender: "male",

    // Section 2: Activity Level
    activityLevel: "moderate", // default value
    fitnessGoal: "weight-maintain",
    targetWeight: "",

    // Section 3: Dietary Preferences
    dietPreference: "Non-Vegetarian",
    foodAllergies: ["None"],
    otherAllergies: "",

    // Section 4: Health Information
    medicalConditions: ["None"],
    otherMedicalConditions: "",

    // Section 5: Meal Plan Preferences
    mealFrequency: "3",
    planType: "flexible",
    cuisineRegion: "kerala",
    duration: "3-day",
  },

  // Function to update profile data
  setProfileData: (update) =>
    set((state) => ({
      profileData: { ...state.profileData, ...update },
    })),

  // Fixed getFormDataForSubmission function
  getFormDataForSubmission: () => {
    const state = get();
    const { profileData } = state;
    const allowedFields = [
      "age",
      "height",
      "weight",
      "gender",
      "activityLevel",
      "fitnessGoal",
      "targetWeight",
      "dietPreference",
      "foodAllergies",
      "otherAllergies",
      "medicalConditions",
      "otherMedicalConditions",
      "mealFrequency",
      "planType",
      "cuisineRegion",
      "duration",
    ];

    const cleanData = {};
    allowedFields.forEach((field) => {
      if (profileData.hasOwnProperty(field)) {
        cleanData[field] = profileData[field];
      }
    });

    return cleanData;
  },
}));