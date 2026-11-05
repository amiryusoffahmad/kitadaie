"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuFooter,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "./notification-item";
import { useNotifications } from "@/providers/notification-provider";
import { fetchUserNotifications, markAsRead } from "@/server/actions/notification-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDropdown() {
    const { unreadCount, refreshUnreadCount } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Fetch recent notifications when dropdown is opened
    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    // Fetch recent notifications (only the 5 most recent)
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await fetchUserNotifications({
                limit: 5,
                offset: 0
            });

            if (data && data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle notification action completion (refresh data)
    const handleActionComplete = () => {
        fetchNotifications();
        refreshUnreadCount();
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await markAsRead({ all: true });
            handleActionComplete();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu onOpenChange={setOpen} open={open}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <Mail className="h-5 w-5" />
                    ) : (
                        <MailOpen className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 px-1 min-w-4 h-4 text-[10px] flex items-center justify-center"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                    <h2 className="font-medium">Inbox</h2>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={handleMarkAllAsRead}
                            disabled={loading}
                        >
                            <MailOpen className="h-3 w-3 mr-1" />
                            Mark all as read
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                <ScrollArea className="max-h-[400px]">
                    {loading ? (
                        <div role="status" aria-label="Loading notifications" className="space-y-3 p-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <Skeleton className="size-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No messages yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onActionComplete={handleActionComplete}
                            />
                        ))
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />
                <DropdownMenuFooter className="flex justify-center p-2">
                    <Link href="/user/notifications" passHref>
                        <Button variant="ghost" className="w-full text-sm" onClick={() => setOpen(false)}>
                            Open Inbox
                        </Button>
                    </Link>
                </DropdownMenuFooter>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 