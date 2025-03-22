import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React from "react";

export function MenuItem({ item }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(item.href);
    };

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
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Separator />
                </div>
            </Button>
        </div>
    );
}