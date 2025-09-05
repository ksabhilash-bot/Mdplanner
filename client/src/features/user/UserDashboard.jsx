import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, subDays, isBefore, isAfter, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TrendingUp, Clock, Check, Activity, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDailyNutrition,
  getNutritionHistory,
  getUserNutritionGoals,
} from "./nutrition.api";

import { useAuthStore } from "@/features/auth/auth.store";
import { useProfileStore } from "../user/profile/profile.store";
import { fetchUserProfile } from "../user/profile/profile.api";

export default function NutritionDashboard() {
  const { user, setUser } = useAuthStore();
  const { profileData, setProfileData } = useProfileStore();

  // Fetch fresh data
  const { data, isLoading, isError, error } = useQuery({
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

  // Handle error case
  useEffect(() => {
    if (isError) {
      console.error("fetchUserProfile error:", error);
    }
  }, [isError, error]);

  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // First, fetch user nutrition goals
  const { data: nutritionGoalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getUserNutritionGoals,
  });

  const nutritionGoals = nutritionGoalsData;

  // Then fetch daily nutrition data for the selected date
  const { data: dailyNutrition, isLoading: dailyLoading } = useQuery({
    queryKey: ["dailyNutrition", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => getDailyNutrition(format(selectedDate, "yyyy-MM-dd")),
    enabled: !!nutritionGoals, // Only fetch after we have the goals
  });

  // Fetch nutrition history for charts
  const { data: nutritionHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["nutritionHistory"],
    queryFn: getNutritionHistory,
    enabled: !!nutritionGoals, // Only fetch after we have the goals
  });

  // Check if selected date is within goal period
  const isDateInGoalPeriod = (date) => {
    if (!nutritionGoals) return true;

    const startDate = new Date(nutritionGoals.startDate);
    const endDate = new Date(nutritionGoals.endDate);

    return !isBefore(date, startDate) && !isAfter(date, endDate);
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

  // Generate chart data from nutrition history or create data for goal period
  const getChartData = () => {
    const targetCalories = nutritionGoals?.calories || 2000;

    // If we have nutrition history data, use it
    if (nutritionHistory && nutritionHistory.length > 0) {
      return nutritionHistory.map((day) => {
        const dayDate = day.date ? new Date(day.date) : new Date();
        const dayName = format(dayDate, "EEE");
        const dateLabel = format(dayDate, "MMM d");

        return {
          name: `${dayName} ${dateLabel}`,
          shortName: dayName,
          date: dateLabel,
          consumed: day.totalCalories || 0,
          target: targetCalories,
        };
      });
    }

    // If no history exists, return data for the goal period
    if (nutritionGoals) {
      const startDate = new Date(nutritionGoals.startDate);
      const endDate = new Date(nutritionGoals.endDate);
      const daysInPeriod =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      return Array.from({ length: daysInPeriod }, (_, i) => {
        const date = addDays(startDate, i);
        return {
          name: format(date, "EEE MMM d"),
          shortName: format(date, "EEE"),
          date: format(date, "MMM d"),
          consumed: 0,
          target: targetCalories,
        };
      });
    }

    // Fallback: return empty data for the last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, "EEE MMM d"),
        shortName: format(date, "EEE"),
        date: format(date, "MMM d"),
        consumed: 0,
        target: targetCalories,
      };
    });
  };

  const chartData = getChartData();
  const { mealsCompleted, caloriesConsumed } = getDailyProgress();
  const targetCalories = nutritionGoals?.calories || 2000;
  const goalStartDate = nutritionGoals
    ? new Date(nutritionGoals.startDate)
    : null;
  const goalEndDate = nutritionGoals ? new Date(nutritionGoals.endDate) : null;

  if (goalsLoading || dailyLoading || historyLoading)
    return <FullPageSpinner />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Calendar and Chart */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
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
              {nutritionGoals && (
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

          <Card>
            <CardHeader>
              <CardTitle>
                {nutritionGoals
                  ? "Calorie Progress (Goal Period)"
                  : "Calorie Progress (Last 7 Days)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(value) => {
                      const item = chartData.find(
                        (item) => item.name === value
                      );
                      return item ? item.shortName : value;
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 border rounded-lg shadow-sm">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">
                              <span className="text-[#8884d8]">Target:</span>{" "}
                              {payload[0].payload.target} cal
                            </p>
                            <p className="text-sm">
                              <span className="text-[#82ca9d]">Consumed:</span>{" "}
                              {payload[0].payload.consumed} cal
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Target Calories"
                  />
                  <Line
                    type="monotone"
                    dataKey="consumed"
                    stroke="#82ca9d"
                    name="Consumed Calories"
                  />
                </LineChart>
              </ResponsiveContainer>
              {(!nutritionHistory || nutritionHistory.length === 0) && (
                <div className="text-center mt-2 text-sm text-gray-500">
                  No nutrition history yet. Start tracking meals to see your
                  progress!
                </div>
              )}
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
                    : `${targetCalories - caloriesConsumed} calories remaining`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meals Card */}
          <Card className="bg-green-50 border border-green-200 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Clock className="w-5 h-5" />
                Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-900 mb-2">
                  {mealsCompleted}
                  <span className="text-lg font-normal text-green-700">
                    {" "}
                    / {profileData?.mealFrequency || 3}
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (mealsCompleted / (profileData?.mealFrequency || 3)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  {mealsCompleted >= (profileData?.mealFrequency || 3)
                    ? "All meals tracked! 🎉"
                    : `${
                        (profileData?.mealFrequency || 3) - mealsCompleted
                      } meals remaining`}
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
                    </div>
                    <Activity className="w-5 h-5 text-pink-600 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
