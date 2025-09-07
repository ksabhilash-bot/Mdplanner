import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { getAiFoodSuggestions } from "../meal/meal.api";

export default function AiSuggestions() {
  const [moodDescription, setMoodDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foodSuggestions, setFoodSuggestions] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!moodDescription.trim()) {
      toast.error("Please describe your mood", {
        description:
          "We need to know how you're feeling to suggest the right foods.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await getAiFoodSuggestions(moodDescription);
      console.log("API Response:", response);

      setFoodSuggestions(response);

      if (response.mealSuggestions?.length > 0) {
        setSelectedMeal(response.mealSuggestions[0]);
      }

      toast.success("Suggestions generated!", {
        description:
          "Based on your current mood, we've found some meal ideas for you.",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast.error("Error", {
        description: "Failed to generate suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (suggestionId, isPositive) => {
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId,
          isPositive,
          mood: moodDescription,
        }),
      });

      toast.success("Thanks for your feedback!", {
        description: "We'll use this to improve future suggestions.",
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  return (
    <div className="container mx-auto py-2 px-2 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-8 w-8" />
        <h1 className="text-3xl font-bold">AI Meal Suggestions</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
          <CardDescription>
            Describe your mood, cravings, or dietary needs, and our AI will
            suggest personalized meal ideas.
          </CardDescription>
        </CardHeader>
        {/* - I have low energy but want something healthy */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Examples: 
- I'm feeling stressed and need comfort food
- I'm craving something sweet but nutritious
- I have a headache and want something light
- I'm celebrating and want a special treat"
              value={moodDescription}
              onChange={(e) => setMoodDescription(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading || !moodDescription.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get meal suggestions
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {foodSuggestions && (
        <>
          {/* Mood Analysis */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mood Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{foodSuggestions.moodAnalysis}</p>
            </CardContent>
          </Card>

          {/* Recommended Foods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommended Foods</CardTitle>
              <CardDescription>
                These foods can help balance your hormones and improve your mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodSuggestions.recommendedFoods.map((food, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{food.food}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {food.benefits}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        Nutrients: {food.nutrients}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meal Suggestions */}
          {foodSuggestions.mealSuggestions && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Meal Suggestions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {foodSuggestions.mealSuggestions.map((meal, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMeal === meal
                        ? "border-primary ring-2 ring-primary/20"
                        : ""
                    }`}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize">
                        {meal.mealType}
                      </CardTitle>
                      <CardDescription>{meal.meal}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-sm mb-1">
                            Hormonal Benefits:
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {meal.hormonalBenefits}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(index, true);
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(index, false);
                            }}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" /> Not helpful
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Meal Details */}
              {selectedMeal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl capitalize">
                      {selectedMeal.mealType} Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Meal:</h3>
                      <p>{selectedMeal.meal}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Hormonal Benefits:</h3>
                      <p>{selectedMeal.hormonalBenefits}</p>
                    </div>

                    {selectedMeal.keyIngredients && (
                      <div>
                        <h3 className="font-semibold mb-2">Key Ingredients:</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedMeal.keyIngredients.map(
                            (ingredient, idx) => (
                              <li key={idx}>{ingredient}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Foods to Avoid */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Foods to Avoid</CardTitle>
              <CardDescription>
                These foods might worsen your current mood or hormonal balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {foodSuggestions.avoidFoods.map((food, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-destructive/10"
                  >
                    <h3 className="font-semibold text-destructive">
                      {food.food}
                    </h3>
                    <p className="text-sm text-destructive/80 mt-1">
                      {food.reason}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Tips */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {foodSuggestions.additionalTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Scientific Basis */}
          <Card>
            <CardHeader>
              <CardTitle>Scientific Basis</CardTitle>
              <CardDescription>
                Research supporting these recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {foodSuggestions.scientificBasis.map((basis, index) => (
                  <li key={index}>{basis}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
