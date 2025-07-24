"use client";
import { useState } from "react";
import { Brain, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm fixed w-full z-50">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-black dark:text-white" />
            <span className="text-xl font-bold text-black dark:text-white">
              NutriAI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
            >
              Sign In
            </Link>
            <div className="hover:bg-gray-200 dark:hover:bg-muted/100 rounded-md transition-colors duration-200">
              <ModeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <div className="hover:bg-gray-100 dark:hover:bg-muted/100 rounded-md transition-colors duration-200">
              <ModeToggle />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:bg-gray-100 dark:text-white dark:hover:bg-muted/50"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-background">
          <div className="px-3 py-2 space-y-1">
            <Link
              to="/#features"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
