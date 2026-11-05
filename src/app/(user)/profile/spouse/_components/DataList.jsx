'use client'

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import SpouseSelector from '@/components/SpouseSelector'
import { useQueryClient } from '@tanstack/react-query'

export default function DataList() {
    const router = useRouter()
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    // Fetch user profile data
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id)

    const handleUpdate = () => {
        // Invalidate profile completion query to refresh
        queryClient.invalidateQueries({ queryKey: ['profile-completion', session?.user?.id] })
        queryClient.invalidateQueries({ queryKey: ['personalData', session?.user?.id] })
    }

    if (isLoading) {
        return <AppLoadingSkeleton />;
    }

    return (
        <div className="flex flex-col max-w-md mx-auto">
            <div className="flex flex-col items-center w-full">
                <header className="bg-background w-full flex justify-center">
                    <div className="container flex flex-col max-w-md items-start gap-3">
                        <Button
                            variant="ghost"
                            className="p-0"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft style={{ width: "25px", height: "25px", padding: "0" }} />
                        </Button>
                        <h1 className="text-2xl font-bold">Spouse</h1>
                    </div>
                </header>

                <main className="container max-w-md w-full py-4">
                    <SpouseSelector
                        userId={session?.user?.id}
                        currentSpouseId={personalData?.spouse_id}
                        maritalStatus={personalData?.marital_status}
                        onUpdate={handleUpdate}
                    />
                </main>
            </div>
        </div>
    )
}
