"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { markAsRead, deleteUserNotifications } from "@/server/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Check,
    Trash2,
    Mail,
    MailOpen
} from "lucide-react";

export function NotificationItem({
    notification,
    onActionComplete
}) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Format the notification timestamp
    const formattedDate = notification.created_at
        ? format(new Date(notification.created_at), "MMM d, h:mm a")
        : "";

    // Mark notification as read
    const handleMarkAsRead = async (e) => {
        if (notification.read) return;

        // Stop event propagation to prevent navigation when clicking action buttons
        e?.stopPropagation();

        try {
            setIsLoading(true);
            await markAsRead({ notificationIds: notification.id });
            toast.success("Message marked as read");
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error("Failed to mark message as read");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete notification
    const handleDelete = async (e) => {
        // Stop event propagation to prevent navigation when clicking action buttons
        e.stopPropagation();

        try {
            setIsLoading(true);
            await deleteUserNotifications({ notificationIds: notification.id });
            toast.success("Message deleted");
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error("Failed to delete message");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle click on notification item
    const handleClick = async () => {
        // Mark as read if unread
        if (!notification.read) {
            await handleMarkAsRead();
        }

        // Navigate based on notification type
        if (notification.type === "organizational_task" && notification.resource_id) {
            // Navigate to task detail page
            router.push(`/tasks/${notification.resource_id}`);
        } else {
            // Navigate to notification detail page
            router.push(`/user/notifications/${notification.id}`);
        }
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-4 border-b transition-colors cursor-pointer hover:bg-muted/10",
                notification.read
                    ? "bg-background"
                    : "bg-muted/20"
            )}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        {notification.read
                            ? <MailOpen className="h-5 w-5 text-primary" />
                            : <Mail className="h-5 w-5 text-primary" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium">{notification.title}</div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                            {notification.message}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!notification.read && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleMarkAsRead}
                            disabled={isLoading}
                            title="Mark as read"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isLoading}
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 