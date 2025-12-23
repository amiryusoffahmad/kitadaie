import { Suspense } from "react";
import { AssignmentsList } from "./_components/AssignmentsList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "User Assignments | Admin",
  description: "Manage user role and department assignments",
};

export default function AssignmentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Assign users to organizational roles and departments
          </p>
        </div>
      </div>

      <Suspense fallback={<AssignmentsListSkeleton />}>
        <AssignmentsList />
      </Suspense>
    </div>
  );
}

function AssignmentsListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
