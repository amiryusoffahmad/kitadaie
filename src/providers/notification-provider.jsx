"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { fetchUnreadCount, fetchUserNotifications } from "@/server/actions/notification-actions";
import {
    ensureNotificationPermission,
    showNotificationFromData,
    isNotificationSupported,
} from "@/lib/browser-notifications";

// Create context
const NotificationContext = createContext({
    unreadCount: 0,
    refreshUnreadCount: () => { },
    isLoading: false,
    notificationsEnabled: false,
    requestNotificationPermission: async () => false,
});

// Custom hook to use notification context
export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const lastNotificationIdRef = useRef(null);
    const hasInitializedRef = useRef(false);

    // Function to refresh unread count
    const refreshUnreadCount = async () => {
        try {
            setIsLoading(true);
            const count = await fetchUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to check for new notifications and show browser popups
    const checkForNewNotifications = async () => {
        try {
            // Only check if browser notifications are enabled
            if (!notificationsEnabled) return;

            // Fetch recent notifications
            const result = await fetchUserNotifications({ limit: 5 });

            if (!result || !result.notifications || result.notifications.length === 0) {
                return;
            }

            // Get the most recent notification
            const latestNotification = result.notifications[0];

            // If this is the first check, just store the latest ID without showing notification
            if (!hasInitializedRef.current) {
                lastNotificationIdRef.current = latestNotification.id;
                hasInitializedRef.current = true;
                return;
            }

            // Check if there are new notifications
            if (lastNotificationIdRef.current && latestNotification.id > lastNotificationIdRef.current) {
                // Get all new notifications since last check
                const newNotifications = result.notifications.filter(
                    (notif) => notif.id > lastNotificationIdRef.current
                );

                // Show browser notification for each new one (limit to 3 to avoid spam)
                newNotifications.slice(0, 3).forEach((notif) => {
                    showNotificationFromData(notif);
                });

                // Update last notification ID
                lastNotificationIdRef.current = latestNotification.id;
            }
        } catch (error) {
            console.error("Failed to check for new notifications:", error);
        }
    };

    // Request notification permission
    const requestPermission = async () => {
        const granted = await ensureNotificationPermission();
        setNotificationsEnabled(granted);
        return granted;
    };

    // Initialize and set up polling
    useEffect(() => {
        // Check if browser supports notifications
        if (isNotificationSupported()) {
            // Check current permission status
            if (typeof window !== "undefined" && window.Notification) {
                const permission = window.Notification.permission;
                setNotificationsEnabled(permission === "granted");

                // If permission already granted, initialize
                if (permission === "granted") {
                    hasInitializedRef.current = false; // Will be set to true on first check
                }
            }
        }

        // Fetch unread count on mount
        refreshUnreadCount();

        // Set up polling for unread count (every 30 seconds)
        const unreadInterval = setInterval(() => {
            refreshUnreadCount();
        }, 30000);

        // Set up polling for new notifications (every 10 seconds)
        const notificationInterval = setInterval(() => {
            checkForNewNotifications();
        }, 10000);

        // Clean up intervals on unmount
        return () => {
            clearInterval(unreadInterval);
            clearInterval(notificationInterval);
        };
    }, [notificationsEnabled]);

    // Create context value
    const value = {
        unreadCount,
        refreshUnreadCount,
        isLoading,
        notificationsEnabled,
        requestNotificationPermission: requestPermission,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
} 