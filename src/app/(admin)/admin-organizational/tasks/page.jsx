import { Suspense } from "react";
import { TasksList } from "./_components/TasksList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Organizational Tasks | Admin",
  description: "Manage organizational tasks and reminders",
};

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizational Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage tasks with automatic reminders
          </p>
        </div>
      </div>

      <Suspense fallback={<TasksListSkeleton />}>
        <TasksList />
      </Suspense>
    </div>
  );
}

function TasksListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
