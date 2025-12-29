"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchRecurrenceLog } from "@/server/actions/admin-notification-actions";

export function RecurrenceLog({ notificationId }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLog();
  }, [notificationId]);

  const loadLog = async () => {
    try {
      const result = await fetchRecurrenceLog(notificationId);
      if (result.success) {
        setLog(result.data);
      }
    } catch (error) {
      console.error("Failed to load recurrence log:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "partial":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recurrence History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  if (log.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recurrence History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No execution history yet. This notification will run according to its
            schedule.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Recurrence History ({log.length} executions)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution Date</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Executed At</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {log.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {new Date(entry.execution_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{entry.sent_count}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(entry.status)}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(entry.executed_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.error_message || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
