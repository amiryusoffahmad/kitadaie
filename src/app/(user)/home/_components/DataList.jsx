'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import { Skeleton } from '@/components/ui/skeleton'

export default function DataList() {
    const { data: session } = useSession()
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id)
    const username = personalData?.username

    return (
        <div>
            <h1 className="text-2xl font-bold pb-6">
                {isLoading ? (
                    <Skeleton className="h-8 w-40" />
                ) : username ? (
                    <>User ID: {username}</>
                ) : (
                    'No username assigned'
                )}
            </h1>
        </div>
    )
}