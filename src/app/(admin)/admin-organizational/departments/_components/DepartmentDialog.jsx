"use client";

import { useState, useEffect } from "react";
import { createDepartmentAction, updateDepartmentAction } from "@/server/actions/organizational-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DepartmentDialog({ open, onOpenChange, department }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    telegramGroupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        telegramGroupId: department.telegram_group_id || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        telegramGroupId: "",
      });
    }
  }, [department, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        telegramGroupId: formData.telegramGroupId.trim() || null,
      };

      let result;
      if (department) {
        result = await updateDepartmentAction(department.id, data);
      } else {
        result = await createDepartmentAction(data);
      }

      if (result.success) {
        toast.success(result.message);
        onOpenChange(true); // Pass true to refresh
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {department ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              {department
                ? "Update department information"
                : "Add a new department to the organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Unit A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Department Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g., unit-a"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, use hyphens)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramGroupId">Telegram Group ID</Label>
              <Input
                id="telegramGroupId"
                value={formData.telegramGroupId}
                onChange={(e) => handleChange("telegramGroupId", e.target.value)}
                placeholder="e.g., -1001234567890"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Chat ID for department Telegram group (include negative sign for groups)
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
              {isSubmitting ? "Saving..." : department ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
