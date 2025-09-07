import { AppSidebar } from "@/components/user/app-sidebar";
import { SiteHeader } from "@/components/user/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NavBar from "@/components/ui/navbar";

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/others/full-page-spinner";

export const iframeHeight = "800px";

export const description = "A sidebar with a header and a search form.";

export default function UserLayout() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading)
    return (
      <div>
        <FullPageSpinner />
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        {/* <NavBar /> */}
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
              </div>
              <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
