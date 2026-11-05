"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationPermissionButton } from "@/components/notifications/notification-permission-button";
import { useNotifications } from "@/providers/notification-provider";
import { showBrowserNotification } from "@/lib/browser-notifications";
import { Bell, TestTube, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageBackButton from "@/components/page-back-button";

export default function NotificationSettingsPage() {
    const { notificationsEnabled, unreadCount } = useNotifications();
    const [testSent, setTestSent] = useState(false);

    const handleTestNotification = () => {
        if (!notificationsEnabled) {
            toast.error("Please enable browser notifications first");
            return;
        }

        const notification = showBrowserNotification({
            title: "Test Notification",
            body: "This is a test notification from Kita Daie! If you can see this, notifications are working correctly.",
            onClick: () => {
                if (typeof window !== "undefined") {
                    window.focus();
                    toast.success("Notification clicked!");
                }
            },
        });

        if (notification) {
            setTestSent(true);
            toast.success("Test notification sent! Check your notifications.");
            setTimeout(() => setTestSent(false), 5000);
        } else {
            toast.error("Failed to send test notification. Please check your browser settings.");
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div>
                <PageBackButton />
                <h1 className="text-2xl font-bold">Notification Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your browser notification preferences
                </p>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                    Browser notifications will popup on your screen when you receive new task reminders
                    or other important updates, even when you're not actively using the app.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Browser Notifications
                    </CardTitle>
                    <CardDescription>
                        Enable browser notifications to receive popup alerts for new tasks and reminders
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium">Notification Status</p>
                            <p className="text-sm text-muted-foreground">
                                {notificationsEnabled
                                    ? "Browser notifications are enabled"
                                    : "Browser notifications are disabled"}
                            </p>
                        </div>
                        <NotificationPermissionButton />
                    </div>

                    {notificationsEnabled && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>You will receive browser popups for new notifications</span>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">Test Notifications</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Send a test notification to make sure everything is working correctly
                        </p>
                        <Button
                            onClick={handleTestNotification}
                            disabled={!notificationsEnabled || testSent}
                            variant="outline"
                            className="gap-2"
                        >
                            <TestTube className="h-4 w-4" />
                            {testSent ? "Test Sent!" : "Send Test Notification"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Statistics</CardTitle>
                    <CardDescription>Your notification overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                            <span className="text-sm">Unread Notifications</span>
                            <span className="font-bold">{unreadCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                            <span className="text-sm">Browser Notifications</span>
                            <span className="font-bold">
                                {notificationsEnabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!notificationsEnabled && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Enable Notifications</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">
                            To receive browser notification popups, click the "Enable Notifications" button above.
                        </p>
                        <p className="text-xs">
                            If you accidentally blocked notifications, you'll need to manually enable them in your
                            browser settings:
                        </p>
                        <ul className="text-xs mt-2 ml-4 list-disc space-y-1">
                            <li>Chrome/Edge: Click the lock icon in the address bar → Site settings → Notifications</li>
                            <li>Firefox: Click the lock icon → More information → Permissions → Notifications</li>
                            <li>Safari: Safari menu → Settings for This Website → Notifications</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
