import { create } from "zustand";

export const mealPlanStore = create((set) => ({
  mealPlan: null,

  setMealPlan: (plan) => {
    set({ mealPlan: plan });
  },

  clearMealPlan: () => {
    set({ mealPlan: null });
  },
}));
