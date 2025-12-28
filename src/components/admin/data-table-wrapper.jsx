import { cn } from "@/lib/utils";

/**
 * Standard wrapper for tables in admin pages
 * Provides consistent border and styling
 */
export function DataTableWrapper({ children, className }) {
  return (
    <div className={cn("rounded-lg border bg-background shadow-sm", className)}>
      {children}
    </div>
  );
}
