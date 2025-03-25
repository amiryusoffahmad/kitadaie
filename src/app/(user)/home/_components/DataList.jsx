'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'

export default function DataList() {
    const { data: session } = useSession()
    const { data: personalData } = usePersonalData(session?.user?.id)
    const username = personalData?.username

    return (
        <h1 className="text-2xl font-bold pb-6">User ID : {username}</h1>
    )
}