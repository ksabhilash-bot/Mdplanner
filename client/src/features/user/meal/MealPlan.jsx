import { useMealPlanStore } from "../meal/mealPlan.store";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";
import { fetchMealPlan, updateMealCompletion, updateMeal, getMealOptions } from "./meal.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Edit, Plus, X, ChevronDown, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MealPlan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mealPlan, setMealPlan } = useMealPlanStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingMeal, setEditingMeal] = useState(null);
  const [editedMealData, setEditedMealData] = useState({
    meal: "",
    calories: "",
  });
  const [updatingMeal, setUpdatingMeal] = useState(null); // Track which meal is updating

  // Fetch meal plan
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userMealPlan"],
    queryFn: fetchMealPlan,
    select: (data) => data?.mealPlan,
  });

  // Fetch meal options for editing
  const { data: mealOptions } = useQuery({
    queryKey: ["mealOptions"],
    queryFn: getMealOptions,
    enabled: !!editingMeal,
  });

  // Mark meal as eaten mutation
  const markMealEatenMutation = useMutation({
    mutationFn: updateMealCompletion,
    onMutate: ({ mealType }) => {
      setUpdatingMeal(mealType); // Set which meal is updating
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMealPlan"] });
      toast.success("Meal status updated");
      setUpdatingMeal(null); // Clear updating state
    },
    onError: (error) => {
      toast.error("Failed to update meal status", {
        description: error.message || "Please try again",
      });
      setUpdatingMeal(null); // Clear updating state on error
    }
  });

  // Update meal mutation
  const updateMealMutation = useMutation({
    mutationFn: updateMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userMealPlan"] });
      toast.success("Meal updated successfully");
      setEditingMeal(null);
    },
    onError: (error) => {
      toast.error("Failed to update meal", {
        description: error.message || "Please try again",
      });
    },
  });

  // Update store when data is fetched
  useEffect(() => {
    if (data) {
      setMealPlan(data);
    }
  }, [data, setMealPlan]);

  const handleMarkEaten = (mealType, eaten) => {
    if (!mealPlan?._id) return;
    markMealEatenMutation.mutate({
      mealPlanId: mealPlan._id,
      date: selectedDate,
      mealType,
      eaten
    });
  };

  const handleStartEditing = (mealType, currentMeal) => {
    // Don't allow editing if meal is already eaten
    if (currentMeal?.eaten) return;
    
    setEditingMeal(mealType);
    setEditedMealData({
      meal: currentMeal?.meal || "",
      calories: currentMeal?.calories?.toString() || "",
    });
  };

  const handleCancelEditing = () => {
    setEditingMeal(null);
    setEditedMealData({ meal: "", calories: "" });
  };

  const handleSaveMeal = (mealType) => {
    if (!mealPlan?._id || !dayMeal) return;
    
    updateMealMutation.mutate({
      dayId: dayMeal._id,
      mealType,
      date: selectedDate,
      updates: {
        meal: editedMealData.meal,
        calories: parseInt(editedMealData.calories) || 0,
        eaten: false, // Reset eaten status when editing
      },
    });
  };

  const handleSwapMeal = (mealType, optionId) => {
    if (!mealPlan?._id || !dayMeal || !mealOptions) return;
    
    const selectedOption = mealOptions.find(opt => opt._id === optionId);
    if (!selectedOption) return;
    
    updateMealMutation.mutate({
      dayId: dayMeal._id,
      mealType,
      date: selectedDate,
      updates: {
        meal: selectedOption.meal,
        calories: selectedOption.calories,
        eaten: false, // Reset eaten status when swapping
      },
    });
  };

  if (isLoading) return <FullPageSpinner />;

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p>{error?.message || "Error loading meal plan"}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p>No meal plan data available</p>
        <Button onClick={() => navigate("/profile")} className="mt-4">
          Back to Profile
        </Button>
      </div>
    );
  }

  // Find meal for the selected date
  const dayMeal = (mealPlan.meals || []).find((day) => {
    if (!day?.date) return false;
    const dayDate = parseISO(day.date);
    return !isNaN(dayDate.getTime()) && isSameDay(dayDate, selectedDate);
  });

  return (
    <div className="container mx-auto px-2 xl:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-4 justify-center">
        {/* Left Column - Calendar */}
        <div className="lg:w-[38%]">
          <div className="sticky top-8 space-y-4">
            <div className="flex justify-between items-center max-w-fit">
              <h2 className="text-xl font-semibold">Select Date</h2>
              <Button
                onClick={() => setSelectedDate(new Date())}
                variant="outline"
                size="sm"
                className="ml-16"
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
                before: parseISO(mealPlan.startDate),
                after: parseISO(mealPlan.endDate),
              }}
            />
            <div className="text-sm text-muted-foreground">
              <p>
                Plan period: {format(parseISO(mealPlan.startDate), "MMM d")} -{" "}
                {format(parseISO(mealPlan.endDate), "MMM d, yyyy")}
              </p>
              <p>Total days: {mealPlan.meals?.length || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Meals */}
        <div className="lg:w-[58%]">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">
                  Meal Plan #{mealPlan.planNo}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/meal-plan/edit")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            </div>

            {dayMeal ? (
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Today's Meals</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["breakfast", "lunch", "dinner"].map((mealType) => (
                    <div key={mealType} className="space-y-2">
                      <div className="flex justify-between items-center border-b pb-1">
                        <h3 className="text-sm font-medium capitalize">
                          {mealType}
                        </h3>
                        {editingMeal !== mealType && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartEditing(mealType, dayMeal[mealType])}
                            disabled={dayMeal[mealType]?.eaten || updatingMeal === mealType}
                            className={dayMeal[mealType]?.eaten ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      {editingMeal === mealType ? (
                        <div className="p-4 rounded-lg bg-muted/10 border space-y-3">
                          <div>
                            <Label htmlFor={`edit-${mealType}-meal`}>Meal</Label>
                            <Input
                              id={`edit-${mealType}-meal`}
                              value={editedMealData.meal}
                              onChange={(e) => setEditedMealData({
                                ...editedMealData,
                                meal: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-${mealType}-calories`}>Calories</Label>
                            <Input
                              id={`edit-${mealType}-calories`}
                              type="number"
                              value={editedMealData.calories}
                              onChange={(e) => setEditedMealData({
                                ...editedMealData,
                                calories: e.target.value
                              })}
                            />
                          </div>
                          
                          {mealOptions && (
                            <div>
                              <Label>Swap with saved meal</Label>
                              <Select
                                onValueChange={(value) => handleSwapMeal(mealType, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a meal" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mealOptions.map((option) => (
                                    <SelectItem key={option._id} value={option._id}>
                                      {option.meal} ({option.calories} cal)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleSaveMeal(mealType)}
                              disabled={updateMealMutation.isPending}
                              className="flex-1"
                            >
                              {updateMealMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEditing}
                              disabled={updateMealMutation.isPending}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-lg flex flex-col justify-between min-h-[140px] transition-all duration-200 ${
                          dayMeal[mealType]?.eaten 
                            ? "bg-green-50 border border-green-200" 
                            : "bg-muted/10 border border-transparent"
                        }`}>
                          <div className="flex-grow">
                            <p className={`text-sm font-medium mb-2 transition-all duration-200 word-wrap break-words ${
                              dayMeal[mealType]?.eaten 
                                ? "line-through text-muted-foreground" 
                                : ""
                            }`}>
                              {dayMeal[mealType]?.meal || "Not specified"}
                            </p>
                            <p className={`text-xs transition-all duration-200 ${
                              dayMeal[mealType]?.eaten 
                                ? "line-through text-muted-foreground/70" 
                                : "text-muted-foreground"
                            }`}>
                              {dayMeal[mealType]?.calories
                                ? `${dayMeal[mealType].calories} calories`
                                : "Calories not specified"}
                            </p>
                          </div>
                          
                          {/* Checkbox stays at bottom */}
                          <div className="mt-4 pt-2 border-t border-border/10 flex items-center space-x-2">
                            <Checkbox
                              id={`${mealType}-eaten`}
                              checked={dayMeal[mealType]?.eaten || false}
                              onCheckedChange={(checked) => handleMarkEaten(mealType, checked)}
                              disabled={updatingMeal === mealType}
                            />
                            <label
                              htmlFor={`${mealType}-eaten`}
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center transition-all duration-200 ${
                                dayMeal[mealType]?.eaten ? "text-green-700" : ""
                              }`}
                            >
                              {dayMeal[mealType]?.eaten ? "Completed" : "Mark as eaten"}
                              {updatingMeal === mealType && (
                                <span className="ml-2 text-xs text-muted-foreground">Updating...</span>
                              )}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-lg font-medium">
                  No meals planned for this day
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Select another date within your meal plan period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}