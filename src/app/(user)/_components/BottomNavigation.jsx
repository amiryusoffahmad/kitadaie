"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Grid3X3, ListChecks, Mail, MailOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/providers/notification-provider"

const navigationItems = [
    { href: "/mutabaah", label: "Mutabaah", icon: ListChecks },
    { href: "/resources", label: "Library", icon: BookOpen },
    { href: "/user/notifications", label: "Inbox", icon: MailOpen },
    { href: "/profile", label: "Apps", icon: Grid3X3 },
]

export default function BottomNavigation() {
    const pathname = usePathname()
    const { unreadCount } = useNotifications()

    return (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center px-4">
            <nav
                aria-label="Main navigation"
                className="flex items-center gap-1 rounded-full bg-foreground p-2 text-background shadow-lg"
            >
                {navigationItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === "/profile"
                        ? pathname.startsWith("/profile")
                        : pathname === href || pathname.startsWith(`${href}/`)
                    const NotificationIcon = unreadCount > 0 && label === "Inbox" ? Mail : Icon

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={label}
                            aria-current={isActive ? "page" : undefined}
                            title={label}
                            className="relative flex size-14 items-center justify-center rounded-full transition-colors hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <span
                                className={`absolute inset-1 rounded-full transition-colors ${
                                    isActive ? "bg-primary" : ""
                                }`}
                            />
                            <NotificationIcon className="relative z-10 size-6" />
                            {label === "Inbox" && unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute right-1 top-1 z-20 flex h-4 min-w-4 items-center justify-center px-1 text-[10px]"
                                >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </Badge>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
