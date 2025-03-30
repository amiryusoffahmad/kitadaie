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
      url: "/admin-tprog",
      icon: SquareChartGantt,
      isActive: true,
      items: [
        {
          title: "Class",
          url: "/admin-tprog/class",
        },
        {
          title: "User",
          url: "/admin-tprog/user",
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
