"use client";

import { Separator } from "@/components/ui/separator";
import { MenuItem } from "./MenuItem";
import React from "react";

export function ProfileSection({ section }) {
    if (!section || !section.title || !Array.isArray(section.items)) {
        console.error("Invalid section data:", section);
        return null;
    }

    return (
        <div className="space-y-2 pb-6">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <Separator />
            <div className="space-y-[18px] pt-4">
                {section.items.map((item) => (
                    <MenuItem key={item.title} item={item} />
                ))}
            </div>
        </div>
    );
}