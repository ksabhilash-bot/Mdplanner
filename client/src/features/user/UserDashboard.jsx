import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Check, Edit, Plus, TrendingUp, Clock, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchMealPlan } from "../user/meal/meal.api";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect, useState } from "react";
import { useMealPlanStore } from "../user/meal/mealPlan.store";
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

export default function NutritionDashboard() {
  const navigate = useNavigate();
  const { mealPlan, setMealPlan } = useMealPlanStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(
    localStorage.getItem("nutritionDashboardMood") || ""
  );
  const [notes, setNotes] = useState(
    localStorage.getItem("nutritionDashboardNotes") || ""
  );

  // Fetch meal plan
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userMealPlan"],
    queryFn: fetchMealPlan,
    select: (data) => data?.mealPlan,
  });

  // Update store when data is fetched
  useEffect(() => {
    if (data) {
      setMealPlan(data);
    }
  }, [data, setMealPlan]);

  // Save mood and notes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("nutritionDashboardMood", mood);
  }, [mood]);

  useEffect(() => {
    localStorage.setItem("nutritionDashboardNotes", notes);
  }, [notes]);

  // Find meal for the selected date
  const dayMeal = (mealPlan?.meals || []).find((day) => {
    if (!day?.date) return false;
    const dayDate = parseISO(day.date);
    return !isNaN(dayDate.getTime()) && isSameDay(dayDate, selectedDate);
  });

  // Calculate daily progress
  const getDailyProgress = () => {
    if (!dayMeal) return { mealsCompleted: 0, caloriesConsumed: 0 };

    let mealsCompleted = 0;
    let caloriesConsumed = 0;

    ["breakfast", "lunch", "dinner"].forEach((mealType) => {
      if (dayMeal[mealType]?.eaten) {
        mealsCompleted++;
        caloriesConsumed += dayMeal[mealType]?.calories || 0;
      }
    });

    return { mealsCompleted, caloriesConsumed };
  };

  // Generate chart data from meal plan using actual dates
  const getChartData = () => {
    if (!mealPlan?.meals) return [];

    return mealPlan.meals.map((day) => {
      const dayDate = day.date ? parseISO(day.date) : new Date();
      const dayName = format(dayDate, "EEE"); // Short day name (Mon, Tue, etc.)
      const dateLabel = format(dayDate, "MMM d"); // Month and day (Jan 1)

      const consumedCalories = ["breakfast", "lunch", "dinner"].reduce(
        (total, mealType) =>
          total + (day[mealType]?.eaten ? day[mealType]?.calories || 0 : 0),
        0
      );

      return {
        name: `${dayName} ${dateLabel}`, // Combine day name and date
        shortName: dayName, // Just the day name
        date: dateLabel, // Just the date
        consumed: consumedCalories,
        target: mealPlan.targetCalories || 2000,
      };
    });
  };

  const chartData = getChartData();
  const { mealsCompleted, caloriesConsumed } = getDailyProgress();

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar & Summary */}
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
                >
                  Today
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border p-2"
                disabled={{
                  before: parseISO(
                    mealPlan?.startDate || new Date().toISOString()
                  ),
                  after: parseISO(
                    mealPlan?.endDate || new Date().toISOString()
                  ),
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/user/profile")}
              >
                <Check className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/user/meal-plan")}
              >
                <Edit className="mr-2 h-4 w-4" />
                View Full Meal Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Calories
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {caloriesConsumed}
                    </p>
                    <p className="text-xs text-blue-700">
                      / {mealPlan?.targetCalories || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Meals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mealsCompleted}
                    </p>
                    <p className="text-xs text-green-700">/ 3</p>
                  </div>
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Plan</p>
                    <p className="text-xl font-bold text-gray-900">
                      #{mealPlan?.planNo || "--"}
                    </p>
                  </div>
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-800">Mood</p>
                    <select
                      className="text-sm bg-transparent border-none focus:outline-none text-gray-900"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    >
                      <option value="">Select mood</option>
                      <option value="😊 Great">😊 Great</option>
                      <option value="🙂 Good">🙂 Good</option>
                      <option value="😐 Okay">😐 Okay</option>
                    </select>
                  </div>
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calorie Progress</CardTitle>
              <p className="text-sm text-muted-foreground">
                {mealPlan?.startDate &&
                  format(parseISO(mealPlan.startDate), "MMM d")}{" "}
                -
                {mealPlan?.endDate &&
                  format(parseISO(mealPlan.endDate), "MMM d, yyyy")}
              </p>
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
                      // Display just the short day name if space is limited
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Today's Meals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Today's Meals</CardTitle>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/meal-plan")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Meal
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayMeal ? (
                ["breakfast", "lunch", "dinner"].map((mealType) => (
                  <div
                    key={mealType}
                    className={`p-4 rounded-lg border ${
                      dayMeal[mealType]?.eaten
                        ? "bg-green-50 border-green-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{mealType}</h3>
                        <p
                          className={`text-sm ${
                            dayMeal[mealType]?.eaten
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          }`}
                        >
                          {dayMeal[mealType]?.meal || "Not specified"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dayMeal[mealType]?.calories || "--"} calories
                        </p>
                      </div>
                      {dayMeal[mealType]?.eaten ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/meal-plan")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No meals planned for today</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/meal-plan")}
                  >
                    Create Meal Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Quick Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Add notes about your day..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
