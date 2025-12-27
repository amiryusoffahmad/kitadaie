'use client'
import { menuData } from "@/lib/menu-data"
import { ProfileSection } from "./ProfileSection"
import { useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { usePersonalData } from '@/app/api/profile/user-api'
import { CompletionWidget, SectionBreakdownWidget } from './CompletionWidget'
import { getProfileCompletion } from '@/server/actions/profile-completion'

export default function DataList() {
    const { data: session } = useSession()

    // Fetch user profile data using the proper hook
    const { data: personalData } = usePersonalData(session?.user?.id)

    // Fetch profile completion data
    const { data: completion, isLoading: isLoadingCompletion } = useQuery({
        queryKey: ['profile-completion', session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return null
            return await getProfileCompletion(session.user.id)
        },
        enabled: !!session?.user?.id,
        staleTime: 0, // Always fetch fresh data
        refetchOnMount: true, // Refetch when component mounts
    })

    // Get first name from personal data or fallback to display name
    const firstName = personalData?.first_name || session?.user?.name?.split(' ')[0] || 'User'

    return (
        <div className="flex flex-col">
            <main className="flex-1 flex flex-col">
                <h1 className="text-2xl font-bold pb-6">{firstName}</h1>

                {/* Profile Sections */}
                {menuData.map((section, index) => (
                    <ProfileSection
                        key={section.title}
                        section={section}
                        completion={completion}
                    />
                ))}
            </main>
        </div>
    )
}