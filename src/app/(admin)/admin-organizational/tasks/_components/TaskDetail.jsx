"use client";

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createOrganizationalTask,
  updateOrganizationalTask,
  getTaskDetails,
  assignTask,
  createTaskReminders,
  updateTaskReminder,
  deleteTaskReminder,
  removeTaskAssignment,
} from "@/server/actions/task-actions";
import { fetchRoles, fetchDepartments } from "@/server/actions/organizational-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function TaskDetail({ taskId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(!!taskId);
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState(null);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainingType: "",
    targetMonth: new Date().getMonth() + 1,
    targetYear: new Date().getFullYear(),
    status: "pending",
  });

  const [assignments, setAssignments] = useState([]);
  const [originalAssignments, setOriginalAssignments] = useState([]); // Track original assignments for comparison
  const [reminders, setReminders] = useState([
    { id: null, daysBefore: 7 },
    { id: null, daysBefore: 3 },
    { id: null, daysBefore: 0 },
  ]); // Default: 7 days before, 3 days before, on the day
  const [originalReminders, setOriginalReminders] = useState([]); // Track original reminders for comparison

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load roles and departments
      const [rolesResult, deptResult] = await Promise.all([
        fetchRoles(),
        fetchDepartments(),
      ]);

      if (rolesResult.success) setRoles(rolesResult.data);
      if (deptResult.success) setDepartments(deptResult.data);

      // If editing, load task
      if (taskId) {
        const result = await getTaskDetails(taskId);
        if (result.success) {
          const taskData = result.data;
          setTask(taskData);
          setFormData({
            title: taskData.title,
            description: taskData.description || "",
            trainingType: taskData.training_type || "",
            targetMonth: taskData.target_month,
            targetYear: taskData.target_year,
            status: taskData.status,
          });

          // Set existing assignments
          if (taskData.assignments && taskData.assignments.length > 0) {
            const loadedAssignments = taskData.assignments.map((a) => ({
              id: a.id,
              roleId: a.role_id,
              departmentId: a.department_id,
            }));
            setAssignments(loadedAssignments);
            setOriginalAssignments(JSON.parse(JSON.stringify(loadedAssignments))); // Deep copy
          }

          // Set existing reminders
          if (taskData.reminders && taskData.reminders.length > 0) {
            const loadedReminders = taskData.reminders.map((r) => ({
              id: r.id,
              daysBefore: r.days_before,
            }));
            setReminders(loadedReminders);
            setOriginalReminders(JSON.parse(JSON.stringify(loadedReminders))); // Deep copy
          }
        } else {
          toast.error("Task not found");
          router.push("/admin-organizational/tasks");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const syncAssignments = async (taskId) => {
    try {
      // Find assignments to create and delete
      // Note: We don't update assignments, we delete old ones and create new ones
      const toCreate = [];
      const toDelete = [];

      // Check current assignments
      assignments.forEach((assignment) => {
        if (!assignment.id) {
          // New assignment without ID
          toCreate.push(assignment);
        } else {
          // Existing assignment - check if it was modified
          const original = originalAssignments.find((a) => a.id === assignment.id);
          if (
            original &&
            (original.roleId !== assignment.roleId ||
              original.departmentId !== assignment.departmentId)
          ) {
            // Assignment changed - delete old and create new
            toDelete.push(original);
            toCreate.push({ roleId: assignment.roleId, departmentId: assignment.departmentId });
          }
        }
      });

      // Check for deleted assignments
      originalAssignments.forEach((original) => {
        const stillExists = assignments.find((a) => a.id === original.id);
        if (!stillExists) {
          toDelete.push(original);
        }
      });

      // Execute deletes
      for (const assignment of toDelete) {
        const result = await removeTaskAssignment(assignment.id);
        if (!result.success) {
          console.error("Failed to delete assignment:", result.message);
        }
      }

      // Execute creates
      if (toCreate.length > 0) {
        const result = await assignTask({
          taskId,
          assignments: toCreate,
        });
        if (!result.success) {
          console.error("Failed to create assignments:", result.message);
        }
      }
    } catch (error) {
      console.error("Error syncing assignments:", error);
      throw error;
    }
  };

  const syncReminders = async (taskId) => {
    try {
      // Find reminders to update, create, and delete
      const toUpdate = [];
      const toCreate = [];
      const toDelete = [];

      // Check current reminders
      reminders.forEach((reminder) => {
        if (reminder.id) {
          // Existing reminder - check if it changed
          const original = originalReminders.find((r) => r.id === reminder.id);
          if (original && original.daysBefore !== reminder.daysBefore) {
            toUpdate.push(reminder);
          }
        } else {
          // New reminder without ID
          toCreate.push(reminder);
        }
      });

      // Check for deleted reminders
      originalReminders.forEach((original) => {
        const stillExists = reminders.find((r) => r.id === original.id);
        if (!stillExists) {
          toDelete.push(original);
        }
      });

      // Execute updates
      for (const reminder of toUpdate) {
        const result = await updateTaskReminder(reminder.id, {
          daysBefore: reminder.daysBefore,
        });
        if (!result.success) {
          console.error("Failed to update reminder:", result.message);
        }
      }

      // Execute creates
      if (toCreate.length > 0) {
        const remindersData = toCreate.map((r) => ({ daysBefore: r.daysBefore }));
        const result = await createTaskReminders({
          taskId,
          reminders: remindersData,
        });
        if (!result.success) {
          console.error("Failed to create reminders:", result.message);
        }
      }

      // Execute deletes
      for (const reminder of toDelete) {
        const result = await deleteTaskReminder(reminder.id);
        if (!result.success) {
          console.error("Failed to delete reminder:", result.message);
        }
      }
    } catch (error) {
      console.error("Error syncing reminders:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setIsSaving(true);

      const data = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        trainingType: formData.trainingType.trim(),
        targetMonth: parseInt(formData.targetMonth),
        targetYear: parseInt(formData.targetYear),
      };

      let result;
      let createdTaskId = taskId;

      if (taskId) {
        // Update existing task
        result = await updateOrganizationalTask(taskId, {
          ...data,
          status: formData.status,
        });
      } else {
        // Create new task
        result = await createOrganizationalTask(data);
        if (result.success) {
          createdTaskId = result.data.id;
        }
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Handle assignments
      if (taskId) {
        // UPDATING existing task - sync assignments
        await syncAssignments(createdTaskId);
      } else {
        // CREATING new task - create all assignments
        if (assignments.length > 0) {
          const assignmentsData = assignments.map((a) => ({
            roleId: a.roleId,
            departmentId: a.departmentId,
          }));
          const assignResult = await assignTask({
            taskId: createdTaskId,
            assignments: assignmentsData,
          });
          if (!assignResult.success) {
            toast.warning("Task saved but assignments failed");
          }
        }
      }

      // Handle reminders
      if (taskId) {
        // UPDATING existing task - sync reminders
        await syncReminders(createdTaskId);
      } else {
        // CREATING new task - create all reminders
        if (reminders.length > 0) {
          const remindersData = reminders.map((r) => ({ daysBefore: r.daysBefore }));
          const reminderResult = await createTaskReminders({
            taskId: createdTaskId,
            reminders: remindersData,
          });
          if (!reminderResult.success) {
            toast.warning("Task saved but reminders failed");
          }
        }
      }

      toast.success(result.message);
      router.push("/admin-organizational/tasks");
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAssignment = () => {
    setAssignments([...assignments, { id: null, roleId: null, departmentId: null }]);
  };

  const handleRemoveAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleAssignmentChange = (index, field, value) => {
    const updated = [...assignments];
    updated[index][field] = value ? parseInt(value) : null;
    setAssignments(updated);
  };

  const handleAddReminder = () => {
    setReminders([...reminders, { id: null, daysBefore: 7 }]);
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleReminderChange = (index, value) => {
    const updated = [...reminders];
    updated[index].daysBefore = parseInt(value);
    setReminders(updated);
  };

  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {taskId ? "Edit Task" : "Create Task"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {taskId ? "Update task details and settings" : "Create a new organizational task with reminders"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
            <CardDescription>Basic details about the task</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Plan a program with community"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the task..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingType">Training Type</Label>
              <Input
                id="trainingType"
                value={formData.trainingType}
                onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                placeholder="e.g., Content Delivery, Responsibility Management"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetMonth">Target Month *</Label>
                <Select
                  value={formData.targetMonth.toString()}
                  onValueChange={(value) => setFormData({ ...formData, targetMonth: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetYear">Target Year *</Label>
                <Input
                  id="targetYear"
                  type="number"
                  value={formData.targetYear}
                  onChange={(e) => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
                  min={new Date().getFullYear()}
                  required
                />
              </div>
            </div>

            {taskId && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Assign this task to roles and/or departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={assignment.id || `new-${index}`} className="flex items-end gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={assignment.roleId?.toString() || "none"}
                    onValueChange={(value) => handleAssignmentChange(index, "roleId", value === "none" ? "" : value)}
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

                <div className="flex-1 space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={assignment.departmentId?.toString() || "none"}
                    onValueChange={(value) => handleAssignmentChange(index, "departmentId", value === "none" ? "" : value)}
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

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAssignment(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={handleAddAssignment} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Configure when reminders should be sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reminders.map((reminder, index) => (
              <div key={reminder.id || `new-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <Input
                    type="number"
                    value={reminder.daysBefore}
                    onChange={(e) => handleReminderChange(index, e.target.value)}
                    min={0}
                    className="w-32"
                  />
                </div>
                <span className="text-sm text-muted-foreground">days before target month</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveReminder(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={handleAddReminder} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : taskId ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
