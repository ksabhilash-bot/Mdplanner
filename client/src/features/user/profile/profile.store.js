import { create } from "zustand";

// Set is a function to update store's state
export const useProfileStore = create((set) => ({
  // Setting the initial state
  profileData: {
    age: "",
    height: "",
    weight: "",
    gender: "",
    activityLevel: "",
    dietPreference: "",
    foodAllergies: [],
    otherAllergies: "",
    medicalConditions: [],
    otherMedicalConditions: "",
    mealFrequency: "",
    planType: "",
    duration: "",
  },

  // Function to update the proile data state
  setProfileData: (data) => {
    set((state) => ({
      profileData: { ...state.profileData, ...data },
    }));
  },
}));
