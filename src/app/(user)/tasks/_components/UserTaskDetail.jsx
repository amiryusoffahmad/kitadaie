"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTaskDetails, markMyTaskComplete, unmarkMyTaskComplete } from "@/server/actions/task-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STATUS_CONFIG = {
  pending: { icon: Circle, color: "text-yellow-600", label: "Pending" },
  in_progress: { icon: Clock, color: "text-blue-600", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
};

export function UserTaskDetail({ taskId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showUncompleteDialog, setShowUncompleteDialog] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const result = await getTaskDetails(taskId);
      if (result.success) {
        setTask(result.data);
      } else {
        toast.error("Task not found");
        router.push("/tasks");
      }
    } catch (error) {
      console.error("Error loading task:", error);
      toast.error("Failed to load task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = () => {
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    try {
      setIsSubmitting(true);
      const result = await markMyTaskComplete({
        taskId,
        notes: notes.trim() || null,
      });

      if (result.success) {
        toast.success(result.message);
        setShowCompleteDialog(false);
        setNotes("");
        loadTask(); // Reload to show updated status
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error marking task complete:", error);
      toast.error("Failed to mark task as complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkIncomplete = () => {
    setShowUncompleteDialog(true);
  };

  const handleConfirmIncomplete = async () => {
    try {
      setIsSubmitting(true);
      const result = await unmarkMyTaskComplete(taskId);

      if (result.success) {
        toast.success(result.message);
        setShowUncompleteDialog(false);
        loadTask(); // Reload to show updated status
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error unmarking task:", error);
      toast.error("Failed to unmark task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Loading task...</div>;
  }

  if (!task) {
    return <div className="text-center py-12 text-muted-foreground">Task not found</div>;
  }

  const StatusIcon = STATUS_CONFIG[task.status].icon;
  const completionPercentage = task.completionStatus?.completion_percentage || 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-sm text-muted-foreground">Task Details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Task Information</CardTitle>
                <CardDescription className="mt-2">
                  {task.description || "No description provided"}
                </CardDescription>
              </div>
              <StatusIcon className={cn("h-6 w-6", STATUS_CONFIG[task.status].color)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Target Date</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {MONTHS[task.target_month - 1]} {task.target_year}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={cn("mt-1", STATUS_CONFIG[task.status].color)}>
                  {STATUS_CONFIG[task.status].label}
                </Badge>
              </div>
            </div>

            {task.training_type && (
              <div>
                <p className="text-sm text-muted-foreground">Training Type</p>
                <Badge variant="outline" className="mt-1">
                  {task.training_type}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {task.completionStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Completion Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {task.completionStatus.total_completed} of {task.completionStatus.total_assigned} users completed
                    </span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {task.userCompleted && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>You have completed this task</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Mark as Complete</CardTitle>
            <CardDescription>
              {task.userCompleted
                ? "You've already completed this task. You can unmark it if needed."
                : "Have you completed this task? Add optional notes and mark it as complete."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!task.userCompleted && (
              <div className="space-y-2">
                <Label htmlFor="notes">Completion Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about completing this task..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-4">
              {task.userCompleted ? (
                <Button
                  variant="outline"
                  onClick={handleMarkIncomplete}
                  disabled={isSubmitting}
                >
                  Unmark as Complete
                </Button>
              ) : (
                <Button
                  onClick={handleMarkComplete}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Task Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Task as Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark <strong>{task.title}</strong> as complete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Mark Complete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unmark Complete Dialog */}
      <AlertDialog open={showUncompleteDialog} onOpenChange={setShowUncompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unmark Task Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unmark this task as complete?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmIncomplete} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Unmark"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
