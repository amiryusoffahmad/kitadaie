"use client";

import { useOffline } from "@/hooks/use-offline";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const isOffline = useOffline();

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-5 z-50">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You are offline</span>
        </div>
    );
} 