import { cn } from "@/lib/utils";

/**
 * Standard container for admin pages
 * Provides consistent padding and max-width
 */
export function PageContainer({ children, className }) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-6", className)}>
      {children}
    </div>
  );
}
