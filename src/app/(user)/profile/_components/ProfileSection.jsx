"use client";

import { MenuItem } from "./MenuItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ProfileSection({ section, completion }) {
    if (!section || !section.title || !Array.isArray(section.items)) {
        console.error("Invalid section data:", section);
        return null;
    }

    return (
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-100 py-0 shadow-none">
            <CardHeader className="px-4 py-4">
                <CardTitle className="text-sm font-medium text-slate-500">{section.title}</CardTitle>
            </CardHeader>
            <Separator className="bg-slate-100" />
            <CardContent className="px-4 py-1">
                {section.items.map((item) => (
                    <MenuItem
                        key={item.title}
                        item={item}
                        completion={completion}
                    />
                ))}
            </CardContent>
        </Card>
    );
}