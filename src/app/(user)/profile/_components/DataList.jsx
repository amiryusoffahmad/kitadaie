'use client'
import { menuData } from "@/lib/menu-data"
import { ProfileSection } from "./ProfileSection"
import { useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { usePersonalData } from '@/app/api/profile/user-api'

export default function DataList() {
    const { data: session } = useSession()

    // Fetch user profile data using the proper hook
    const { data: personalData } = usePersonalData(session?.user?.id)

    // Get first name from personal data or fallback to display name
    const firstName = personalData?.first_name || session?.user?.name?.split(' ')[0] || 'User'

    return (
        <div className="flex flex-col">
            <main className="flex-1 flex flex-col">
                <h1 className="text-2xl font-bold pb-6">{firstName}</h1>
                <div className="grid grid-cols-2 gap-3 min-h-[170px] pb-12">
                    <div className="bg-secondary rounded-[7px]"></div>
                    <div className="bg-secondary rounded-[7px]"></div>
                </div>
                {menuData.map((section, index) => (
                    <ProfileSection key={section.title} section={section} />
                ))}
            </main>
        </div>
    )
}