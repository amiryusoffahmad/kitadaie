"use client";

import { useState, useEffect } from "react";
import { createRoleAction, updateRoleAction } from "@/server/actions/organizational-actions";
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

export function RoleDialog({ open, onOpenChange, role }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    telegramGroupId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || "",
        code: role.code || "",
        telegramGroupId: role.telegram_group_id || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        telegramGroupId: "",
      });
    }
  }, [role, open]);

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
      if (role) {
        result = await updateRoleAction(role.id, data);
      } else {
        result = await createRoleAction(data);
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
              {role ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {role
                ? "Update role information"
                : "Add a new role to the organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Kader"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Role Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g., kader"
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
                Optional: Chat ID for role Telegram group (include negative sign for groups)
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
              {isSubmitting ? "Saving..." : role ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
