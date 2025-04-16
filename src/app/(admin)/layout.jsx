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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <AdminBreadcrumb />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Button className="gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span className="text-sm">Go to App</span>
                        </Button>
                    </div>
                </header>
                <div>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
