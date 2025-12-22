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
                className="w-full items-start h-[38px] px-0 py-0 gap-[18px] hover:bg-transparent"
                onClick={handleClick}
            >
                <div className="flex">
                    {item.icon && React.createElement(item.icon, {
                        width: 18,
                        height: 18,
                        style: { minWidth: '18px', minHeight: '18px' }
                    })}
                </div>
                <div className="w-full">
                    <div className="w-full flex flex-row justify-between pb-[18px]">
                        <span className="text-[15px]">{item.title}</span>
                        <div className="flex items-center gap-2">
                            {/* Completion indicator */}
                            {completion && completionKey && (
                                <div className="flex items-center gap-1.5">
                                    {isComplete ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">{percentage}%</span>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                getBadgeColor(percentage)
                                            )} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                    <Separator />
                </div>
            </Button>
        </div>
    );
}