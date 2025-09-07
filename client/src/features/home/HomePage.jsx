import React, { useState, useEffect } from "react";
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
  Star,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/common/ModeToggle";
import { Link } from "react-router-dom";
// import Navbar from "@/components/ui/navbar"; // Import the new Navbar component
import { useLocation } from "react-router-dom";

export default function DietPlannerLanding() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      let el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView();
      }
    }
  }, [location]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Personalization",
      description:
        "Smart system analyzes your age, weight, height, diet preferences, goals, and health conditions to create the perfect plan.",
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Flexible Planning",
      description:
        "Choose from daily, weekly, or monthly plans. Generate meals on-demand or plan ahead - your choice.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Precise Calorie Tracking",
      description:
        "Track your intake with smart calorie and nutrient calculations. Log what you eat and stay on target.",
    },
    {
      icon: <Utensils className="h-8 w-8" />,
      title: "Complete Customization",
      description:
        "Add, change, or swap meals effortlessly. Your plan adapts to your preferences and lifestyle.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Daily Analytics",
      description:
        "Detailed statistics show your progress, missed meals, and daily achievements with comprehensive reports.",
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Reminders",
      description:
        "Never miss a meal with intelligent scheduling and reminder system tailored to your routine.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Mood Integration",
      description:
        "Track how your nutrition affects your mood and energy levels for holistic health insights.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Tracking",
      description:
        "Monitor weight changes, goal achievement, and decide whether to continue or generate new plans.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Enthusiast",
      content:
        "Lost 15 pounds in 2 months! The AI recommendations were spot-on for my busy lifestyle.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Software Engineer",
      content:
        "Finally a diet app that understands my irregular schedule. The meal swapping feature is a game-changer.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Working Mom",
      content:
        "The mood tracking helped me understand my eating patterns. I feel more energized than ever!",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Your AI-Powered
                <span className="block text-muted-foreground">
                  Nutrition Partner
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your health with personalized meal plans, smart
                tracking, and intelligent insights. Let AI create the perfect
                diet plan tailored just for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button>
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for successful nutrition management, powered
              by advanced AI
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple, intelligent process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Tell Us About You",
                description:
                  "Share your age, weight, height, dietary preferences, health goals, and lifestyle. Our AI analyzes every detail to understand your unique needs.",
              },
              {
                step: "02",
                title: "Get Your Plan",
                description:
                  "Receive a personalized meal plan with precise calorie and nutrient calculations. Choose daily, weekly, or monthly planning that fits your schedule.",
              },
              {
                step: "03",
                title: "Track & Achieve",
                description:
                  "Log your meals, track progress, and watch as our AI adapts your plan. Get reminders, analytics, and celebrate your achievements along the way.",
              },
            ].map((item, index) => (
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

      {/* CTA Section */}
      <section className="py-24 bg-muted text-foreground">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Start your personalized journey today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Matching "How It Works" style */}
      <footer className="py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          Features
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>
              &copy; 2025 NutriAI. All rights reserved. Powered by artificial
              intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
