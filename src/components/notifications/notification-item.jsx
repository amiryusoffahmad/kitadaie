"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { markAsRead, deleteUserNotifications } from "@/server/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Check,
    Trash2,
    Mail,
    MailOpen,
    Calendar,
    Info
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export function NotificationItem({
    notification,
    onActionComplete
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Safety Guard: Avoid crashing if notification data is corrupt or missing
    if (!notification) return null;

    const formattedDate = notification.created_at
        ? format(new Date(notification.created_at), "MMM d, h:mm a")
        : "";

    // Handle marking the notification as read
    const handleMarkAsRead = async (e) => {
        if (notification.read) return;
        e?.stopPropagation(); // Prevent triggering the parent container's click event

        try {
            setIsLoading(true);
            await markAsRead({ notificationIds: notification.id });
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error("Failed to mark message as read");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting the notification
    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent opening the pop-up modal when deleting

        try {
            setIsLoading(true);
            await deleteUserNotifications({ notificationIds: notification.id });
            toast.success("Message deleted successfully");
            if (onActionComplete) onActionComplete();
        } catch (error) {
            toast.error("Failed to delete message");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Open pop-up modal and automatically mark as read if unread
    const handleItemClick = async () => {
        setIsDialogOpen(true);
        if (!notification.read) {
            await handleMarkAsRead();
        }
    };

    return (
        <>
            {/* NOTIFICATION ITEM ROW */}
            <div
                className={cn(
                    "flex flex-col gap-2 p-4 border-b transition-colors cursor-pointer hover:bg-muted/10 w-full",
                    notification.read ? "bg-background" : "bg-muted/20"
                )}
                onClick={handleItemClick}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1 shrink-0">
                            {notification.read ? (
                                <MailOpen className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <Mail className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className={cn(
                                "text-sm wrap-break-word line-clamp-1",
                                notification.read ? "text-muted-foreground font-medium" : "text-foreground font-semibold"
                            )}>
                                {notification.title || "No Title"}
                            </div>
                            <p className="text-sm text-muted-foreground wrap-break-word line-clamp-1">
                                {notification.message || "No message contentavailable."}
                            </p>
                            <div className="text-xs text-muted-foreground/80 pt-1">
                                {formattedDate}
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-1 shrink-0">
                        {!notification.read && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleMarkAsRead}
                                disabled={isLoading}
                                title="Mark as read"
                                className="h-8 w-8"
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
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* POP-UP MODAL FOR FULL MESSAGE DETAILS */}
           {/* POP-UP MODAL FOR FULL MESSAGE DETAILS */}
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-112.5 rounded-xl p-4 sm:p-6 gap-4 sm:gap-6 max-h-[85vh] overflow-y-auto mx-auto translate-y-[-50%] top-[50%]">
        <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-primary bg-primary/10 w-fit px-2.5 py-0.5 sm:py-1 rounded-full">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{notification.type?.replace("_", " ").toUpperCase() || "NOTIFICATION"}</span>
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground leading-snug wrap-break-word pt-1">
                {notification.title || "No Title"}
            </DialogTitle>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{formattedDate}</span>
            </div>
        </DialogHeader>

        {/* Full message display body */}
        <div className="text-xs sm:text-sm text-foreground bg-muted/30 p-3 sm:p-4 rounded-lg border max-h-[35vh] overflow-y-auto whitespace-pre-line wrap-break-word leading-relaxed">
            {notification.message || "No message content available."}
        </div>

        <DialogFooter className="flex flex-row sm:justify-end gap-2 pt-2">
            <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
            >
                Close
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
        </>
    );
}