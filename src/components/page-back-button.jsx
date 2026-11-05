'use client'

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PageBackButton() {
    const router = useRouter()

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            onClick={() => router.back()}
        >
            <ArrowLeft className="size-4" />
            Back
        </Button>
    )
}