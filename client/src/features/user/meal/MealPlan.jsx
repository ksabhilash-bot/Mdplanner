import { useMealPlanStore } from "../meal/mealPlan.store";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { trackMeal, getFoodsByMeal, getAllFoods } from "./meal.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FullPageSpinner } from "@/components/others/full-page-spinner";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function MealTracking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trackingData, setTrackingData] = useState({
    breakfast: {
      category: "",
      subcategory: "",
      foodId: "",
      quantity: 1,
      servingType: "",
      isTracked: false,
    },
    lunch: {
      category: "",
      subcategory: "",
      foodId: "",
      quantity: 1,
      servingType: "",
      isTracked: false,
    },
    snack: {
      category: "",
      subcategory: "",
      foodId: "",
      quantity: 1,
      servingType: "",
      isTracked: false,
    },
    dinner: {
      category: "",
      subcategory: "",
      foodId: "",
      quantity: 1,
      servingType: "",
      isTracked: false,
    },
  });

  // Track meal mutation
  const trackMealMutation = useMutation({
    mutationFn: trackMeal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mealHistory"] });

      // Update the tracked status for the specific meal
      if (variables.mealType) {
        setTrackingData((prev) => ({
          ...prev,
          [variables.mealType]: {
            ...prev[variables.mealType],
            isTracked: true,
          },
        }));
      }

      toast.success("Meal tracked successfully");
    },
    onError: (error, variables) => {
      // Reset tracked status on error
      if (variables.mealType) {
        setTrackingData((prev) => ({
          ...prev,
          [variables.mealType]: {
            ...prev[variables.mealType],
            isTracked: false,
          },
        }));
      }

      toast.error("Failed to track meal", {
        description: error.message || "Please try again",
      });
    },
  });

  // Fetch all foods
  const {
    data: allFoods,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allFoods"],
    queryFn: getAllFoods,
  });

  // Organize foods by category and subcategory based on your actual data structure
  const organizeFoods = (foods) => {
    if (!foods) return {};

    const organized = {};
    foods.forEach((food) => {
      // Use category from your data, handle undefined values
      const category = food.category || "uncategorized";
      // Use subCategory (with capital C) from your data
      const subcategory = food.subCategory || "other";

      if (!organized[category]) {
        organized[category] = {};
      }
      if (!organized[category][subcategory]) {
        organized[category][subcategory] = [];
      }
      organized[category][subcategory].push(food);
    });
    return organized;
  };

  const organizedFoods = organizeFoods(allFoods);

  // Extract actual categories and subcategories from your data
  const extractCategoriesFromData = () => {
    if (!allFoods) return { categories: {}, subcategories: {} };

    const categoriesByMeal = {
      breakfast: new Set(),
      lunch: new Set(),
      snack: new Set(),
      dinner: new Set(),
    };

    const subcategoriesByCategory = {};

    allFoods.forEach((food) => {
      const mealTypes = Array.isArray(food.meals) ? food.meals : [food.meals];
      const category = food.category || "uncategorized";
      const subcategory = food.subCategory || "other";

      // Add category to meal types
      mealTypes.forEach((mealType) => {
        if (categoriesByMeal[mealType]) {
          categoriesByMeal[mealType].add(category);
        }
      });

      // Build subcategories structure
      if (!subcategoriesByCategory[category]) {
        subcategoriesByCategory[category] = new Set();
      }
      subcategoriesByCategory[category].add(subcategory);
    });

    // Convert Sets to Arrays
    return {
      categories: {
        breakfast: Array.from(categoriesByMeal.breakfast),
        lunch: Array.from(categoriesByMeal.lunch),
        snack: Array.from(categoriesByMeal.snack),
        dinner: Array.from(categoriesByMeal.dinner),
      },
      subcategories: Object.fromEntries(
        Object.entries(subcategoriesByCategory).map(([category, subcats]) => [
          category,
          Array.from(subcats),
        ])
      ),
    };
  };

  const { categories: actualCategories, subcategories: actualSubcategories } =
    extractCategoriesFromData();

  const handleCategoryChange = (mealType, category) => {
    setTrackingData((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        category,
        subcategory: "", // Reset subcategory when category changes
        foodId: "", // Reset food when category changes
        servingType: "", // Reset serving type when category changes
        isTracked: false, // Reset tracked status when changing selection
      },
    }));
  };

  const handleSubcategoryChange = (mealType, subcategory) => {
    setTrackingData((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        subcategory,
        foodId: "", // Reset food when subcategory changes
        servingType: "", // Reset serving type when subcategory changes
        isTracked: false, // Reset tracked status when changing selection
      },
    }));
  };

  const handleFoodChange = (mealType, foodId) => {
    setTrackingData((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        foodId,
        servingType: "", // Reset serving type when food changes
        isTracked: false, // Reset tracked status when changing selection
      },
    }));
  };

  const handleServingTypeChange = (mealType, servingType) => {
    setTrackingData((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        servingType,
        isTracked: false, // Reset tracked status when changing serving type
      },
    }));
  };

  const handleQuantityChange = (mealType, quantity) => {
    setTrackingData((prev) => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        quantity: parseInt(quantity) || 1,
        isTracked: false, // Reset tracked status when changing quantity
      },
    }));
  };

  const handleTrackSingleMeal = (mealType) => {
    const mealData = trackingData[mealType];
    const selectedFood = getSelectedFood(mealType);
    const selectedServing = getSelectedServing(mealType);
    const nutritionInfo = calculateNutrition(
      selectedServing,
      mealData.quantity
    );

    if (!mealData.foodId) {
      toast.error(`Please select a food for ${mealType}`);
      return;
    }

    if (!mealData.servingType) {
      toast.error(`Please select a serving type for ${mealType}`);
      return;
    }

    if (!nutritionInfo) {
      toast.error(`Nutrition information not available for ${mealType}`);
      return;
    }

    trackMealMutation.mutate({
      mealType,
      foodId: mealData.foodId,
      foodName: selectedFood.name, // Add food name
      quantity: mealData.quantity,
      servingType: mealData.servingType,
      date: selectedDate,
      // Nutrition data
      calories: nutritionInfo.calories,
      protein: nutritionInfo.protein,
      carbs: nutritionInfo.carbs,
      fat: nutritionInfo.fat,
      fiber: nutritionInfo.fiber,
      weight_grams: nutritionInfo.weight,
    });
  };
  // Get available foods for a specific meal, category and subcategory
  const getAvailableFoods = (mealType, category, subcategory) => {
    if (!organizedFoods[category]) return [];

    // If subcategory is specified, use it, otherwise get all foods from the category
    if (
      subcategory &&
      subcategory !== "all" &&
      organizedFoods[category][subcategory]
    ) {
      return organizedFoods[category][subcategory].filter((food) => {
        const mealTypes = Array.isArray(food.meal) ? food.meal : [food.meal];
        return mealTypes.includes(mealType);
      });
    } else {
      // Get all foods from all subcategories in this category
      let allFoodsInCategory = [];
      Object.values(organizedFoods[category]).forEach((subcategoryFoods) => {
        const filtered = subcategoryFoods.filter((food) => {
          const mealTypes = Array.isArray(food.meals)
            ? food.meals
            : [food.meals];
          return mealTypes.includes(mealType);
        });
        allFoodsInCategory = [...allFoodsInCategory, ...filtered];
      });
      return allFoodsInCategory;
    }
  };

  // Get selected food data
  const getSelectedFood = (mealType) => {
    if (!trackingData[mealType].foodId || !allFoods) return null;
    return allFoods.find((food) => food._id === trackingData[mealType].foodId);
  };

  // Get selected serving data
  const getSelectedServing = (mealType) => {
    const food = getSelectedFood(mealType);
    if (!food || !food.servings || !trackingData[mealType].servingType)
      return null;
    return food.servings.find(
      (serving) => serving.type === trackingData[mealType].servingType
    );
  };

  // Calculate nutrition based on quantity
  const calculateNutrition = (serving, quantity) => {
    if (!serving) return null;
    return {
      calories: Math.round(serving.calories * quantity),
      protein: Math.round(serving.protein * quantity * 10) / 10,
      carbs: Math.round(serving.carbs * quantity * 10) / 10,
      fat: Math.round(serving.fat * quantity * 10) / 10,
      fiber: Math.round(serving.fiber * quantity * 10) / 10,
      weight: Math.round(serving.weight_grams * quantity),
    };
  };

  // Format category name for display
  const formatCategoryName = (category) => {
    if (!category) return "Uncategorized";
    return category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) return <FullPageSpinner />;

  if (isError) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <p>{error?.message || "Error loading food options"}</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-2 ">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Track Your Meals</h1>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="space-y-6">
            {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
              const selectedFood = getSelectedFood(mealType);
              const selectedServing = getSelectedServing(mealType);
              const nutritionInfo = calculateNutrition(
                selectedServing,
                trackingData[mealType].quantity
              );

              return (
                <Card key={mealType} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="capitalize">{mealType}</CardTitle>
                      {trackingData[mealType].isTracked && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          <Check className="w-3 h-3 mr-1" /> Tracked
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    {/* Display all categories for this meal type */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {actualCategories[mealType]?.map((category) => (
                          <Badge
                            key={category}
                            variant={
                              trackingData[mealType].category === category
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer px-3 py-1"
                            onClick={() =>
                              handleCategoryChange(mealType, category)
                            }
                          >
                            {formatCategoryName(category)}
                          </Badge>
                        ))}
                      </div>

                      {/* Show subcategories if a category is selected and has subcategories */}
                      {trackingData[mealType].category &&
                        actualSubcategories[trackingData[mealType].category] &&
                        actualSubcategories[trackingData[mealType].category]
                          .length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Subcategories</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                key="all"
                                variant={
                                  trackingData[mealType].subcategory ===
                                    "all" || !trackingData[mealType].subcategory
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer px-3 py-1"
                                onClick={() =>
                                  handleSubcategoryChange(mealType, "all")
                                }
                              >
                                All
                              </Badge>
                              {actualSubcategories[
                                trackingData[mealType].category
                              ]
                                .filter(
                                  (subcat) =>
                                    subcat !== "other" && subcat !== "undefined"
                                )
                                .map((subcategory) => (
                                  <Badge
                                    key={subcategory}
                                    variant={
                                      trackingData[mealType].subcategory ===
                                      subcategory
                                        ? "default"
                                        : "outline"
                                    }
                                    className="cursor-pointer px-3 py-1"
                                    onClick={() =>
                                      handleSubcategoryChange(
                                        mealType,
                                        subcategory
                                      )
                                    }
                                  >
                                    {formatCategoryName(subcategory)}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Show food selection if a category is selected */}
                      {trackingData[mealType].category && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Food Items</h4>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`${mealType}-food`}>
                                Select Food
                              </Label>
                              <Select
                                value={trackingData[mealType].foodId}
                                onValueChange={(value) =>
                                  handleFoodChange(mealType, value)
                                }
                              >
                                <SelectTrigger id={`${mealType}-food`}>
                                  <SelectValue placeholder="Select food" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableFoods(
                                    mealType,
                                    trackingData[mealType].category,
                                    trackingData[mealType].subcategory || "all"
                                  ).map((food) => (
                                    <SelectItem key={food._id} value={food._id}>
                                      {food.name} (
                                      {food.servings && food.servings[0]
                                        ? food.servings[0].calories
                                        : "N/A"}{" "}
                                      cal)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Serving Type Selection */}
                            {selectedFood &&
                              selectedFood.servings &&
                              selectedFood.servings.length > 0 && (
                                <div>
                                  <Label htmlFor={`${mealType}-serving-type`}>
                                    Serving Type
                                  </Label>
                                  <Select
                                    value={trackingData[mealType].servingType}
                                    onValueChange={(value) =>
                                      handleServingTypeChange(mealType, value)
                                    }
                                  >
                                    <SelectTrigger
                                      id={`${mealType}-serving-type`}
                                    >
                                      <SelectValue placeholder="Select serving type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedFood.servings.map(
                                        (serving, index) => (
                                          <SelectItem
                                            key={index}
                                            value={serving.type}
                                          >
                                            {serving.type} (
                                            {serving.weight_grams}g,{" "}
                                            {serving.calories} cal)
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                            {/* Quantity Input */}
                            {trackingData[mealType].servingType && (
                              <div>
                                <Label htmlFor={`${mealType}-quantity`}>
                                  Quantity
                                </Label>
                                <Input
                                  id={`${mealType}-quantity`}
                                  type="number"
                                  min="1"
                                  value={trackingData[mealType].quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      mealType,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            )}

                            {/* Nutrition Information */}
                            {nutritionInfo && (
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium mb-2">
                                  Nutrition Information
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                  <div>
                                    <span className="font-medium">
                                      Calories:
                                    </span>
                                    <br />
                                    {nutritionInfo.calories} cal
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Protein:
                                    </span>
                                    <br />
                                    {nutritionInfo.protein}g
                                  </div>
                                  <div>
                                    <span className="font-medium">Carbs:</span>
                                    <br />
                                    {nutritionInfo.carbs}g
                                  </div>
                                  <div>
                                    <span className="font-medium">Fat:</span>
                                    <br />
                                    {nutritionInfo.fat}g
                                  </div>
                                  <div>
                                    <span className="font-medium">Fiber:</span>
                                    <br />
                                    {nutritionInfo.fiber}g
                                  </div>
                                </div>
                                <div className="mt-2 text-sm">
                                  <span className="font-medium">
                                    Total Weight:
                                  </span>{" "}
                                  {nutritionInfo.weight}g
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Individual track button for this meal */}
                          {trackingData[mealType].foodId &&
                            trackingData[mealType].servingType && (
                              <div className="pt-2">
                                <Button
                                  onClick={() =>
                                    handleTrackSingleMeal(mealType)
                                  }
                                  disabled={
                                    trackingData[mealType].isTracked ||
                                    trackMealMutation.isPending
                                  }
                                  className="w-full"
                                >
                                  {trackingData[mealType].isTracked ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Tracked
                                    </>
                                  ) : trackMealMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Tracking...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Track {mealType}
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
