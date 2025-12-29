"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Home,
  Users,
  GraduationCap,
  Building2,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  Network,
  Bell,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavTop } from "@/components/nav-top"

// Admin sidebar data
const data = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Profile Report",
          url: "/dashboard/profile-report",
        },
      ],
    }
  ],
  teams: [
    {
      name: "LKD SLT",
      logo: GalleryVerticalEnd,
    },
  ],
  navMain: [
    {
      title: "Resources",
      url: "/admin-resources",
      icon: FileText,
      items: [
        {
          title: "All Resources",
          url: "/admin-resources",
        },
        {
          title: "Categories",
          url: "/admin-resources/categories",
        },
      ],
    },
  ],
  projects: [
    {
      title: "TProg",
      url: "/admin-tprog",
      icon: GraduationCap,
      items: [
        {
          title: "All Classes",
          url: "/admin-tprog",
        },
        {
          title: "Class Management",
          url: "/admin-tprog/class",
        },
        {
          title: "User Management",
          url: "/admin-tprog/user",
        },
      ],
    },
    {
      title: "Organizational",
      url: "/admin-organizational",
      icon: Building2,
      items: [
        {
          title: "Tasks",
          url: "/admin-organizational/tasks",
        },
        {
          title: "Departments",
          url: "/admin-organizational/departments",
        },
        {
          title: "Roles",
          url: "/admin-organizational/roles",
        },
        {
          title: "Assignments",
          url: "/admin-organizational/assignments",
        },
      ],
    },
    {
      title: "Notifications",
      url: "/admin-notifications",
      icon: Bell,
      items: [
        {
          title: "Dashboard",
          url: "/admin-notifications",
        },
        {
          title: "Send Notification",
          url: "/admin-notifications/send",
        },
        {
          title: "Templates",
          url: "/admin-notifications/templates",
        },
        {
          title: "History",
          url: "/admin-notifications/history",
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavTop items={data.main} />
        <NavMain items={data.navMain} />
        <NavProjects items={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
