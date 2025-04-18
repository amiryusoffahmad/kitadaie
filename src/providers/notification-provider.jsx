"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchUnreadCount } from "@/server/actions/notification-actions";

// Create context
const NotificationContext = createContext({
    unreadCount: 0,
    refreshUnreadCount: () => { },
    isLoading: false,
});

// Custom hook to use notification context
export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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

    // Initial fetch and set up polling
    useEffect(() => {
        // Fetch unread count on mount
        refreshUnreadCount();

        // Set up polling every 30 seconds
        const intervalId = setInterval(() => {
            refreshUnreadCount();
        }, 30000);

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    // Create context value
    const value = {
        unreadCount,
        refreshUnreadCount,
        isLoading,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
} 