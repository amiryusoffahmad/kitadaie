"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    const handleInstallClick = () => {
        // Hide the app provided prompt
        setShowPrompt(false);

        if (!deferredPrompt) {
            return;
        }

        // Show the browser install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
            } else {
                console.log("User dismissed the install prompt");
            }
            // Clear the saved prompt since it can't be used again
            setDeferredPrompt(null);
        });
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-xs">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Install Application</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                        Install Kita Daie on your device for quick access and offline
                        capabilities.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={handleInstallClick}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Install
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                        >
                            Later
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 