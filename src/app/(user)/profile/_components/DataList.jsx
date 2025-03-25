'use client'
import { menuData } from "@/lib/menu-data"
import { ProfileSection } from "./ProfileSection"
import { useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'

export default function DataList() {
    const { data: session } = useSession()

    // Fetch user profile to get first name
    const { data: userProfile } = useQuery({
        queryKey: ['userProfile', session?.user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/users/profile`);
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            return response.json();
        },
        enabled: !!session?.user?.id
    })

    // Get first name or fallback to display name
    const firstName = userProfile?.first_name || session?.user?.name?.split(' ')[0] || 'User';

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 flex flex-col px-5 pt-10">
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