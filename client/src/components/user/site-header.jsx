"use client";
import { Brain, Menu, X, SidebarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ModeToggle";
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SearchForm } from "@/components/user/search-form";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="flex h-16 items-center px-4">
        {/* Sidebar Toggle and Logo */}
        <div className="flex items-center gap-4">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-black dark:text-white" />
            <span className="text-xl font-bold text-black dark:text-white">
              MdPlanner
            </span>
          </div>
        </div>

        {/* Search and Navigation */}
        <div className="flex flex-1 items-center justify-center px-4">
          <SearchForm className="w-full max-w-md" />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
          </nav>

          <div className="hover:bg-gray-200 dark:hover:bg-muted/100 rounded-md transition-colors duration-200">
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white dark:bg-background">
          <div className="px-3 py-2 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
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
    </header>
  );
}