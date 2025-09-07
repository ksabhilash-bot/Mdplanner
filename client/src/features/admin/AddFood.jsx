import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFood } from "./food.api.js";

const mealOptions = ["breakfast", "lunch", "snack", "dinner"];
const categoryOptions = [
  "main dish",
  "curry",
  "veg side",
  "non-veg side",
  "snack",
  "beverage",
  "accompaniment",
];

export default function AddFood() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    meals: [],
    category: "",
    subCategory: "",
    servings: [
      {
        type: "",
        quantity: 1,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
      },
    ],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createFood(formData);
      toast.success("Food created successfully");
      navigate("/admin/managefoods");
    } catch (error) {
      toast.error("Failed to create food");
      console.error("Error creating food:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMealChange = (meal, checked) => {
    setFormData((prev) => ({
      ...prev,
      meals: checked
        ? [...prev.meals, meal]
        : prev.meals.filter((m) => m !== meal),
    }));
  };

  const handleServingChange = (index, field, value) => {
    const updatedServings = [...formData.servings];
    updatedServings[index] = { ...updatedServings[index], [field]: value };
    setFormData((prev) => ({ ...prev, servings: updatedServings }));
  };

  const addServing = () => {
    setFormData((prev) => ({
      ...prev,
      servings: [
        ...prev.servings,
        {
          type: "",
          quantity: 1,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
        },
      ],
    }));
  };

  const removeServing = (index) => {
    if (formData.servings.length > 1) {
      setFormData((prev) => ({
        ...prev,
        servings: prev.servings.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Food</h1>
        <p className="text-muted-foreground mt-1">
          Add a new food to the system with detailed nutritional information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <Label htmlFor="name" className="md:text-right md:pt-3">
            Name *
          </Label>
          <div className="md:col-span-3">
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              placeholder="e.g., Tea, Rice, Chicken Curry"
            />
          </div>
        </div>

        {/* Meals Field */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <Label className="md:text-right md:pt-2">Meals *</Label>
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mealOptions.map((meal) => (
                <div key={meal} className="flex items-center space-x-2">
                  <Checkbox
                    id={`meal-${meal}`}
                    checked={formData.meals.includes(meal)}
                    onCheckedChange={(checked) =>
                      handleMealChange(meal, checked)
                    }
                  />
                  <Label
                    htmlFor={`meal-${meal}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Field */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <Label htmlFor="category" className="md:text-right md:pt-3">
            Category *
          </Label>
          <div className="md:col-span-3">
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sub Category Field */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <Label htmlFor="subCategory" className="md:text-right md:pt-3">
            Sub Category
          </Label>
          <div className="md:col-span-3">
            <Input
              id="subCategory"
              value={formData.subCategory}
              onChange={(e) => handleInputChange("subCategory", e.target.value)}
              placeholder="Optional (e.g., thoran, mezhukkuperatti)"
            />
          </div>
        </div>

        {/* Servings Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="md:text-right">
              <Label className="text-sm font-medium">Servings *</Label>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-muted-foreground mb-4">
                Add different serving sizes with their nutritional information
              </p>

              {formData.servings.map((serving, index) => (
                <div
                  key={index}
                  className="grid gap-4 p-4 border rounded-lg mb-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`type-${index}`}>Serving Type *</Label>
                      <Input
                        className="mt-2"
                        id={`type-${index}`}
                        value={serving.type}
                        onChange={(e) =>
                          handleServingChange(index, "type", e.target.value)
                        }
                        placeholder="e.g., cup, bowl, piece, glass"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                      <Input
                        className="mt-2"
                        id={`quantity-${index}`}
                        type="number"
                        value={serving.quantity}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="1"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`volume_ml-${index}`}>Volume (ml)</Label>
                      <Input
                        className="mt-2"
                        id={`volume_ml-${index}`}
                        type="number"
                        value={serving.volume_ml || ""}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "volume_ml",
                            Number(e.target.value)
                          )
                        }
                        placeholder="For liquids (e.g., 180ml for tea)"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight_grams-${index}`}>
                        Weight (g)
                      </Label>
                      <Input
                        className="mt-2"
                        id={`weight_grams-${index}`}
                        type="number"
                        value={serving.weight_grams || ""}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "weight_grams",
                            Number(e.target.value)
                          )
                        }
                        placeholder="For solids (e.g., 150g for rice)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`calories-${index}`}>Calories *</Label>
                      <Input
                        className="mt-2"
                        id={`calories-${index}`}
                        type="number"
                        value={serving.calories}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "calories",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`protein-${index}`}>Protein (g) *</Label>
                      <Input
                       className="mt-2"
                        id={`protein-${index}`}
                        type="number"
                        value={serving.protein}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "protein",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fat-${index}`}>Fat (g) *</Label>
                      <Input
                       className="mt-2"
                        id={`fat-${index}`}
                        type="number"
                        value={serving.fat}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "fat",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`carbs-${index}`}>Carbs (g) *</Label>
                      <Input
                       className="mt-2"
                        id={`carbs-${index}`}
                        type="number"
                        value={serving.carbs}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "carbs",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fiber-${index}`}>Fiber (g) *</Label>
                      <Input
                       className="mt-2"
                        id={`fiber-${index}`}
                        type="number"
                        value={serving.fiber}
                        onChange={(e) =>
                          handleServingChange(
                            index,
                            "fiber",
                            Number(e.target.value)
                          )
                        }
                        required
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {formData.servings.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeServing(index)}
                      className="mt-2 w-full md:w-auto"
                    >
                      Remove This Serving
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addServing}
                className="w-full md:w-auto"
              >
                Add Another Serving Size
              </Button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/foods")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creating Food..." : "Create Food"}
          </Button>
        </div>
      </form>
    </div>
  );
}
