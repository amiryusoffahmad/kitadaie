'use client'
import { menuData } from "@/lib/menu-data"
import { ProfileSection } from "./ProfileSection"
import { signOut, useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { usePersonalData } from '@/app/api/profile/user-api'
import { getProfileCompletion } from '@/server/actions/profile-completion'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Pencil } from "lucide-react"

export default function DataList() {
    const router = useRouter()
    const { data: session } = useSession()

    // Fetch user profile data using the proper hook
    const { data: personalData } = usePersonalData(session?.user?.id)

    // Fetch profile completion data
    const { data: completion } = useQuery({
        queryKey: ['profile-completion', session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return null
            return await getProfileCompletion(session.user.id)
        },
        enabled: !!session?.user?.id,
        staleTime: 0, // Always fetch fresh data
        refetchOnMount: true, // Refetch when component mounts
    })

    const displayName = [
        personalData?.first_name,
        personalData?.last_name,
    ].filter(Boolean).join(" ") || session?.user?.name || "User"
    const memberId = personalData?.username || session?.user?.id
    const createdAt = session?.user?.createdAt
    const memberSince = createdAt && !Number.isNaN(new Date(createdAt).getTime())
        ? new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date(createdAt))
        : null

    return (
        <main className="flex flex-col gap-5 pb-4">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <p className="text-sm text-slate-500">Your profile</p>
                <h1 className="mt-1 text-page-title tracking-tight text-slate-900">{displayName}</h1>
                {session?.user?.email && (
                    <p className="mt-1 break-all text-sm text-slate-500">
                        {session.user.email}
                    </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/profile/personal")}
                    >
                        <Pencil className="text-slate-500" />
                        Edit profile
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            await signOut({
                                fetchOptions: {
                                    onSuccess: () => router.replace("/sign-in"),
                                },
                            })
                        }}
                    >
                        <LogOut className="text-slate-500" />
                        Sign out
                    </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {memberId && <span>Member ID: {memberId}</span>}
                    {memberSince && <span>Member since {memberSince}</span>}
                </div>
            </section>

            {menuData.map((section) => (
                <ProfileSection
                    key={section.title}
                    section={section}
                    completion={completion}
                />
            ))}
        </main>
    )
}