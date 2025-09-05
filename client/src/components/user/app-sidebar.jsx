import * as React from "react";
import {
  Home,
  User,
  Utensils,
  Calendar,
  Activity,
  FileText,
  Settings,
  MessageSquare,
  HeartPulse,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/user/nav-main";
import { NavSecondary } from "@/components/user/nav-secondary";
import { NavUser } from "@/components/user/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/userdashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Profile",
      url: "/user/profile",
      icon: User,
    },
    {
      title: "Track Meal",
      url: "/user/mealplan",
      icon: Utensils,
    },
    // {
    //   title: "Customize",
    //   url: "/user/editmealplan",
    //   icon: Calendar,
    // },
    // {
    //   title: "Progress",
    //   url: "/user/progress",
    //   icon: Activity,
    // },
    // {
    //   title: "Reports",
    //   url: "/user/reports",
    //   icon: FileText,
    // },
    // {
    //   title: "Community",
    //   url: "#",
    //   icon: Users,
    // },
    // {
    //   title: "Health Metrics",
    //   url: "#",
    //   icon: HeartPulse,
    // },
    // {
    //   title: "Messages",
    //   url: "#",
    //   icon: MessageSquare,
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings,
    // },
  ],
  navSecondary: [], // Empty since we're not using secondary nav items
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      className="top-[calc(var(--header-height)+8px)] h-[calc(100svh-var(--header-height)-8px)]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {/* <a href="#">
                <div className="bg-black dark:bg-white flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Home className="size-4 text-white dark:text-black" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-gray-900 dark:text-white">Health Tracker</span>
                </div>
              </a> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}