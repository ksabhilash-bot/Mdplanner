// import { create } from "zustand";

// // Set is a function to update store's state
// export const useProfileStore = create((set) => ({
//   // Setting the initial state
//   profileData: {
//     age: "",
//     height: "",
//     weight: "",
//     gender: "",
//     activityLevel: "",
//     fitnessGoal: "",
//    targetWeight: "",
//     dietPreference: "",
//     foodAllergies: [],
//     otherAllergies: "",
//     medicalConditions: [],
//     otherMedicalConditions: "",
//     mealFrequency: "",
//     planType: "",
//     duration: "",
//   },

//   // Function to update the proile data state
//   setProfileData: (data) => {
//     set((state) => ({
//       profileData: { ...state.profileData, ...data },
//     }));
//   },
// }));

// profile.store.js
import { create } from "zustand";

export const useProfileStore = create((set) => ({
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
}));
