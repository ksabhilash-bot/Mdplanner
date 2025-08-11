import { useMealPlanStore } from "../meal/mealPlan.store";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { format, addDays, isAfter, isBefore, isSameDay } from "date-fns"; // Added isSameDay
import { fetchMealPlan } from "./meal.api";
import { useQuery } from "@tanstack/react-query";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MealPlan() {
  const navigate = useNavigate();
  const { mealPlan, setMealPlan } = useMealPlanStore();
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 2), // Default 3-day range
  });

  // Fetch meal plan on load
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userMealPlan"],
    queryFn: fetchMealPlan,
    select: (data) => data?.mealPlan,
  });

  // Update store when data is fetched
  useEffect(() => {
    if (data) {
      console.log("Fetched meal plan data:", data);
      setMealPlan(data);
      const duration = data.duration || "3-day";
      const toDate = duration === "1-week" ? addDays(new Date(), 6) : addDays(new Date(), 2);
      setDateRange({
        from: new Date(),
        to: toDate,
      });
    }
  }, [data, setMealPlan]);

  if (isLoading) return <FullPageSpinner />;

  if (isError) {
    console.error("Error loading meal plan:", error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>{error?.message || "Error loading meal plan"}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!mealPlan) {
    console.log("No meal plan data available");
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No meal plan data available</p>
        <Button onClick={() => navigate("/profile")} className="mt-4">
          Back to Profile
        </Button>
      </div>
    );
  }

  // Filter meals for the selected date range
  const filteredDays = (mealPlan.meals || []).filter((day) => {
    try {
      if (!day?.date) {
        console.warn("Meal day missing date:", day);
        return false;
      }
      
      const dayDate = new Date(day.date);
      if (isNaN(dayDate.getTime())) {
        console.warn("Invalid date format:", day.date);
        return false;
      }
      
      return (
        (isAfter(dayDate, dateRange.from) || isSameDay(dayDate, dateRange.from)) &&
        (isBefore(dayDate, dateRange.to) || isSameDay(dayDate, dateRange.to))
      );
    } catch (e) {
      console.error("Error parsing date:", day?.date, e);
      return false;
    }
  });

  console.log("Filtered days:", filteredDays);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Meal Plan #{mealPlan.planNo}</h1>
            <p className="text-sm text-muted-foreground">
              Duration: {mealPlan.duration || "3-day"} | {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              Back
            </Button>
          </div>
        </div>

        {/* Date Picker */}
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              setDateRange({ from: range.from, to: range.to });
            }
          }}
          className="rounded-md border p-2"
          numberOfMonths={1}
          disabled={{ before: new Date() }}
        />

        {/* Debug info */}
        <div className="text-xs text-muted-foreground">
          <p>Total meals in plan: {mealPlan.meals?.length || 0}</p>
          <p>Showing: {filteredDays.length} days</p>
        </div>

        {/* Meal Plan Days */}
        {filteredDays.length > 0 ? (
          <div className="space-y-3">
            {filteredDays.map((day) => (
              <Card key={day._id || day.date} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {format(new Date(day.date), "EEEE, MMM d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                    <div key={mealType} className="space-y-1">
                      <h3 className="text-sm font-medium capitalize">{mealType}</h3>
                      <div className="bg-muted/20 p-3 rounded-md">
                        <p className="text-sm">{day[mealType]?.meal || "Not specified"}</p>
                        <p className="text-xs text-muted-foreground">
                          {day[mealType]?.calories || "?"} cal
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No meals found for selected date range</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check if your meal plan has dates within {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
            </p>
            <Button 
              onClick={() => setDateRange({
                from: new Date(),
                to: addDays(new Date(), mealPlan.duration === "1-week" ? 6 : 2)
              })}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Reset to default range
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={() => navigate(-1)} size="sm" variant="outline">
            Back to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}