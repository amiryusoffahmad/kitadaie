import { Suspense } from "react";
import { DepartmentsList } from "./_components/DepartmentsList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Departments | Admin",
  description: "Manage organizational departments",
};

export default function DepartmentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage organizational departments and Telegram group configurations
          </p>
        </div>
      </div>

      <Suspense fallback={<DepartmentsListSkeleton />}>
        <DepartmentsList />
      </Suspense>
    </div>
  );
}

function DepartmentsListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
