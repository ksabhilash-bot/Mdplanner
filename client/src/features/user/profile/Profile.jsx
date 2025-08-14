import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useProfileStore } from "../profile/profile.store";
import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../profile/profile.api";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  // px-4 py-6

  return (
    <div className="container mx-auto py-8 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Header with status and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              My Profile
              {/* <Badge
                variant={user?.isProfileComplete ? "default" : "secondary"}
              >
                {user?.isProfileComplete ? "Complete" : "Incomplete"}
              </Badge> */}
            </h1>
            {/* <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p> */}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate("/profile/edit")}
              variant="outline"
              size="sm"
            >
              Edit Profile
            </Button>
            {/* <Button onClick={() => navigate("/user/meal-plan")} size="sm">
              View Meal Plan
            </Button> */}
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

        {/* Quick actions */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              onClick={() => navigate("/user/meal-plan")}
              variant="outline"
              className="h-20 flex-col py-2"
            >
              <span className="font-medium">Meal Plan</span>
              <span className="text-xs text-muted-foreground">
                View your personalized plan
              </span>
            </Button>
            <Button
              onClick={() => navigate("/user/workout-plan")}
              variant="outline"
              className="h-20 flex-col py-2"
            >
              <span className="font-medium">Workout Plan</span>
              <span className="text-xs text-muted-foreground">
                View your fitness routine
              </span>
            </Button>
            <Button
              onClick={() => navigate("/user/progress")}
              variant="outline"
              className="h-20 flex-col py-2"
            >
              <span className="font-medium">Progress</span>
              <span className="text-xs text-muted-foreground">
                Track your journey
              </span>
            </Button>
            <Button
              onClick={() => navigate("/profile/edit")}
              variant="outline"
              className="h-20 flex-col py-2"
            >
              <span className="font-medium">Edit Profile</span>
              <span className="text-xs text-muted-foreground">
                Update your information
              </span>
            </Button>
          </div>
        </div> */}

        {/* Additional details in an accordion would go here */}
      </div>
    </div>
  );
}
