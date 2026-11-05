import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Standard loading state for admin pages
 */
export function LoadingState({ className }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

/**
 * Simple loading text for inline states
 */
export function LoadingText({ className }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("space-y-3 py-4", className)}
    >
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-5/6" />
    </div>
  );
}
