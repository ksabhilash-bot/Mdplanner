import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, subDays, isBefore, isAfter, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  TrendingUp,
  Clock,
  Check,
  Activity,
  Droplets,
  Coffee,
  Sun,
  Moon,
  Apple,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FullPageSpinner } from "@/components/others/full-page-spinner";
import { useState, useEffect } from "react";
import {
  extendPlan,
  getDailyNutrition,
  getNutritionHistory,
  getUserNutritionGoals,
  markPlanAsExpired,
  regeneratePlan,
  activatePlan,
} from "./nutrition.api";

import { useAuthStore } from "@/features/auth/auth.store";
import { useProfileStore } from "../user/profile/profile.store";
import { fetchUserProfile } from "../user/profile/profile.api";
import { updateUserProfile } from "../user/profile/profile.api";
import { useMutation } from "@tanstack/react-query";

export default function NutritionDashboard() {
  const { user, setUser } = useAuthStore();
  const { profileData, setProfileData } = useProfileStore();

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [extraDays, setExtraDays] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateFormData, setRegenerateFormData] = useState({
    weight: "",
    fitnessGoal: "lose",
    duration: "7",
  });

  // Fetch fresh data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
  });

  // Update stores when data is fetched
  useEffect(() => {
    if (data) {
      setUser(data.user);
      setProfileData(data.profile);
    }
  }, [data, setUser, setProfileData]);

  // Initialize regenerate form data when profile data is available
  useEffect(() => {
    if (profileData) {
      setRegenerateFormData({
        weight: profileData.weight || "",
        fitnessGoal: profileData.fitnessGoal || "lose",
        duration: profileData.duration || "7",
      });
    }
  }, [profileData]);

  // Handle error case
  useEffect(() => {
    if (isError) {
      console.error("fetchUserProfile error:", error);
    }
  }, [isError, error]);

  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // First, fetch user nutrition goals
  const {
    data: nutritionGoalsData,
    isLoading: goalsLoading,
    refetch: refetchGoals,
    isFetching: goalsFetching,
  } = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getUserNutritionGoals,
  });

  const nutritionGoals = nutritionGoalsData?.goal || nutritionGoalsData;
  console.log("hhh", nutritionGoals);

  // Calculate isPlanExpired directly from nutritionGoals
  const calculateIsPlanExpired = () => {
    if (!nutritionGoals) return true;
    if (!nutritionGoals.isActive) return true;

    const today = new Date();
    const endDate = new Date(nutritionGoals.endDate);

    // Reset hours to compare dates properly
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Plan is expired only if today is AFTER endDate
    return today > endDate;
  };

  const { mutate: expirePlan } = useMutation({
    mutationFn: markPlanAsExpired,
    onSuccess: () => {
      console.log("Plan successfully marked as expired");
      queryClient.invalidateQueries(["nutritionGoals"]);
    },
    onError: (error) => {
      console.error("Error expiring plan:", error);
    },
  });

  const isPlanExpired = calculateIsPlanExpired();
  // console.log("plan", isPlanExpired);

  useEffect(() => {
    if (isPlanExpired) {
      expirePlan();
    }
  }, [isPlanExpired]);

  const [expiredSynced, setExpiredSynced] = useState(false);

  useEffect(() => {
    if (isPlanExpired && !expiredSynced) {
      expirePlan();
      setExpiredSynced(true);
    }
  }, [isPlanExpired, expiredSynced]);

  // Then fetch daily nutrition data for the selected date
  const {
    data: dailyNutrition,
    isLoading: dailyLoading,
    refetch: refetchDailyNutrition,
  } = useQuery({
    queryKey: ["dailyNutrition", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => getDailyNutrition(format(selectedDate, "yyyy-MM-dd")),
    enabled: !!nutritionGoals && !isPlanExpired, // Only fetch if we have goals and plan is not expired
  });

  // Handle regenerate form input changes
  const handleRegenerateInputChange = (field, value) => {
    setRegenerateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle regenerate form submission
  const handleRegenerateSubmit = async (e) => {
    e.preventDefault();
    setIsRegenerating(true);

    try {
      // Prepare the data for regeneration
      const updateData = {};

      if (regenerateFormData.weight !== profileData?.weight) {
        updateData.weight = parseFloat(regenerateFormData.weight);
      }

      if (regenerateFormData.fitnessGoal !== profileData?.fitnessGoal) {
        updateData.fitnessGoal = regenerateFormData.fitnessGoal;
      }

      if (regenerateFormData.duration !== profileData?.duration) {
        updateData.duration = regenerateFormData.duration;
      }

      // Always include planType if it exists in profile
      if (profileData?.planType) {
        updateData.planType = profileData.planType;
      }

      console.log("Updating profile with:", updateData);

      // Update the profile with new data - this will trigger the nutrition plan regeneration
      await updateUserProfile(updateData);

      // Wait for backend to process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Refetch ALL data in sequence
      await refetch(); // Refetch profile first
      await refetchGoals(); // Then refetch nutrition goals
      await refetchDailyNutrition(); // Then daily nutrition

      // Wait a bit more for state updates
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reset selected date to force calendar refresh
      setSelectedDate(new Date());

      // Close the modal
      setShowRegenerateModal(false);

      console.log("Profile updated and plan regenerated successfully");

      await updateUserProfile(updateData);
      await activatePlan(); // 👈 reactivate the new plan
      await refetch();
      await refetchGoals();
      await refetchDailyNutrition();
    } catch (err) {
      console.error("Error regenerating plan:", err);
      alert("Error regenerating plan. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle extend plan
  const handleExtendPlan = async () => {
    if (!extraDays) {
      alert("Please enter the number of days.");
      return;
    }

    try {
      await extendPlan(nutritionGoals._id, parseInt(extraDays));
      await activatePlan(); // 👈 reactivate plan in backend
      await refetchGoals();
      setShowExtendModal(false);
      setExtraDays("");
    } catch (error) {
      console.error("Error extending plan:", error);
      alert("Error extending plan. Please try again.");
    }
  };

  // Update the isDateInGoalPeriod function to properly handle date comparisons
  const isDateInGoalPeriod = (date) => {
    if (!nutritionGoals || isPlanExpired) return false;

    const startDate = new Date(nutritionGoals.startDate);
    const endDate = new Date(nutritionGoals.endDate);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return checkDate >= startDate && checkDate <= endDate;
  };

  // Calculate daily progress from tracked meals
  const getDailyProgress = () => {
    if (!dailyNutrition) return { mealsCompleted: 0, caloriesConsumed: 0 };

    const mealsCompleted = dailyNutrition.meals
      ? dailyNutrition.meals.length
      : 0;
    const caloriesConsumed = dailyNutrition.dailyTotals.totalCalories || 0;

    return { mealsCompleted, caloriesConsumed };
  };

  //  Check if a meal type has been completed
  const isMealCompleted = (mealType) => {
    if (!dailyNutrition || !dailyNutrition.meals) return false;
    return dailyNutrition.meals.some((meal) => meal.mealType === mealType);
  };

  // Get consumed values for a specific meal type
  const getMealConsumed = (mealType) => {
    if (!dailyNutrition || !dailyNutrition.meals) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const meal = dailyNutrition.meals.find((m) => m.mealType === mealType);
    return meal ? meal.totals : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  // Get foods for a specific meal type with quantities grouped
  const getMealFoodsWithQuantity = (mealType) => {
    if (!dailyNutrition || !dailyNutrition.meals) return [];

    const meal = dailyNutrition.meals.find((m) => m.mealType === mealType);
    if (!meal || !meal.foods) return [];

    // Group foods by name and sum quantities
    const foodMap = new Map();

    meal.foods.forEach((food) => {
      if (foodMap.has(food.foodName)) {
        const existing = foodMap.get(food.foodName);
        foodMap.set(food.foodName, {
          ...existing,
          quantity: existing.quantity + (food.quantity || 1),
          calories: existing.calories + (food.calories || 0),
        });
      } else {
        foodMap.set(food.foodName, {
          foodName: food.foodName,
          quantity: food.quantity || 1,
          calories: food.calories || 0,
          unit: food.unit || "serving",
        });
      }
    });

    return Array.from(foodMap.values());
  };

  // Get meal distribution from goals
  const getMealDistribution = () => {
    if (!nutritionGoals || !nutritionGoals.mealDistribution) {
      return {
        breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        snack: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      };
    }
    return nutritionGoals.mealDistribution;
  };

  // Get individual meal progress
  const getMealProgress = () => {
    const mealTypes = ["breakfast", "lunch", "snack", "dinner"];
    const mealIcons = {
      breakfast: Coffee,
      lunch: Sun,
      snack: Apple,
      dinner: Moon,
    };

    return mealTypes.map((mealType) => {
      const meal = dailyNutrition?.meals?.find((m) => m.mealType === mealType);
      const goalCalories =
        nutritionGoals?.mealDistribution?.[mealType]?.calories || 0;
      const consumedCalories = meal?.totals?.calories || 0;
      const foodCount = meal?.foods?.length || 0;
      const isCompleted = consumedCalories > 0;

      return {
        mealType,
        icon: mealIcons[mealType],
        consumedCalories,
        goalCalories,
        foodCount,
        isCompleted,
        percentage:
          goalCalories > 0 ? (consumedCalories / goalCalories) * 100 : 0,
      };
    });
  };

  const { mealsCompleted, caloriesConsumed } = getDailyProgress();
  const targetCalories = nutritionGoals?.calories || 2000;
  const goalStartDate = nutritionGoals
    ? new Date(nutritionGoals.startDate)
    : null;
  const goalEndDate = nutritionGoals ? new Date(nutritionGoals.endDate) : null;
  const mealDistribution = getMealDistribution();

  // Show loading only when initially loading, not when refetching
  if (isLoading || goalsLoading || dailyLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="container mx-auto px-2 py-2">
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 mb-2">
        Plan Expired: {isPlanExpired ? "Yes" : "No"} | Has Goals:{" "}
        {!!nutritionGoals ? "Yes" : "No"} | Start:{" "}
        {goalStartDate ? format(goalStartDate, "MMM d") : "N/A"} | End:{" "}
        {goalEndDate ? format(goalEndDate, "MMM d") : "N/A"}
      </div>

      {isPlanExpired && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="mb-2">
            Your nutrition plan has expired! What would you like to do?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExtendModal(true)}>
              Extend Plan
            </Button>

            <Button
              variant="default"
              onClick={() => setShowRegenerateModal(true)}
            >
              Regenerate New Plan
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Calendar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-5 lg:mb-17">
                <p className="text-lg font-medium">
                  {format(selectedDate, "EEEE, MMMM d")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  disabled={!isDateInGoalPeriod(new Date())}
                >
                  Today
                </Button>
              </div>
              {nutritionGoals && !isPlanExpired && (
                <div className="mb-3 text-sm text-gray-600">
                  <p>
                    Goal Period: {format(goalStartDate, "MMM d")} -{" "}
                    {format(goalEndDate, "MMM d, yyyy")}
                  </p>
                </div>
              )}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border p-2"
                disabled={(date) => !isDateInGoalPeriod(date)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Nutrition Stats */}
        <div className="flex flex-col gap-4 h-full">
          {/* Calories Card */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Activity className="w-5 h-5" />
                Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {caloriesConsumed}
                  <span className="text-lg font-normal text-blue-700">
                    {" "}
                    / {targetCalories}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (caloriesConsumed / targetCalories) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  {caloriesConsumed >= targetCalories
                    ? "Goal reached! 🎉"
                    : `${Math.round(
                        targetCalories - caloriesConsumed
                      )} calories remaining`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Progress Grid */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Macronutrients</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="grid grid-cols-2 gap-3 h-full">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-800">
                        Protein
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {dailyNutrition?.dailyTotals?.totalProtein || 0}g
                      </p>
                      <p className="text-xs text-purple-700">
                        / {nutritionGoals?.protein || 0}g
                      </p>
                      <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((dailyNutrition?.dailyTotals?.totalProtein ||
                                0) /
                                (nutritionGoals?.protein || 1)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-orange-800">
                        Carbs
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {dailyNutrition?.dailyTotals?.totalCarbs || 0}g
                      </p>
                      <p className="text-xs text-orange-700">
                        / {nutritionGoals?.carbs || 0}g
                      </p>
                      <div className="w-full bg-orange-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-orange-600 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((dailyNutrition?.dailyTotals?.totalCarbs || 0) /
                                (nutritionGoals?.carbs || 1)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Fat</p>
                      <p className="text-xl font-bold text-gray-900">
                        {dailyNutrition?.dailyTotals?.totalFat || 0}g
                      </p>
                      <p className="text-xs text-red-700">
                        / {nutritionGoals?.fat || 0}g
                      </p>
                      <div className="w-full bg-red-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-red-600 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((dailyNutrition?.dailyTotals?.totalFat || 0) /
                                (nutritionGoals?.fat || 1)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <Droplets className="w-5 h-5 text-red-600 flex-shrink-0" />
                  </div>
                </div>

                <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-pink-800">Fiber</p>
                      <p className="text-xl font-bold text-gray-900">
                        {dailyNutrition?.dailyTotals?.totalFiber || 0}g
                      </p>
                      <p className="text-xs text-pink-700">
                        / {nutritionGoals?.fiber || 0}g
                      </p>
                      <div className="w-full bg-pink-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-pink-600 h-1 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((dailyNutrition?.dailyTotals?.totalFiber || 0) /
                                (nutritionGoals?.fiber || 1)) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <Activity className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Foods Eaten Section - Full width below */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Foods Eaten Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
                  const isCompleted = isMealCompleted(mealType);
                  const foods = getMealFoodsWithQuantity(mealType);
                  const mealIcons = {
                    breakfast: Coffee,
                    lunch: Sun,
                    snack: Apple,
                    dinner: Moon,
                  };
                  const Icon = mealIcons[mealType];
                  const consumed = getMealConsumed(mealType);
                  const target = mealDistribution[mealType] || {};

                  return (
                    <div
                      key={mealType}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`w-5 h-5 ${
                              isCompleted ? "text-green-600" : "text-gray-400"
                            }`}
                          />
                          <h3 className="text-lg font-medium capitalize text-gray-900">
                            {mealType}
                          </h3>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Calories</span>
                          <span>
                            {consumed.calories || 0} / {target.calories || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              isCompleted ? "bg-green-500" : "bg-gray-300"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                target.calories
                                  ? (consumed.calories / target.calories) * 100
                                  : 0
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">
                              Foods ({foods.length})
                            </h4>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {foods.map((food, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm bg-white p-2 rounded border"
                              >
                                <div>
                                  <span className="font-medium text-gray-900 block">
                                    {food.foodName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {food.quantity} {food.unit}
                                    {food.quantity > 1 ? "s" : ""}
                                  </span>
                                </div>
                                <span className="text-gray-600 font-medium">
                                  {food.calories} cal
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">
                          No foods logged for {mealType}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Extend Plan Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-80 border border-zinc-200 dark:border-zinc-700 transition-all duration-200">
            <h2 className="text-lg font-semibold mb-4">Extend Plan</h2>
            <label className="block text-sm mb-2">
              Enter extra days to extend:
            </label>
            <input
              type="number"
              min="1"
              value={extraDays}
              onChange={(e) => setExtraDays(e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 7"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExtendPlan}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Plan Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 p-6 rounded-2xl shadow-2xl w-[400px] border border-zinc-200 dark:border-zinc-700 transition-all duration-200">
            <h2 className="text-lg font-semibold mb-4">Regenerate New Plan</h2>
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-400">
              Update any details before regenerating your plan.
            </p>

            {/* Form for regeneration */}
            <form onSubmit={handleRegenerateSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={regenerateFormData.weight}
                  onChange={(e) =>
                    handleRegenerateInputChange("weight", e.target.value)
                  }
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 70"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Goal</label>
                <select
                  value={regenerateFormData.fitnessGoal}
                  onChange={(e) =>
                    handleRegenerateInputChange("fitnessGoal", e.target.value)
                  }
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Duration</label>
                <select
                  value={regenerateFormData.duration}
                  onChange={(e) =>
                    handleRegenerateInputChange("duration", e.target.value)
                  }
                  className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">1 Month</option>
                </select>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRegenerateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isRegenerating}>
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
