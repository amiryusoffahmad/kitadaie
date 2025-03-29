"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  SquareTerminal,
  SquareChartGantt,
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
// This is sample data.
const data = {
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    }
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "LKD SLT",
      logo: GalleryVerticalEnd,
      // plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Master",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Database User",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      title: "TProg",
      url: "#",
      icon: SquareChartGantt,
      isActive: true,
      items: [
        {
          title: "Class",
          url: "#",
        },
        {
          title: "User",
          url: "#",
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
