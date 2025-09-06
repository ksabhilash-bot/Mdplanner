import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useProfileStore } from "../profile/profile.store";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../profile/profile.api";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserProfile } from "../profile/profile.api";
import {
  getDailyNutrition,
  getNutritionHistory,
  getUserNutritionGoals,
} from "../nutrition.api";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { profileData, setProfileData } = useProfileStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    weight: "",
    height: "",
    activityLevel: "",
    targetWeight: "",
  });
  const [weightInput, setWeightInput] = useState("");

  // First, fetch user nutrition goals
  const {
    data: nutritionGoalsData,
    isLoading: goalsLoading,
    refetch: refetchGoals,
  } = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getUserNutritionGoals,
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

      // Initialize edit form with current data
      setEditFormData({
        weight: data.profile?.weight || "",
        height: data.profile?.height || "",
        activityLevel: data.profile?.activityLevel || "",
        targetWeight: data.profile?.targetWeight || "",
      });

      // Initialize weight input with current weight
      setWeightInput(data.profile?.weight || "");
    }
  }, [data, setUser, setProfileData]);

  // Handle error case
  useEffect(() => {
    if (isError) {
      console.error("fetchUserProfile error:", error);
    }
  }, [isError, error]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Prepare the data to update
      const updateData = {};

      if (editFormData.weight !== profileData?.weight) {
        updateData.weight = parseFloat(editFormData.weight);
      }

      if (editFormData.height !== profileData?.height) {
        updateData.height = parseFloat(editFormData.height);
      }

      if (editFormData.activityLevel !== profileData?.activityLevel) {
        updateData.activityLevel = editFormData.activityLevel;
      }

      if (editFormData.targetWeight !== profileData?.targetWeight) {
        updateData.targetWeight = parseFloat(editFormData.targetWeight);
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateUserProfile(updateData);

        // Refetch the profile to get updated data with recalculated calories/nutrients
        await refetch();
        await refetchGoals();

        // Show success message or handle as needed
        console.log("Profile updated successfully");
      }

      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      // Handle error (show toast, etc.)
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWeightUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (weightInput && weightInput !== profileData?.weight) {
        await updateUserProfile({
          weight: parseFloat(weightInput),
        });

        // Refetch the profile and nutrition goals to get updated data
        await refetch();
        await refetchGoals();

        console.log("Weight updated successfully");
      }

      setIsWeightDialogOpen(false);
    } catch (err) {
      console.error("Error updating weight:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) return <FullPageSpinner />;

  if (isError) {
    return (
      <div className="container mx-auto px-2 xl:px-8 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border rounded-lg p-6 shadow-sm bg-red-50 border-red-200">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-red-600 mb-4">
              {error?.message || "Failed to load profile data"}
            </p>
            <div className="space-x-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border rounded-lg p-6 shadow-sm bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              No Profile Data
            </h2>
            <p className="text-yellow-600 mb-4">
              Profile information is not available
            </p>
            <Button onClick={() => navigate("/profile/setup")}>
              Complete Profile Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Compact profile sections
  const profileSections = [
    {
      title: "Personal Details",
      items: [
        { label: "Name", value: user?.name },
        { label: "Email", value: user?.email },
        { label: "Age", value: profileData?.age },
        { label: "Gender", value: profileData?.gender },
        {
          label: "Height/Weight",
          value: `${profileData?.height || "--"} cm / ${
            profileData?.weight || "--"
          } kg`,
        },
      ],
    },
    {
      title: "Health & Goals",
      items: [
        { label: "Activity Level", value: profileData?.activityLevel },
        { label: "Fitness Goal", value: profileData?.fitnessGoal },
        {
          label: "Target Weight",
          value: profileData?.targetWeight
            ? `${profileData.targetWeight} kg`
            : "--",
        },
        {
          label: "Allergies",
          value: profileData?.foodAllergies?.includes("None")
            ? "None"
            : profileData?.foodAllergies?.join(", ") || "--",
        },
        {
          label: "Conditions",
          value: profileData?.medicalConditions?.includes("None")
            ? "None"
            : profileData?.medicalConditions?.join(", ") || "--",
        },
      ],
    },
    {
      title: "Diet Preferences",
      items: [
        { label: "Diet Type", value: profileData?.dietPreference },
        { label: "Cuisine", value: profileData?.cuisineRegion },
        { label: "Meals/Day", value: profileData?.mealFrequency },
        { label: "Plan Type", value: profileData?.planType },
        { label: "Duration", value: profileData?.duration },
      ],
    },
  ];

  return (
    <div className="container mx-auto py-8 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Header with status and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              My Profile
              <Badge
                variant={user?.isProfileComplete ? "default" : "secondary"}
              >
                {user?.isProfileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Temporarily comment out the full edit profile dialog
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your information to recalculate your calorie and
                    nutrient needs.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={editFormData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="Enter weight"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={editFormData.height}
                        onChange={(e) =>
                          handleInputChange("height", e.target.value)
                        }
                        placeholder="Enter height"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={editFormData.activityLevel}
                      onValueChange={(value) =>
                        handleInputChange("activityLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="lightly_active">
                          Lightly Active
                        </SelectItem>
                        <SelectItem value="moderately_active">
                          Moderately Active
                        </SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                        <SelectItem value="extremely_active">
                          Extremely Active
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      value={editFormData.targetWeight}
                      onChange={(e) =>
                        handleInputChange("targetWeight", e.target.value)
                      }
                      placeholder="Enter target weight"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update & Recalculate"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            */}

            {/* Add Update Weight button instead */}
            <Dialog
              open={isWeightDialogOpen}
              onOpenChange={setIsWeightDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Update Weight
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Weight</DialogTitle>
                  <DialogDescription>
                    Update your current weight to recalculate your nutrition
                    goals.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWeightUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder="Enter your current weight"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsWeightDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update & Recalculate"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Profile incomplete warning */}
        {!user?.isProfileComplete && (
          <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-medium text-orange-800">
                Complete Your Profile
              </h3>
              <p className="text-sm text-orange-600">
                Get personalized recommendations by completing your profile
              </p>
            </div>
            <Button
              onClick={() => navigate("/profile/setup")}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
            >
              Complete Setup
            </Button>
          </div>
        )}

        {/* Main profile content in compact grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {profileSections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nutrition Information Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nutrition Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {nutritionGoalsData?.calories || "--"}
                </div>
                <div className="text-sm text-blue-600">Calories</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {nutritionGoalsData?.protein || "--"}g
                </div>
                <div className="text-sm text-green-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {nutritionGoalsData?.carbs || "--"}g
                </div>
                <div className="text-sm text-yellow-600">Carbs</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  {nutritionGoalsData?.fat || "--"}g
                </div>
                <div className="text-sm text-red-600">Fat</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {nutritionGoalsData?.fiber || "--"}g
                </div>
                <div className="text-sm text-purple-600">Fiber</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              These values are calculated based on your profile information
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
