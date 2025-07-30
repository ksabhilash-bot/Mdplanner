"use client";
import { Brain, Menu, X, SidebarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/auth.store";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading, checkAuth, setUser, logout } =
    useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    const { isAuthenticated, user } = useAuthStore.getState();

    if (!isAuthenticated) {
      console.log("🔒 User is not logged in");
    } else {
      console.log("✅ User is logged in:", user);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/"); // or window.location.reload()
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="flex h-16 items-center px-4">
        {/* Compact logo section with perfectly balanced spacing */}
        <div className="flex items-center">
          <div className="flex items-center ml-1.5">
            <Brain className="h-5 w-5 text-black dark:text-white" />
            <span className="ml-2 mr-2 text-lg font-bold text-black dark:text-white">
              MdPlanner
            </span>
          </div>
          {/* Subtle gray vertical divider */}
          <div className="h-5 w-[0.5px] bg-gray-300 mx-1.5"></div>
          <Button
            className="h-8 w-8 p-0 mr-1.5" // 0.375rem right margin
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon className="h-4 w-4" />
          </Button>
        </div>
        {/* Right Side Controls */}

        <div className="flex items-center gap-2 ml-auto">
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
                >
                  Home
                </Link>
                <Link
                  to="/logout"
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
              >
                Home
              </Link>
            )}
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
