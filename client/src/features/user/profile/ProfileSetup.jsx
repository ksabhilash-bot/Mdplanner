import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

import { submitProfile } from "./profile.api";
import { useProfileStore } from "./profile.store";

export default function ProfileSetup({ className, ...props }) {
  const navigate = useNavigate();
  // Calling zustand store for getting state and state update function
  const { profileData, setProfileData } = useProfileStore();

  // 1. Change handler for setting new state when values changes in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ [name]: value });
  };

  // 2. Handler for updating state for the select components
  const handleSelectChange = (name, value) => {
    setProfileData({ [name]: value });
  };

  // 3. For multiple selects
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

  // 4. Mutation hook for submitting form
  const { mutate, isPending, error } = useMutation({
    mutationFn: submitProfile,
    onSuccess: (data) => {
      console.log(data.message);
      navigate("/user/userdashboard"); // redirect after success
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(profileData); // send data via React Query
  };

  return (
    <div className="flex justify-center items-start min-h-screen py-8 px-4">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-6 w-full max-w-3xl bg-background p-6 rounded-lg border border-border shadow-sm",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Personalize Your Meal Plan</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Help us create the perfect meal plan tailored just for you
          </p>
        </div>

        <div className="grid gap-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4 p-5 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="25"
                  required
                  value={profileData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  name="height"
                  placeholder="170"
                  required
                  value={profileData.height}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  name="weight"
                  placeholder="70"
                  required
                  value={profileData.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Activity & Goals */}
          <div className="space-y-4 p-5 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold">Activity & Goals</h2>

            {/* Activity Level */}
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={profileData.activityLevel}
                onValueChange={(value) =>
                  handleSelectChange("activityLevel", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">
                    Sedentary (little or no exercise)
                  </SelectItem>
                  <SelectItem value="light">
                    Lightly active (light exercise 1-3 days/week)
                  </SelectItem>
                  <SelectItem value="moderate">
                    Moderately active (moderate exercise 3-5 days/week)
                  </SelectItem>
                  <SelectItem value="active">
                    Very active (hard exercise 6-7 days/week)
                  </SelectItem>
                  <SelectItem value="extreme">
                    Extremely active (very hard exercise & physical job)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fitness Goal */}
            <div className="space-y-2">
              <Label>Fitness Goal</Label>
              <Select
                value={profileData.fitnessGoal}
                onValueChange={(value) =>
                  handleSelectChange("fitnessGoal", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="weight-gain">Weight Gain</SelectItem>
                  <SelectItem value="weight-maintain">
                    Maintain Weight
                  </SelectItem>
                  {/* <SelectItem value="build-muscle">Build Muscle</SelectItem> */}
                  {/* <SelectItem value="improve-endurance">
                    Improve Endurance
                  </SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Target Weight (conditionally shown if goal is weight loss or gain) */}
            {(profileData.fitnessGoal === "weight-loss" ||
              profileData.fitnessGoal === "weight-gain") && (
              <div className="space-y-2">
                <Label htmlFor="targetWeight">
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
                />
              </div>
            )}
          </div>

          {/* Section 3: Dietary Preferences */}
          <div className="space-y-4 p-5 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold">Dietary Preferences</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Diet Preference (Select One)</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Vegetarian",
                    "Vegan",
                    "Non-Vegetarian",
                    "Eggetarian",
                    "Keto",
                    "Paleo",
                    "Mediterranean",
                    "Low-Carb",
                    "Gluten-Free",
                    "Dairy-Free",
                    "Pescatarian",
                    "Flexitarian",
                  ].map((diet) => (
                    <Button
                      key={diet}
                      type="button"
                      variant={
                        profileData.dietPreference === diet
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSelectChange("dietPreference", diet)}
                      className="h-8 px-3 text-xs"
                    >
                      {diet}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Food Allergies/Intolerances</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Nuts",
                    "Dairy",
                    "Eggs",
                    "Gluten",
                    "Shellfish",
                    "Soy",
                    "Fish",
                    "Wheat",
                    "Sesame",
                    "None",
                  ].map((allergy) => (
                    <Button
                      key={allergy}
                      type="button"
                      variant={
                        profileData.foodAllergies.includes(allergy)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleMultiSelect("foodAllergies", allergy)
                      }
                      className="h-8 px-3 text-xs"
                    >
                      {allergy}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherAllergies">Other Allergies</Label>
                <Textarea
                  id="otherAllergies"
                  name="otherAllergies"
                  placeholder="List any other allergies not mentioned above"
                  value={profileData.otherAllergies}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Health Information */}
          <div className="space-y-4 p-5 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold">Health Information</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Diabetes",
                    "Hypertension",
                    "PCOS",
                    "Thyroid Disorder",
                    "Heart Disease",
                    "Kidney Disease",
                    "Autoimmune Disorder",
                    "None",
                  ].map((condition) => (
                    <Button
                      key={condition}
                      type="button"
                      variant={
                        profileData.medicalConditions.includes(condition)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleMultiSelect("medicalConditions", condition)
                      }
                      className="h-8 px-3 text-xs"
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherMedicalConditions">
                  Other Medical Conditions
                </Label>
                <Textarea
                  id="otherMedicalConditions"
                  name="otherMedicalConditions"
                  placeholder="List any other medical conditions not mentioned above"
                  value={profileData.otherMedicalConditions}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Meal Plan Preferences */}
          <div className="space-y-4 p-5 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold">Meal Plan Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Meal Frequency</Label>
                <Select
                  value={profileData.mealFrequency}
                  onValueChange={(value) =>
                    handleSelectChange("mealFrequency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How many meals per day?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meals</SelectItem>
                    <SelectItem value="4">4 meals</SelectItem>
                    <SelectItem value="5">5 meals</SelectItem>
                    <SelectItem value="6">6 small meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select
                  value={profileData.planType}
                  onValueChange={(value) =>
                    handleSelectChange("planType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time-based">
                      Time-Based (specific meal times)
                    </SelectItem>
                    <SelectItem value="flexible">
                      Flexible (eat when you want)
                    </SelectItem>
                    <SelectItem value="intermittent-fasting">
                      Intermittent Fasting
                    </SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* New: State/Region Selection */}
              <div className="space-y-2">
                <Label>Preferred Cuisine Region</Label>
                <Select
                  value={profileData.cuisineRegion}
                  onValueChange={(value) =>
                    handleSelectChange("cuisineRegion", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kerala">Kerala</SelectItem>
                    <SelectItem value="north-indian">North Indian</SelectItem>
                    <SelectItem value="south-indian">South Indian</SelectItem>
                    <SelectItem value="east-indian">East Indian</SelectItem>
                    <SelectItem value="west-indian">West Indian</SelectItem>
                    <SelectItem value="continental">Continental</SelectItem>
                    <SelectItem value="middle-eastern">
                      Middle Eastern
                    </SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="no-preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plan Duration</Label>
                <Select
                  value={profileData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-day">1 Day Trial</SelectItem>
                    <SelectItem value="3-day">3 Day</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isPending}>
            {isPending
              ? "Generating..."
              : " Generate My Personalized Meal Plan"}
          </Button>
        </div>

        {/* <div className="text-center text-sm">
          Want to adjust your preferences later?{" "}
          <Link to="/profile" className="underline underline-offset-4">
            Update in Profile
          </Link>
        </div> */}
      </form>
    </div>
  );
}
