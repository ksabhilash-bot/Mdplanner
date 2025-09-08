import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { submitProfile } from "./profile.api";
import { useProfileStore } from "./profile.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { useMealPlanStore } from "../meal/mealPlan.store";

export default function ProfileSetup({ className, ...props }) {
  const navigate = useNavigate();
  const { profileData, setProfileData, getFormDataForSubmission } =
    useProfileStore();
  const { setUser } = useAuthStore();
  const { setMealPlan } = useMealPlanStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setProfileData({ [name]: value });
  };

  const handleMultiSelect = (name, value) => {
    const currentValues = profileData[name];

    if (value === "None") {
      setProfileData({ [name]: ["None"] });
      return;
    }

    if (currentValues.includes("None")) {
      setProfileData({
        [name]: currentValues.filter((item) => item !== "None").concat(value),
      });
      return;
    }

    setProfileData({
      [name]: currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    });
  };

  const { mutate, isPending, isSuccess, isError, error, data } = useMutation({
    mutationFn: submitProfile,
  });

  // Handle success using useEffect
  useEffect(() => {
    if (isSuccess && data) {
      console.log("✅ Backend response:", data);

      if (data.data?.user) {
        setUser(data.data.user);
      } else {
        // Manually update the user's profile completion status if backend doesn't return updated user
        setUser({
          ...useAuthStore.getState().user,
          isProfileComplete: true,
        });
      }

      if (data.data?.mealPlan) {
        setMealPlan(data.data.mealPlan);
      }

      navigate("/user/userdashboard");
    }
  }, [isSuccess, data, setUser, setMealPlan, navigate]);

  // Handle error using useEffect
  useEffect(() => {
    if (isError) {
      console.error("❌ Profile setup failed:", error);
      // You can add toast notifications or other error handling here
    }
  }, [isError, error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanFormData = getFormDataForSubmission();

    const requiredFields = [
      "age",
      "height",
      "weight",
      "gender",
      "activityLevel",
      "fitnessGoal",
    ];
    const missingFields = requiredFields.filter(
      (field) => !cleanFormData[field]
    );

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(", ")}`);
      return;
    }

    mutate(cleanFormData);
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-2 px-1 sm:py-8 sm:px-4 overflow-x-hidden">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-3 w-full max-w-3xl bg-background p-3 sm:p-6 rounded-lg border border-border shadow-sm mx-2",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-lg sm:text-2xl font-bold">
            Personalize Your Diet
          </h1>
        </div>

        <div className="grid gap-3">
          {/* Section 1: Basic Information */}
          <div className="space-y-3 p-3 sm:p-5 bg-muted/50 rounded-lg">
            <h2 className="text-base sm:text-xl font-semibold">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm sm:text-base">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="25"
                  required
                  value={profileData.age}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm sm:text-base">
                  Height (cm) *
                </Label>
                <Input
                  id="height"
                  type="number"
                  name="height"
                  placeholder="170"
                  required
                  value={profileData.height}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm sm:text-base">
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  name="weight"
                  placeholder="70"
                  required
                  value={profileData.weight}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Gender *</Label>
              <Select
                value={profileData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male" className="text-sm sm:text-base">
                    Male
                  </SelectItem>
                  <SelectItem value="female" className="text-sm sm:text-base">
                    Female
                  </SelectItem>
                  <SelectItem value="other" className="text-sm sm:text-base">
                    Other
                  </SelectItem>
                  <SelectItem
                    value="prefer-not-to-say"
                    className="text-sm sm:text-base"
                  >
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Activity & Goals */}
          <div className="space-y-3 p-3 sm:p-5 bg-muted/50 rounded-lg">
            <h2 className="text-base sm:text-xl font-semibold">
              Activity & Goals
            </h2>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Activity Level *</Label>
              <Select
                value={profileData.activityLevel}
                onValueChange={(value) =>
                  handleSelectChange("activityLevel", value)
                }
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem
                    value="sedentary"
                    className="text-sm sm:text-base"
                  >
                    Sedentary (little or no exercise)
                  </SelectItem>
                  <SelectItem value="light" className="text-sm sm:text-base">
                    Lightly active (light exercise 1-3 days/week)
                  </SelectItem>
                  <SelectItem value="moderate" className="text-sm sm:text-base">
                    Moderately active (moderate exercise 3-5 days/week)
                  </SelectItem>
                  <SelectItem value="active" className="text-sm sm:text-base">
                    Very active (hard exercise 6-7 days/week)
                  </SelectItem>
                  <SelectItem value="extreme" className="text-sm sm:text-base">
                    Extremely active (very hard exercise & physical job)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fitness Goal */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Fitness Goal *</Label>
              <Select
                value={profileData.fitnessGoal}
                onValueChange={(value) =>
                  handleSelectChange("fitnessGoal", value)
                }
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select your fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="weight-loss"
                    className="text-sm sm:text-base"
                  >
                    Weight Loss
                  </SelectItem>
                  <SelectItem
                    value="weight-gain"
                    className="text-sm sm:text-base"
                  >
                    Weight Gain
                  </SelectItem>
                  <SelectItem
                    value="weight-maintain"
                    className="text-sm sm:text-base"
                  >
                    Maintain Weight
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Weight (conditionally shown if goal is weight loss or gain) */}
            {(profileData.fitnessGoal === "weight-loss" ||
              profileData.fitnessGoal === "weight-gain") && (
              <div className="space-y-2">
                <Label htmlFor="targetWeight" className="text-sm sm:text-base">
                  {profileData.fitnessGoal === "weight-loss"
                    ? "Target Weight Loss (kg)"
                    : "Target Weight Gain (kg)"}
                </Label>
                <Input
                  id="targetWeight"
                  type="number"
                  name="targetWeight"
                  placeholder={
                    profileData.fitnessGoal === "weight-loss" ? "5" : "5"
                  }
                  value={profileData.targetWeight}
                  onChange={handleChange}
                  className="w-full text-sm sm:text-base"
                />
              </div>
            )}
          </div>

          {/* Section 3: Dietary Preferences */}
          <div className="space-y-3 p-3 sm:p-5 bg-muted/50 rounded-lg">
            <h2 className="text-base sm:text-xl font-semibold">
              Dietary Preferences
            </h2>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">
                  Diet Preference (Select One)
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {["Vegetarian", "Non-Vegetarian"].map((diet) => (
                    <Button
                      key={diet}
                      type="button"
                      variant={
                        profileData.dietPreference === diet
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSelectChange("dietPreference", diet)}
                      className="h-8 px-2 text-xs flex-1 sm:flex-none"
                    >
                      {diet}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Meal Plan Preferences */}
          <div className="space-y-3 p-3 sm:p-5 bg-muted/50 rounded-lg">
            <h2 className="text-base sm:text-xl font-semibold">
              Meal Plan Preferences
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">
                  Preferred Meal Frequency
                </Label>
                <Select
                  value={profileData.mealFrequency}
                  onValueChange={(value) =>
                    handleSelectChange("mealFrequency", value)
                  }
                >
                  <SelectTrigger className="w-full text-sm sm:text-base">
                    <SelectValue placeholder="How many meals per day?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3" className="text-sm sm:text-base">
                      3 meals
                    </SelectItem>
                    <SelectItem value="4" className="text-sm sm:text-base">
                      4 meals
                    </SelectItem>
                    <SelectItem value="5" className="text-sm sm:text-base">
                      5 meals
                    </SelectItem>
                    <SelectItem value="6" className="text-sm sm:text-base">
                      6 small meals
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Plan Duration</Label>
                <Select
                  value={profileData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger className="w-full text-sm sm:text-base">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-day" className="text-sm sm:text-base">
                      1 Day Trial
                    </SelectItem>
                    <SelectItem value="3-day" className="text-sm sm:text-base">
                      3 Day
                    </SelectItem>
                    <SelectItem value="1-week" className="text-sm sm:text-base">
                      1 Week
                    </SelectItem>
                    <SelectItem
                      value="2-weeks"
                      className="text-sm sm:text-base"
                    >
                      2 Weeks
                    </SelectItem>
                    <SelectItem
                      value="1-month"
                      className="text-sm sm:text-base"
                    >
                      1 Month
                    </SelectItem>
                    <SelectItem
                      value="3-months"
                      className="text-sm sm:text-base"
                    >
                      3 Months
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 text-sm sm:text-base"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create my profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
