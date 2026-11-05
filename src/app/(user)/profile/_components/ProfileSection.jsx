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
        <Card className="gap-0 overflow-hidden py-0">
            <CardHeader className="px-4 py-4">
                <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <Separator />
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