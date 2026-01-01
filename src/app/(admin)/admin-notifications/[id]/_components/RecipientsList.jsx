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
import { fetchNotificationRecipients } from "@/server/actions/admin-notification-actions";

export function RecipientsList({ notificationId }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipients();
  }, [notificationId]);

  const loadRecipients = async () => {
    try {
      const result = await fetchNotificationRecipients(notificationId, {
        limit: 50,
      });
      if (result.success) {
        setRecipients(result.data.recipients);
      }
    } catch (error) {
      console.error("Failed to load recipients:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading recipients...</p>
        </CardContent>
      </Card>
    );
  }

  if (recipients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recipients found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Recipients ({recipients.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivered At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell className="font-medium">
                  {recipient.user_name}
                </TableCell>
                <TableCell>{recipient.user_email}</TableCell>
                <TableCell>{recipient.username || "-"}</TableCell>
                <TableCell>
                  <Badge variant={recipient.read ? "default" : "secondary"}>
                    {recipient.read ? "Read" : "Unread"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(recipient.delivered_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
