"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellRing } from "lucide-react";
import { useNotifications } from "@/providers/notification-provider";
import {
    getNotificationPermission,
    isNotificationSupported,
} from "@/lib/browser-notifications";
import { toast } from "sonner";

/**
 * Button component to manage browser notification permissions
 */
export function NotificationPermissionButton() {
    const { notificationsEnabled, requestNotificationPermission } = useNotifications();
    const [permission, setPermission] = useState("default");
    const [isRequesting, setIsRequesting] = useState(false);

    // Check current permission on mount
    useEffect(() => {
        if (isNotificationSupported()) {
            setPermission(getNotificationPermission());
        }
    }, [notificationsEnabled]);

    const handleEnableNotifications = async () => {
        setIsRequesting(true);
        try {
            const granted = await requestNotificationPermission();
            if (granted) {
                setPermission("granted");
                toast.success("Browser notifications enabled!");
            } else {
                toast.error("Notification permission denied. Please enable it in your browser settings.");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            toast.error("Failed to request notification permission");
        } finally {
            setIsRequesting(false);
        }
    };

    // Don't show if notifications are not supported
    if (!isNotificationSupported()) {
        return null;
    }

    // Show different UI based on permission status
    if (permission === "granted") {
        return (
            <Button
                variant="ghost"
                size="sm"
                disabled
                className="gap-2"
            >
                <BellRing className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Notifications On</span>
            </Button>
        );
    }

    if (permission === "denied") {
        return (
            <Button
                variant="ghost"
                size="sm"
                disabled
                className="gap-2"
            >
                <BellOff className="h-4 w-4 text-red-600" />
                <span className="text-xs text-muted-foreground">Notifications Blocked</span>
            </Button>
        );
    }

    // Default state - show enable button
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="gap-2"
        >
            <Bell className="h-4 w-4" />
            {isRequesting ? "Requesting..." : "Enable Notifications"}
        </Button>
    );
}
