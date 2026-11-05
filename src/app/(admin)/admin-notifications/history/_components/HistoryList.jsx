"use client";

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTableWrapper, EmptyState } from "@/components/admin";
import { History, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchNotificationHistory } from "@/server/actions/admin-notification-actions";

export function HistoryList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, [statusFilter, targetFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const filters = {};

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      if (targetFilter !== "all") {
        filters.targetType = targetFilter;
      }

      const result = await fetchNotificationHistory(filters);
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
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
      case "cancelled":
        return "destructive";
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

  const getTargetDisplay = (notification) => {
    if (notification.target_type === "everyone") {
      return "Everyone";
    }
    if (notification.target_type === "department") {
      return `Dept: ${notification.department_name || "Unknown"}`;
    }
    if (notification.target_type === "role") {
      return `Role: ${notification.role_name || "Unknown"}`;
    }
    return "Unknown";
  };

  if (loading) {
    return <AppLoadingSkeleton />;
  }

  if (notifications.length === 0 && statusFilter === "all" && targetFilter === "all") {
    return (
      <EmptyState
        icon={History}
        title="No notifications yet"
        description="Sent and scheduled notifications will appear here"
      />
    );
  }

  return (
    <>
      <div className="flex gap-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="recurring_active">Recurring Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetFilter} onValueChange={setTargetFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by target" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            <SelectItem value="everyone">Everyone</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="role">Role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={History}
          title="No matching notifications"
          description="Try adjusting your filters"
        />
      ) : (
        <DataTableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {notification.title}
                  </TableCell>
                  <TableCell>{getTargetDisplay(notification)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(notification.status)}>
                      {notification.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {notification.sent_count > 0
                      ? notification.sent_count
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {notification.sent_at
                      ? formatDate(notification.sent_at)
                      : notification.scheduled_at
                        ? `Scheduled: ${formatDate(notification.scheduled_at)}`
                        : formatDate(notification.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/admin-notifications/${notification.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableWrapper>
      )}
    </>
  );
}
