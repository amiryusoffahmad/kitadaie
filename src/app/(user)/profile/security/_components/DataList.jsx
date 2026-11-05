'use client'

import PageBackButton from "@/components/page-back-button"

export default function DataList() {
    return (
        <div className="space-y-4">
            <PageBackButton />
            <div className="text-center py-10 text-muted-foreground">
                Security<br></br>
                <span className="text-sm">
                    We’re working hard to bring you something awesome. Stay tuned!
                </span>
            </div>
        </div>
    )
}