"use client";

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { fetchRecentNotifications } from "@/server/actions/admin-notification-actions";

export function RecentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const result = await fetchRecentNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to load recent notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "sent":
        return "default";
      case "scheduled":
        return "secondary";
      case "recurring_active":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <AppLoadingSkeleton />;
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent notifications
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/admin-notifications/history">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <Badge variant={getStatusBadgeVariant(notification.status)}>
                    {notification.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target:{" "}
                  {notification.target_type === "everyone"
                    ? "Everyone"
                    : notification.target_type === "department"
                      ? notification.department_name
                      : notification.role_name}
                  {notification.sent_count > 0 &&
                    ` • ${notification.sent_count} recipient(s)`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.sent_at
                    ? `Sent: ${formatDate(notification.sent_at)}`
                    : `Created: ${formatDate(notification.created_at)}`}
                </p>
              </div>
              <Link href={`/admin-notifications/${notification.id}`}>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
