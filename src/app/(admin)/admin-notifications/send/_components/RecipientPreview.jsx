"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { getRecipientCountAction } from "@/server/actions/admin-notification-actions";

export function RecipientPreview({
  targetType,
  targetDepartmentId,
  targetRoleId,
}) {
  const [recipientCount, setRecipientCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipientCount();
  }, [targetType, targetDepartmentId, targetRoleId]);

  const loadRecipientCount = async () => {
    setLoading(true);
    try {
      const result = await getRecipientCountAction({
        targetType,
        targetDepartmentId,
        targetRoleId,
      });

      if (result.success) {
        setRecipientCount(result.data.count);
      }
    } catch (error) {
      console.error("Failed to load recipient count:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetDescription = () => {
    if (targetType === "everyone") {
      return "All users";
    }
    if (targetType === "department") {
      return "Users in selected department";
    }
    if (targetType === "role") {
      return "Users with selected role";
    }
    return "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recipients
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Calculating recipients...
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Target:</span> {getTargetDescription()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Estimated recipients:</span>{" "}
              <span className="text-2xl font-bold text-primary">
                {recipientCount}
              </span>{" "}
              {recipientCount === 1 ? "user" : "users"}
            </p>
            {recipientCount === 0 && (
              <p className="text-sm text-destructive">
                Warning: No users match the selected target
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
