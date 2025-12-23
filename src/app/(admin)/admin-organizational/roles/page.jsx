import { Suspense } from "react";
import { RolesList } from "./_components/RolesList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Roles | Admin",
  description: "Manage organizational roles",
};

export default function RolesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizational Roles</h1>
          <p className="text-sm text-muted-foreground">
            Manage organizational roles and Telegram group configurations
          </p>
        </div>
      </div>

      <Suspense fallback={<RolesListSkeleton />}>
        <RolesList />
      </Suspense>
    </div>
  );
}

function RolesListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
