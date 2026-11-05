import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Map menu item titles to completion breakdown keys
 */
function getCompletionKey(title) {
    const mapping = {
        'Personal information': 'personal',
        'Education': 'education',
        'Family': 'family',
        'Certification': 'role',
        'Security': 'role'
    }
    return mapping[title] || null
}

/**
 * Get completion badge color
 */
function getBadgeColor(percentage) {
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 76) return 'bg-blue-500'
    if (percentage >= 51) return 'bg-yellow-500'
    if (percentage >= 26) return 'bg-orange-500'
    return 'bg-red-500'
}

export function MenuItem({ item, completion }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(item.href);
    };

    // Get completion percentage for this section
    const completionKey = getCompletionKey(item.title)
    const sectionCompletion = completionKey && completion?.breakdown?.[completionKey]
    const percentage = sectionCompletion?.percentage || 0
    const isComplete = percentage === 100

    return (
        <div>
            <Button
                variant="ghost"
                className="h-auto min-h-14 w-full justify-start rounded-none px-0 py-3 text-left hover:bg-accent/50"
                onClick={handleClick}
            >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {item.icon && React.createElement(item.icon, {
                        width: 20,
                        height: 20,
                    })}
                </div>
                <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.title}</span>
                    {item.description && (
                        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {completion && completionKey && (
                        <div className="flex items-center gap-1.5">
                            {isComplete ? (
                                <CheckCircle2 className="size-4 text-green-600" />
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                                    <div className={cn(
                                        "size-1.5 rounded-full",
                                        getBadgeColor(percentage)
                                    )} />
                                </div>
                            )}
                        </div>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                </div>
            </Button>
            <Separator />
        </div>
    );
}