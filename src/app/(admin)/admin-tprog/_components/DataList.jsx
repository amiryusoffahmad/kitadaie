'use client'

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function DataList() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium mb-2">Training Program Coming Soon</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          We're working hard to bring you something awesome. Stay tuned!
        </p>
      </CardContent>
    </Card>
  );
}