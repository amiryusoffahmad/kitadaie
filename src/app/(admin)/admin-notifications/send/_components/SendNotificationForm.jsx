"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createAdminNotificationAction } from "@/server/actions/admin-notification-actions";
import { TemplateSelector } from "./TemplateSelector";
import { TargetSelector } from "./TargetSelector";
import { ScheduleSelector } from "./ScheduleSelector";
import { RecipientPreview } from "./RecipientPreview";

export function SendNotificationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    actionUrl: "",
    targetType: "everyone",
    targetDepartmentId: null,
    targetRoleId: null,
    targetUserIds: [],
    scheduleType: "immediate",
    scheduledAt: null,
    recurrencePattern: null,
    recurrenceConfig: null,
    templateId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");

  const handleTemplateSelect = (template) => {
    if (template) {
      setFormData({
        ...formData,
        title: template.title,
        message: template.message,
        templateId: template.id,
      });
      toast.success("Template loaded");
    }
  };

  const handleTargetChange = (targetData) => {
    setFormData({
      ...formData,
      targetType: targetData.targetType,
      targetDepartmentId: targetData.targetDepartmentId,
      targetRoleId: targetData.targetRoleId,
      targetUserIds: targetData.targetUserIds || [],
    });
  };

  const handleScheduleChange = (scheduleData) => {
    setFormData({
      ...formData,
      scheduleType: scheduleData.scheduleType,
      scheduledAt: scheduleData.scheduledAt,
      recurrencePattern: scheduleData.recurrencePattern,
      recurrenceConfig: scheduleData.recurrenceConfig,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      setActiveTab("compose");
      return false;
    }

    if (!formData.message.trim()) {
      toast.error("Message is required");
      setActiveTab("compose");
      return false;
    }

    if (formData.targetType === "department" && !formData.targetDepartmentId) {
      toast.error("Please select a department");
      setActiveTab("target");
      return false;
    }

    if (formData.targetType === "role" && !formData.targetRoleId) {
      toast.error("Please select a role");
      setActiveTab("target");
      return false;
    }

    if (formData.targetType === "specific_users" && formData.targetUserIds.length === 0) {
      toast.error("Please select at least one user");
      setActiveTab("target");
      return false;
    }

    if (formData.scheduleType === "scheduled" && !formData.scheduledAt) {
      toast.error("Please select a date and time for scheduled notification");
      setActiveTab("schedule");
      return false;
    }

    if (formData.scheduleType === "recurring") {
      if (!formData.recurrencePattern) {
        toast.error("Please select a recurrence pattern");
        setActiveTab("schedule");
        return false;
      }
      if (!formData.recurrenceConfig) {
        toast.error("Please configure recurrence settings");
        setActiveTab("schedule");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAdminNotificationAction(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin-notifications");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while creating notification");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="target">Target</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4 mt-4">
              <TemplateSelector onSelect={handleTemplateSelect} />

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  maxLength={255}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Plain text only (no formatting)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action-url">
                  Action URL (Optional)
                </Label>
                <Input
                  id="action-url"
                  placeholder="e.g., /tasks/123 or /home"
                  value={formData.actionUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, actionUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  When users click the notification, they will be redirected to this URL. Leave empty for default behavior.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("target")}>
                  Next: Target Audience
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="target" className="mt-4">
              <TargetSelector
                value={{
                  targetType: formData.targetType,
                  targetDepartmentId: formData.targetDepartmentId,
                  targetRoleId: formData.targetRoleId,
                  targetUserIds: formData.targetUserIds,
                }}
                onChange={handleTargetChange}
              />

              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("compose")}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("schedule")}>
                  Next: Schedule
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <ScheduleSelector
                value={{
                  scheduleType: formData.scheduleType,
                  scheduledAt: formData.scheduledAt,
                  recurrencePattern: formData.recurrencePattern,
                  recurrenceConfig: formData.recurrenceConfig,
                }}
                onChange={handleScheduleChange}
              />

              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("target")}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("preview")}>
                  Next: Preview
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notification Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Title
                      </Label>
                      <p className="font-medium">{formData.title || "No title"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Message
                      </Label>
                      <p className="text-sm whitespace-pre-wrap">
                        {formData.message || "No message"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <RecipientPreview
                  targetType={formData.targetType}
                  targetDepartmentId={formData.targetDepartmentId}
                  targetRoleId={formData.targetRoleId}
                  targetUserIds={formData.targetUserIds}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {formData.scheduleType === "immediate" && (
                        <>Send immediately upon submission</>
                      )}
                      {formData.scheduleType === "scheduled" && (
                        <>
                          Scheduled for:{" "}
                          {formData.scheduledAt
                            ? new Date(formData.scheduledAt).toLocaleString()
                            : "Not set"}
                        </>
                      )}
                      {formData.scheduleType === "recurring" && (
                        <>
                          Recurring: {formData.recurrencePattern || "Not configured"}
                        </>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("schedule")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Processing..."
                      : formData.scheduleType === "immediate"
                        ? "Send Now"
                        : formData.scheduleType === "scheduled"
                          ? "Schedule Notification"
                          : "Create Recurring Notification"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
}
