// mealPlan.store.js
import { create } from "zustand";

export const useMealPlanStore = create((set) => ({
  mealPlan: null,
  setMealPlan: (data) => set({ mealPlan: data }),
  clearMealPlan: () => set({ mealPlan: null }),
}));
