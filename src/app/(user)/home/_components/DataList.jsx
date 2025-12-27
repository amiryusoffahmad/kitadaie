'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal, LogOut, UserCircle, GraduationCap, Users, Award, Calendar, Download, AlertCircle, Info } from 'lucide-react'
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import EventCarousel from './EventCarousel';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useQuery } from '@tanstack/react-query'
import { CompletionWidget } from '@/app/(user)/profile/_components/CompletionWidget'
import { getProfileCompletion } from '@/server/actions/profile-completion'

export default function DataList() {
    const { data: session } = useSession()
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id)
    const first_name = personalData?.first_name
    const router = useRouter()

    // Fetch profile completion data
    const { data: completion, isLoading: isLoadingCompletion } = useQuery({
        queryKey: ['profile-completion', session?.user?.id],
        queryFn: async () => {
            if (!session?.user?.id) return null
            return await getProfileCompletion(session.user.id)
        },
        enabled: !!session?.user?.id,
        staleTime: 0,
        refetchOnMount: true,
    })

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">
                {isLoading ? (
                    <Skeleton className="h-8 w-40" />
                ) : first_name ? (
                    <>Ahlan, {first_name}👋</>
                ) : (
                    'Ahlan!'
                )}
            </h1>
            {/* Uncomment to display EventCarousel */}
            {/* <EventCarousel /> */}

            {/* Profile Completion Card - Clickable */}
            <div
                onClick={() => router.push('/profile')}
                className="cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
                <div className="relative overflow-hidden rounded-lg">
                    {/* Gradient background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

                    {/* Card content */}
                    <div className="relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
                        <CompletionWidget
                            completion={completion}
                            isLoading={isLoadingCompletion}
                        />
                    </div>

                    {/* Subtle shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000" />
                </div>
            </div>

            <Button
                variant="destructive"
                className="mt-2"
                onClick={async () => await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/sign-in"); // redirect to login page
                        },
                    },
                })}
            >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
        </div>
    )
}