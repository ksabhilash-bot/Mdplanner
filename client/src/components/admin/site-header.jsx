import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/common/ModeToggle";

export function SiteHeader() {
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
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Navigation</h1>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="hidden sm:flex"
              >
                <Link
                  to="/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground"
                >
                  Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="hidden sm:flex"
              >
                <Link
                //  to="/logout"
                  onClick={handleLogout}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="dark:text-foreground"
                >
                  Sign Out
                </Link>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="hidden sm:flex"
            >
              <Link
                to="/"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground"
              >
                Home
              </Link>
            </Button>
          )}
          <div className="hover:bg-gray-200 dark:hover:bg-muted/100 rounded-md transition-colors duration-200">
            <ModeToggle />
          </div>

          {/* <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Linkedin
            </Link>
          </Button> */}
        </div>
      </div>
    </header>
  );
}
