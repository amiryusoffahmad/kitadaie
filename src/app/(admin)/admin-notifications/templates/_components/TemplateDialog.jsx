"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createTemplateAction,
  updateTemplateAction,
} from "@/server/actions/admin-notification-actions";

export function TemplateDialog({ open, onOpenChange, template }) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        title: template.title || "",
        message: template.message || "",
      });
    } else {
      setFormData({
        name: "",
        title: "",
        message: "",
      });
    }
  }, [template, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error("Template name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.title.trim()) {
        toast.error("Notification title is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.message.trim()) {
        toast.error("Notification message is required");
        setIsSubmitting(false);
        return;
      }

      const result = template
        ? await updateTemplateAction(template.id, formData)
        : await createTemplateAction(formData);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(true); // Pass true to trigger reload
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {template ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Reminder"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                A descriptive name for this template (for your reference only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Notification Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Important Update"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={255}
                required
              />
              <p className="text-xs text-muted-foreground">
                The title users will see in their notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Notification Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Enter the notification message here..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Plain text message (no formatting)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
