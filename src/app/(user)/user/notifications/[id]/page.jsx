"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Trash2, MailOpen, File, Upload, Calendar, Mail } from "lucide-react";
import { markAsRead, deleteUserNotifications } from "@/server/actions/notification-actions";
import { toast } from "sonner";
import { useNotifications } from "@/providers/notification-provider";
import Link from "next/link";
import { fetchUserNotifications } from "@/server/actions/notification-actions";

export default function NotificationDetailPage({ params }) {
    const router = useRouter();
    const { refreshUnreadCount } = useNotifications();
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the specific notification
    useEffect(() => {
        const fetchNotification = async () => {
            try {
                setIsLoading(true);
                // There's no direct method to fetch a single notification, so we'll use a workaround
                // by fetching all notifications and finding the one with the matching ID
                const data = await fetchUserNotifications({ limit: 100 });

                if (data && data.notifications) {
                    const found = data.notifications.find(n => n.id === parseInt(params.id));

                    if (found) {
                        setNotification(found);

                        // Mark as read if it's unread
                        if (!found.read) {
                            await markAsRead({ notificationIds: found.id });
                            refreshUnreadCount();
                        }
                    } else {
                        toast.error("Notification not found");
                        router.push("/user/notifications");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch notification:", error);
                toast.error("Failed to load notification");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotification();
    }, [params.id]);

    // Handle delete notification
    const handleDelete = async () => {
        try {
            await deleteUserNotifications({ notificationIds: notification.id });
            toast.success("Notification deleted");
            router.push("/user/notifications");
            refreshUnreadCount();
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    // Format date
    const formattedDate = notification?.created_at
        ? format(new Date(notification.created_at), "MMM d, yyyy h:mm a")
        : "";

    // Get icon based on notification type
    const getNotificationIcon = () => {
        if (!notification) return null;

        return notification.read
            ? <MailOpen className="h-6 w-6 text-primary" />
            : <Mail className="h-6 w-6 text-primary" />;
    };

    // Get resource link if applicable
    const getResourceLink = () => {
        if (!notification?.resource_id || !notification?.resource_type) return null;

        let url = null;
        let label = "View Original";

        switch (notification.resource_type) {
            case "assignment":
                url = `/user/tprog/assignment/${notification.resource_id}`;
                label = "View Assignment";
                break;
            case "event":
                url = `/user/events/${notification.resource_id}`;
                label = "View Event";
                break;
            case "document":
                url = `/user/documents/${notification.resource_id}`;
                label = "View Document";
                break;
            default:
                return null;
        }

        if (url) {
            return (
                <Link href={url}>
                    <Button variant="outline" size="sm">
                        {label}
                    </Button>
                </Link>
            );
        }

        return null;
    };

    if (isLoading) {
        return (
            <div className="container max-w-4xl py-6 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-pulse h-6 w-32 bg-muted rounded-md mb-4"></div>
                <div className="animate-pulse h-4 w-64 bg-muted rounded-md mb-2"></div>
                <div className="animate-pulse h-4 w-48 bg-muted rounded-md mb-8"></div>
                <div className="animate-pulse h-20 w-full max-w-lg bg-muted rounded-md"></div>
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="container max-w-4xl py-6">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-xl font-medium mb-2">Notification not found</h2>
                    <p className="text-muted-foreground mb-4">This notification may have been deleted.</p>
                    <Button variant="outline" onClick={() => router.push("/user/notifications")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Notifications
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-4"
                    onClick={() => router.push("/user/notifications")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <h1 className="text-xl font-bold">Message Details</h1>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            {getNotificationIcon()}
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">{notification.title}</h2>
                            <p className="text-sm text-muted-foreground">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="pt-4 border-t">
                    <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line">{notification.message}</p>
                    </div>
                </div>

                {getResourceLink() && (
                    <div className="pt-4 flex justify-end">
                        {getResourceLink()}
                    </div>
                )}
            </div>
        </div>
    );
} 