import React from "react";
import {
  ArrowRight,
  Calendar,
  Target,
  TrendingUp,
  Bell,
  Heart,
  BarChart3,
  Utensils,
  Brain,
  CheckCircle,
  Users,
  ChefHat,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function DietPlannerLanding() {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Nutrition Calculation",
      description:
        "Smart calorie and macro calculations based on your profile data with automatic recalculation when you update your weight.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Daily Progress Tracking",
      description:
        "Visual progress bars showing your daily calorie and nutrient intake compared to your goals.",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Date-based Meal Planning",
      description:
        "View your nutrition data for any day within your plan duration with our interactive date picker.",
    },
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Food Database Tracking",
      description:
        "Comprehensive food database with quantity tracking that updates your dashboard in real-time.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Weight & Profile Management",
      description:
        "Update your weight and profile information to automatically recalculate your nutritional needs.",
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Meal Reminders",
      description:
        "Notifications for meal timings and alerts for skipped meals with configurable meal windows.",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI Mood-based Suggestions",
      description:
        "Get personalized food recommendations based on your mood using Gemini AI integration.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Admin Dashboard",
      description:
        "Comprehensive admin panel with user insights, food management, and activity monitoring.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Profile",
      description:
        "Enter your age, height, weight, activity level, diet preference (veg/non-veg), and select your plan duration and meal frequency.",
    },
    {
      step: "02",
      title: "Get Personalized Nutrition",
      description:
        "Our system calculates your daily calorie needs and macronutrient distribution based on your goals and profile.",
    },
    {
      step: "03",
      title: "Track & Monitor Progress",
      description:
        "Use our comprehensive dashboard to track your food intake, monitor progress bars, and stay on target with your nutritional goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Meal and Diet
                <span className="block text-muted-foreground">
                  Planning System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Complete nutrition management with calorie and nutrition
                calculations, progress tracking, meal reminders, and ai powered
                intelligent food suggestions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <Link to="/signup">
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Complete Nutrition Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for successful nutrition management and
              tracking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary transition-colors duration-300 hover:shadow-lg group"
              >
                <CardHeader>
                  <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple three-step process to get started with personalized
              nutrition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="text-6xl font-bold text-muted mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              System Architecture
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive nutrition management with multiple integrated
              modules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">User Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span>Personalized calorie & macro calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Progress tracking with visual indicators</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Date-based nutrition viewing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>AI mood-based food suggestions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Meal reminders and skip alerts</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Admin Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span>User management with CRUD operations</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Dashboard with user insights and analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="h-5 w-5 text-primary" />
                  <span>Food database management</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Recent activity monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>System health and performance metrics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>
              &copy; 2025 Nutrition Tracker. All rights reserved. Advanced
              nutrition management system.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
