"use client";

import { useState, useEffect } from "react";
import { assignUserAction } from "@/server/actions/organizational-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function AssignmentDialog({ open, onOpenChange, roles, departments }) {
  const [formData, setFormData] = useState({
    userId: "",
    roleId: "none",
    departmentId: "none",
  });
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({ userId: "", roleId: "none", departmentId: "none" });
      setUserSearch("");
      setUsers([]);
    }
  }, [open]);

  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      setIsSearching(true);
      // Simple client-side search - in production, this should be a server action
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) {
        searchUsers(userSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      toast.error("Please select a user");
      return;
    }

    if ((!formData.roleId || formData.roleId === "none") && (!formData.departmentId || formData.departmentId === "none")) {
      toast.error("Please select at least a role or department");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        userId: formData.userId,
        roleId: formData.roleId && formData.roleId !== "none" ? parseInt(formData.roleId) : null,
        departmentId: formData.departmentId && formData.departmentId !== "none" ? parseInt(formData.departmentId) : null,
      };

      const result = await assignUserAction(data);

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

  const handleUserSelect = (userId, userName) => {
    setFormData((prev) => ({ ...prev, userId }));
    setUserSearch(userName);
    setUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>
              Assign a user to an organizational role and/or department
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userSearch">Search User *</Label>
              <Input
                id="userSearch"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Type name or email..."
                required
              />
              {isSearching && (
                <p className="text-xs text-muted-foreground">Searching...</p>
              )}
              {users.length > 0 && (
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => handleUserSelect(user.id, user.name)}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select
                value={formData.roleId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, roleId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={formData.departmentId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, departmentId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              * At least one of Role or Department must be selected
            </p>
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
            <Button type="submit" disabled={isSubmitting || !formData.userId}>
              {isSubmitting ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
