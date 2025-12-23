import { Suspense } from "react";
import { UserTasksList } from "./_components/UserTasksList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "My Tasks | Kita Daie",
  description: "View your assigned organizational tasks",
};

export default function UserTasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your assigned tasks
        </p>
      </div>

      <Suspense fallback={<TasksListSkeleton />}>
        <UserTasksList />
      </Suspense>
    </div>
  );
}

function TasksListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
