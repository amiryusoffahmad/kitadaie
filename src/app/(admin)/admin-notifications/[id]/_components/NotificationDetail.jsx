"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, XCircle, Trash2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  fetchAdminNotificationById,
  cancelAdminNotificationAction,
  deleteAdminNotificationAction,
  resendNotificationAction,
  fetchNotificationReadStats,
} from "@/server/actions/admin-notification-actions";
import { RecipientsList } from "./RecipientsList";
import { RecurrenceLog } from "./RecurrenceLog";

export function NotificationDetail({ notificationId }) {
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [readStats, setReadStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadNotification();
  }, [notificationId]);

  const loadNotification = async () => {
    setLoading(true);
    try {
      const result = await fetchAdminNotificationById(parseInt(notificationId));
      if (result.success) {
        setNotification(result.data);

        // Load read stats if sent
        if (result.data.status === "sent") {
          const statsResult = await fetchNotificationReadStats(
            parseInt(notificationId)
          );
          if (statsResult.success) {
            setReadStats(statsResult.data);
          }
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to load notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const result = await cancelAdminNotificationAction(
        parseInt(notificationId)
      );
      if (result.success) {
        toast.success(result.message);
        loadNotification();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to cancel notification");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setCancelDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const result = await deleteAdminNotificationAction(
        parseInt(notificationId)
      );
      if (result.success) {
        toast.success(result.message);
        router.push("/admin-notifications/history");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleResend = async () => {
    setIsProcessing(true);
    try {
      const result = await resendNotificationAction(parseInt(notificationId));
      if (result.success) {
        toast.success(result.message);
        router.push("/admin-notifications/history");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to resend notification");
      console.error(error);
    } finally {
      setIsProcessing(false);
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
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          Notification not found
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const canCancel = ["scheduled", "recurring_active"].includes(
    notification.status
  );
  const canDelete = ["draft", "cancelled"].includes(notification.status);
  const canResend = notification.status === "sent";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {canResend && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isProcessing}
            >
              <Send className="mr-2 h-4 w-4" />
              Resend
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{notification.title}</CardTitle>
            <Badge variant={getStatusBadgeVariant(notification.status)}>
              {notification.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Message</p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Target Audience
              </p>
              <p className="mt-1 text-sm">
                {notification.target_type === "everyone"
                  ? "Everyone"
                  : notification.target_type === "department"
                    ? `Department: ${notification.department_name} (${notification.department_code})`
                    : `Role: ${notification.role_name} (${notification.role_code})`}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Schedule Type
              </p>
              <p className="mt-1 text-sm capitalize">
                {notification.schedule_type.replace("_", " ")}
              </p>
            </div>

            {notification.sent_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sent At
                </p>
                <p className="mt-1 text-sm">{formatDate(notification.sent_at)}</p>
              </div>
            )}

            {notification.scheduled_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scheduled For
                </p>
                <p className="mt-1 text-sm">
                  {formatDate(notification.scheduled_at)}
                </p>
              </div>
            )}

            {notification.sent_count > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recipients
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {notification.sent_count}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created By
              </p>
              <p className="mt-1 text-sm">{notification.creator_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="mt-1 text-sm">
                {formatDate(notification.created_at)}
              </p>
            </div>

            {notification.template_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Template Used
                </p>
                <p className="mt-1 text-sm">{notification.template_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {readStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Read Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Recipients
                </p>
                <p className="text-2xl font-bold">{readStats.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Read
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {readStats.read}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Read Rate
                </p>
                <p className="text-2xl font-bold">{readStats.readPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {notification.status === "sent" && (
        <RecipientsList notificationId={parseInt(notificationId)} />
      )}

      {notification.schedule_type === "recurring" && (
        <RecurrenceLog notificationId={parseInt(notificationId)} />
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Yes, Delete It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
