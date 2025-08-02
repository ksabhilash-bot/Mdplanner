"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ModeToggle } from "@/components/common/ModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsUserDropdownOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm fixed w-full z-50">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center ml-1.5">
            <Brain className="h-5 w-5 text-black dark:text-white" />
            <span className="ml-2 text-lg font-bold text-black dark:text-white">
              MdPlanner
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

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <span>{user.name || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-background border border-border z-50">
                    <div className="py-1">
                      <Link
                        to={user.role === "admin" ? "/admindashboard" : "/user/userdashboard"}
                        className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-muted/50"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        {/* <User className="h-4 w-4 mr-2" /> */}
                        {user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-muted/50"
                      >
                        {/* <LogOut className="h-4 w-4 mr-2" /> */}
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-black hover:text-black hover:bg-gray-200 dark:text-white dark:hover:text-white dark:hover:bg-muted/100 rounded-md transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
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
              to="/"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={closeAllMenus}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={closeAllMenus}
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
              onClick={closeAllMenus}
            >
              How It Works
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admindashboard" : "/userdashboard"}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
                  onClick={closeAllMenus}
                >
                  <User className="h-4 w-4 mr-2" />
                  {user.role === "admin" ? "Admin Dashboard" : "My Dashboard"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-sm font-medium text-black hover:text-black hover:bg-gray-100 dark:text-white dark:hover:text-white dark:hover:bg-muted/50 transition-colors duration-200"
                onClick={closeAllMenus}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}