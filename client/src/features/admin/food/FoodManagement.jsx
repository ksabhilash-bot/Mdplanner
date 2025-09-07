import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Filter, Utensils, Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchFoods, deleteFood, updateFood } from "../food/food.api";

const categoryOptions = [
  "main dish",
  "curry",
  "veg side",
  "non-veg side",
  "snack",
  "beverage",
  "accompaniment",
  "all",
];

const mealOptions = ["breakfast", "lunch", "snack", "dinner"];

export default function FoodManagement() {
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
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
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, searchTerm, categoryFilter]);

  const loadFoods = async () => {
    try {
      setLoading(true);
      const foodData = await fetchFoods();
      setFoods(foodData);
    } catch (error) {
      toast.error("Failed to load foods");
      console.error("Error loading foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((food) => food.category === categoryFilter);
    }

    setFilteredFoods(filtered);
  };

  const handleDeleteFood = async () => {
    try {
      await deleteFood(selectedFood._id);
      setFoods(foods.filter((food) => food._id !== selectedFood._id));
      setIsDeleteDialogOpen(false);
      setSelectedFood(null);
      toast.success("Food deleted successfully");
    } catch (error) {
      toast.error("Failed to delete food");
      console.error("Error deleting food:", error);
    }
  };

  const handleUpdateFood = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedFood = await updateFood(selectedFood._id, formData);
      setFoods(
        foods.map((food) =>
          food._id === selectedFood._id ? updatedFood : food
        )
      );
      setIsEditDialogOpen(false);
      setSelectedFood(null);
      toast.success("Food updated successfully");
    } catch (error) {
      toast.error("Failed to update food");
      console.error("Error updating food:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteDialog = (food) => {
    setSelectedFood(food);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (food) => {
    setSelectedFood(food);
    setFormData({
      name: food.name,
      meals: food.meals,
      category: food.category,
      subCategory: food.subCategory || "",
      servings: food.servings,
    });
    setIsEditDialogOpen(true);
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

  const getCategoryBadgeVariant = (category) => {
    return category === "beverage" ? "secondary" : "default";
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-8 w-8" />
            Food Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all foods in the system
          </p>
        </div>
        <Button onClick={() => navigate("/admin/addfood")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Food
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search foods..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Foods Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Meals</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Servings</TableHead>
              <TableHead>Nutrition (per serving)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredFoods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No foods found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFoods.map((food) => (
                <TableRow key={food._id}>
                  <TableCell className="font-medium">{food.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {food.meals.map((meal) => (
                        <Badge key={meal} variant="outline">
                          {meal}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(food.category)}>
                      {food.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{food.servings.length} serving(s)</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {food.servings[0]?.calories} cal,{" "}
                      {food.servings[0]?.protein}g protein
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(food)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(food)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Food Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Food</DialogTitle>
            <DialogDescription>
              Make changes to the food. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFood}>
            <div className="space-y-4">
              {/* Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <Label htmlFor="edit-name" className="md:text-right md:pt-3">
                  Name *
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
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
                          id={`edit-meal-${meal}`}
                          checked={formData.meals.includes(meal)}
                          onCheckedChange={(checked) =>
                            handleMealChange(meal, checked)
                          }
                        />
                        <Label
                          htmlFor={`edit-meal-${meal}`}
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
                <Label
                  htmlFor="edit-category"
                  className="md:text-right md:pt-3"
                >
                  Category *
                </Label>
                <div className="md:col-span-3">
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions
                        .filter((cat) => cat !== "all")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sub Category Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <Label
                  htmlFor="edit-subCategory"
                  className="md:text-right md:pt-3"
                >
                  Sub Category
                </Label>
                <div className="md:col-span-3">
                  <Input
                    id="edit-subCategory"
                    value={formData.subCategory}
                    onChange={(e) =>
                      handleInputChange("subCategory", e.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Servings Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <div className="md:text-right">
                  <Label className="text-sm font-medium">Servings *</Label>
                </div>
                <div className="md:col-span-3 space-y-4">
                  {formData.servings.map((serving, index) => (
                    <div
                      key={index}
                      className="grid gap-4 p-4 border rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-type-${index}`}>Type *</Label>
                          <Input
                            id={`edit-type-${index}`}
                            value={serving.type}
                            onChange={(e) =>
                              handleServingChange(index, "type", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-quantity-${index}`}>
                            Quantity *
                          </Label>
                          <Input
                            id={`edit-quantity-${index}`}
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
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-volume_ml-${index}`}>
                            Volume (ml)
                          </Label>
                          <Input
                            id={`edit-volume_ml-${index}`}
                            type="number"
                            value={serving.volume_ml || ""}
                            onChange={(e) =>
                              handleServingChange(
                                index,
                                "volume_ml",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-weight_grams-${index}`}>
                            Weight (g)
                          </Label>
                          <Input
                            id={`edit-weight_grams-${index}`}
                            type="number"
                            value={serving.weight_grams || ""}
                            onChange={(e) =>
                              handleServingChange(
                                index,
                                "weight_grams",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`edit-calories-${index}`}>
                            Calories *
                          </Label>
                          <Input
                            id={`edit-calories-${index}`}
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
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-protein-${index}`}>
                            Protein (g) *
                          </Label>
                          <Input
                            id={`edit-protein-${index}`}
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
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-fat-${index}`}>Fat (g) *</Label>
                          <Input
                            id={`edit-fat-${index}`}
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
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-carbs-${index}`}>
                            Carbs (g) *
                          </Label>
                          <Input
                            id={`edit-carbs-${index}`}
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
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-fiber-${index}`}>
                            Fiber (g) *
                          </Label>
                          <Input
                            id={`edit-fiber-${index}`}
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
                          Remove Serving
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
                    Add Another Serving
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updating}>
                {updating ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              food item from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFood}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
