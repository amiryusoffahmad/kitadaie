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
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <nav
                aria-label="Main navigation"
                className="flex w-full max-w-md items-center justify-around border-t border-slate-200 bg-white px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)] text-brand shadow-[0_-2px_8px_rgba(15,23,42,0.06)]"
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
                            className="relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl text-brand transition-colors hover:bg-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <NotificationIcon className="size-6" />
                            {isActive && (
                                <span
                                    aria-hidden="true"
                                    className="absolute bottom-1 h-0.5 w-5 rounded-full bg-brand"
                                />
                            )}
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
