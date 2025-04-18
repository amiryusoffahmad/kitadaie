"use client";

import { useState, useEffect } from "react";
import { fetchUserNotifications, markAsRead } from "@/server/actions/notification-actions";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/providers/notification-provider";
import { Loader2, MailOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { refreshUnreadCount, unreadCount } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
    });

    // Fetch notifications based on active tab
    useEffect(() => {
        fetchNotifications();
    }, [activeTab, pagination.offset, pagination.limit, unreadCount]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const unreadOnly = activeTab === "unread";

            const data = await fetchUserNotifications({
                unreadOnly,
                limit: pagination.limit,
                offset: pagination.offset,
            });

            if (data && data.notifications) {
                setNotifications(data.notifications);
                setPagination(data.pagination);

                // Refresh the global unread count instead of managing local state
                refreshUnreadCount();
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAsRead({ all: true });
            toast.success("All messages marked as read");
            await fetchNotifications();
            refreshUnreadCount();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            toast.error("Failed to mark all as read");
        }
    };

    // Handle notification action completion (refresh data)
    const handleActionComplete = async () => {
        await fetchNotifications();
        refreshUnreadCount();
    };

    // Handle pagination
    const handlePrevPage = () => {
        if (pagination.offset - pagination.limit >= 0) {
            setPagination({
                ...pagination,
                offset: pagination.offset - pagination.limit,
            });
        }
    };

    const handleNextPage = () => {
        if (pagination.offset + pagination.limit < pagination.total) {
            setPagination({
                ...pagination,
                offset: pagination.offset + pagination.limit,
            });
        }
    };

    // Calculate current page and total pages
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Inbox</h1>
                <p className="text-muted-foreground">
                    View and manage your messages
                </p>
            </div>

            <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value);
                    setPagination({ ...pagination, offset: 0 });
                }}
            >
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all">
                            All Messages
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            Unread
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="ml-2 px-1 min-w-4 h-4 text-[10px]"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={isLoading}
                        >
                            <MailOpen className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <TabsContent value="all" className="mt-4">
                    <NotificationsList
                        notifications={notifications}
                        isLoading={isLoading}
                        onActionComplete={handleActionComplete}
                        emptyMessage="No messages"
                    />
                </TabsContent>

                <TabsContent value="unread" className="mt-4">
                    <NotificationsList
                        notifications={notifications}
                        isLoading={isLoading}
                        onActionComplete={handleActionComplete}
                        emptyMessage="No unread messages"
                    />
                </TabsContent>

                {!isLoading && notifications.length > 0 && pagination.total > pagination.limit && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {pagination.offset + 1}-
                            {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
                            {pagination.total}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={pagination.offset === 0}
                            >
                                Previous
                            </Button>
                            <div className="text-sm">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={pagination.offset + pagination.limit >= pagination.total}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    );
}

// Helper component for notifications list
function NotificationsList({ notifications, isLoading, onActionComplete, emptyMessage }) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn("border rounded-lg divide-y")}>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onActionComplete={onActionComplete}
                />
            ))}
        </div>
    );
} 