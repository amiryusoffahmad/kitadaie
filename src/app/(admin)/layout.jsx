import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getRole } from "@/server/user/user.server"
import AdminBreadcrumb from "@/components/admin-breadcrumb"
import { Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Client component separated into its own component with its own 'use client' directive
const AppButton = () => {
    return (
        <Button asChild className="gap-2">
            <Link href="/mutabaah">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Go to App</span>
            </Link>
        </Button>
    )
}

// Make this a server component (no 'use client' directive)
export default async function Layout({ children }) {
    const session = await auth.api.getSession(
        {
            headers: await headers()
        }
    )

    if (!session) {
        redirect("/sign-in")
    }

    const data = await getRole(session.user.id)
    if (data.role !== "admin") {
        redirect("/home")
    }

    return (
        <SidebarProvider className="h-full min-h-0">
            <AppSidebar />
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <AdminBreadcrumb />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <AppButton />
                    </div>
                </header>
                <main className="flex flex-1 flex-col overflow-auto">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
