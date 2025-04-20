'use client'

import { Button } from "@/components/ui/button"
import { Construction } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ComingSoonPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <div className="p-6 bg-blue-100 rounded-full mb-6">
                <Construction className="h-16 w-16 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>

            <p className="text-muted-foreground mb-8 max-w-md">
                We're working hard to bring you something awesome. Stay tuned!
            </p>

            <Button onClick={() => router.push('/home')} className="min-w-[200px]">
                Return to Home
            </Button>
        </div>
    )
} 