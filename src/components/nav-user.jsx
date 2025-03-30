"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { signOut, useSession } from '@/lib/auth-client'
import { useCurrentUserId, usePersonalData } from '@/app/api/profile/user-api'

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: session, isLoading: sessionLoading } = useSession()
  const { data: userId } = useCurrentUserId()
  const { data: profileData, isLoading: profileLoading } = usePersonalData(userId)

  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    image: ""
  })

  useEffect(() => {
    if (session?.user && profileData) {
      setUserData({
        firstName: profileData?.first_name || session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || ""
      })
    } else if (session?.user) {
      setUserData({
        firstName: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || ""
      })
    }
  }, [session, profileData])

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isLoading = sessionLoading || profileLoading;

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse"></div>
            <div className="grid flex-1 text-left text-sm leading-tight gap-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userData.image} alt={userData.firstName} />
                <AvatarFallback className="rounded-lg">{getInitials(userData.firstName)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.firstName}</span>
                <span className="truncate text-xs">{userData.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userData.image} alt={userData.firstName} />
                  <AvatarFallback className="rounded-lg">{getInitials(userData.firstName)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData.firstName}</span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => await signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/sign-in");
                },
              },
            })}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}