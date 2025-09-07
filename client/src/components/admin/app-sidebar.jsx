import * as React from "react";
import { Link } from "react-router-dom";
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
import { Shield, Lock, LayoutDashboard, Utensils, List } from "lucide-react";

const data = {
  user: {
    name: "Admin User",
    email: "admin@mdplanner.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/admindashboard", // Fixed: matches your AppRouter route
      icon: IconDashboard,
    },
    {
      title: "User management",
      url: "/admin/usermanagement",
      icon: IconUsers,
    },
    {
      title: "Manage foods",
      url: "/admin/managefoods",
      icon: Utensils, // Using Lucide React's Utensils icon for food management
    },
    {
      title: "Add Foods",
      url: "/admin/addfood",
      icon: List, // Using Lucide React's List icon for foods list
    },
    // {
    //   title: "Meal Database",
    //   url: "/admin/meals",
    //   icon: IconDatabase,
    // },
    // {
    //   title: "Analytics",
    //   url: "/admin/analytics",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Notifications",
    //   url: "/admin/notifications",
    //   icon: IconNotification,
    // },
    // {
    //   title: "Reports",
    //   url: "/admin/reports",
    //   icon: IconReport,
    // },
    // {
    //   title: "Settings",
    //   url: "/admin/settings",
    //   icon: IconSettings,
    // },
  ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "/admin/settings",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "/admin/help",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "/admin/search",
  //     icon: IconSearch,
  //   },
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
              <Link
                to="/admindashboard"
                className="flex items-center gap-2 px-1"
              >
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  MdPlanner Admin
                </span>
              </Link>
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
