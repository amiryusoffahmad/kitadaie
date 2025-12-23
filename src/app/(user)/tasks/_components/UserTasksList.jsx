"use client";

import { useState, useEffect } from "react";
import { getUserOrganizationalTasks } from "@/server/actions/task-actions";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STATUS_CONFIG = {
  pending: {
    icon: Circle,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    label: "Pending"
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    label: "In Progress"
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    label: "Completed"
  },
};

export function UserTasksList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const result = await getUserOrganizationalTasks({
        status: statusFilter !== "all" ? statusFilter : null,
      });
      if (result.success) {
        setTasks(result.data);
      } else {
        toast.error(result.message || "Failed to load tasks");
      }
    } catch (error) {
      toast.error("An error occurred while loading tasks");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const handleTaskClick = (taskId) => {
    router.push(`/tasks/${taskId}`);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              {statusFilter === "all"
                ? "No tasks assigned to you yet."
                : `No ${statusFilter.replace("_", " ")} tasks found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const StatusIcon = STATUS_CONFIG[task.status].icon;
            return (
              <Card
                key={task.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  STATUS_CONFIG[task.status].bg
                )}
                onClick={() => handleTaskClick(task.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {task.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <StatusIcon className={cn("h-5 w-5", STATUS_CONFIG[task.status].color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {MONTHS[task.target_month - 1]} {task.target_year}
                      </span>
                    </div>

                    {task.training_type && (
                      <Badge variant="outline">{task.training_type}</Badge>
                    )}

                    <Badge className={STATUS_CONFIG[task.status].color}>
                      {STATUS_CONFIG[task.status].label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
