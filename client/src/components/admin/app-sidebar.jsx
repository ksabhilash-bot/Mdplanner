import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconUsers,
  IconDatabase,
  IconNotification,
  IconReport,
  IconSettings,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react";
import { NavMain } from "@/components/admin/nav-main";
import { NavSecondary } from "@/components/admin/nav-secondary";
import { NavUser } from "@/components/admin/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Brain } from "lucide-react";
import { Shield, Lock, LayoutDashboard } from "lucide-react";

const data = {
  user: {
    name: "Admin User",
    email: "admin@mdplanner.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/admin/overview",
      icon: IconDashboard,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "Meal Database",
      url: "/admin/meals",
      icon: IconDatabase,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: IconChartBar,
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: IconNotification,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
     {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "/admin/settings",
  //     icon: IconSettings,
  //   },
    // {
    //   title: "Get Help",
    //   url: "/admin/help",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Search",
    //   url: "/admin/search",
    //   icon: IconSearch,
    // },
  // ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              {/* <a href="/admin" className="flex items-center gap-1.5">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  MdPlanner
                </span>
              </a> */}
              <a href="/admin" className="flex items-center gap-2 px-1">
                <Shield className="h-5 w-5 text-primary" />{" "}
                {/* Shield icon for admin */}
                <span className="text-lg font-semibold text-primary">
                  MdPlanner Admin
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
