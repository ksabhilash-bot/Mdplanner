import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useProfileStore } from "../profile/profile.store";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../profile/profile.api";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect } from "react";

export default function UserProfilePage() {
  const navigate = useNavigate();
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
      console.log("userprofile: ", data.profile);
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

  if (isLoading) return <FullPageSpinner />;

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  // Profile sections data
  const profileSections = [
    {
      title: "Account Information",
      items: [
        { label: "Name", value: user?.name },
        { label: "Email", value: user?.email },
        {
          label: "Account Status",
          value: user?.isProfileComplete ? "Complete" : "Incomplete",
        },
      ],
    },
    {
      title: "Basic Information",
      items: [
        { label: "Age", value: profileData?.age },
        { label: "Gender", value: profileData?.gender },
        {
          label: "Height",
          value: profileData?.height ? `${profileData.height} cm` : null,
        },
        {
          label: "Weight",
          value: profileData?.weight ? `${profileData.weight} kg` : null,
        },
      ],
    },
    {
      title: "Activity & Goals",
      items: [
        { label: "Activity Level", value: profileData?.activityLevel },
        { label: "Fitness Goal", value: profileData?.fitnessGoal },
        {
          label: "Target Weight",
          value: profileData?.targetWeight
            ? `${profileData.targetWeight} kg`
            : "Not specified",
        },
      ],
    },
    {
      title: "Dietary Preferences",
      items: [
        { label: "Diet Preference", value: profileData?.dietPreference },
        { label: "Cuisine Region", value: profileData?.cuisineRegion },
        { label: "Meals Per Day", value: profileData?.mealFrequency },
      ],
    },
    {
      title: "Health Information",
      items: [
        {
          label: "Food Allergies",
          value: profileData?.foodAllergies?.includes("None")
            ? "None"
            : profileData?.foodAllergies?.join(", ") || "None specified",
        },
        {
          label: "Other Allergies",
          value: profileData?.otherAllergies || "None specified",
        },
        {
          label: "Medical Conditions",
          value: profileData?.medicalConditions?.includes("None")
            ? "None"
            : profileData?.medicalConditions?.join(", ") || "None specified",
        },
        {
          label: "Other Conditions",
          value: profileData?.otherMedicalConditions || "None specified",
        },
      ],
    },
    {
      title: "Meal Plan Preferences",
      items: [
        { label: "Plan Type", value: profileData?.planType },
        { label: "Duration Preference", value: profileData?.duration },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">
              {user?.isProfileComplete
                ? "Profile complete"
                : "Profile incomplete"}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => navigate("/profile/edit")} variant="outline">
              Edit Profile
            </Button>
            <Button
              onClick={() => navigate("/user/meal-plan")}
              variant="default"
            >
              View Meal Plan
            </Button>
          </div>
        </div>

        {/* Profile incomplete warning */}
        {!user?.isProfileComplete && (
          <div className="mb-6 border rounded-lg p-4 shadow-sm bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-orange-800">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-orange-600">
                  Complete your profile to get personalized meal and workout
                  plans
                </p>
              </div>
              <Button
                onClick={() => navigate("/profile/setup")}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Complete Now
              </Button>
            </div>
          </div>
        )}

        {/* Profile Sections */}
        <div className="grid gap-6">
          {profileSections.map((section) => (
            <div
              key={section.title}
              className="border rounded-lg p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="font-medium">
                      {item.value || "Not specified"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate("/user/meal-plan")}
              variant="outline"
              className="h-20 flex-col"
            >
              <span className="font-medium">Meal Plan</span>
              <span className="text-xs text-muted-foreground">
                View your personalized plan
              </span>
            </Button>
            <Button
              onClick={() => navigate("/user/workout-plan")}
              variant="outline"
              className="h-20 flex-col"
            >
              <span className="font-medium">Workout Plan</span>
              <span className="text-xs text-muted-foreground">
                View your fitness routine
              </span>
            </Button>
            <Button
              onClick={() => navigate("/user/progress")}
              variant="outline"
              className="h-20 flex-col"
            >
              <span className="font-medium">Progress</span>
              <span className="text-xs text-muted-foreground">
                Track your journey
              </span>
            </Button>
            <Button
              onClick={() => navigate("/profile/edit")}
              variant="outline"
              className="h-20 flex-col"
            >
              <span className="font-medium">Edit Profile</span>
              <span className="text-xs text-muted-foreground">
                Update your information
              </span>
            </Button>
          </div>
        </div>

        {/* Meal Plans Section - Uncomment when needed */}
        {/* {user?.mealPlans?.length > 0 && (
          <div className="mt-8 border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Meal Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.mealPlans.map((planId) => (
                <div 
                  key={planId}
                  className="border p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/meal-plans/${planId}`)}
                >
                  <p className="font-medium">Meal Plan</p>
                  <p className="text-sm text-muted-foreground">ID: {planId.slice(-6)}</p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
