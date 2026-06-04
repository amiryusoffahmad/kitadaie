'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal, LogOut, ScrollText, UserCircle, GraduationCap, Users, Award, Calendar, Download, AlertCircle, Info, BookOpen, CheckSquare, FolderOpen, Network } from 'lucide-react'
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
                    <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

                    {/* Card content */}
                    <div className="relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
                        <CompletionWidget
                            completion={completion}
                            isLoading={isLoadingCompletion}
                        />
                    </div>

                    {/* Subtle shine effect on hover */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                    {/* Mathurat */}
                    <Card
                        className="cursor-pointer hover:bg-primary/50 transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/mathurat')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium">Mathurat</p>
                        </CardContent>
                    </Card>

                    {/* Mutabaah */}
                    <Card
                        className="cursor-pointer hover:bg-primary/50 transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/mutabaah')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                <CheckSquare className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium">Mutabaah</p>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <Card
                        className="cursor-pointer hover:bg-primary/50 transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/resources')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-orange-600" />
                            </div>
                            <p className="text-sm font-medium">Resources</p>
                        </CardContent>
                    </Card>

                    {/* HQ Tree */}
                    <Card
                        className="cursor-pointer hover:bg-primary/50 transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/hq-tree')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <Network className="h-6 w-6 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium">HQ Tree</p>
                        </CardContent>
                    </Card>

                    {/* CCS Form */}
                    <Card
                        className="cursor-pointer hover:bg-primary/50 transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/ccs-form')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <ScrollText className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-sm font-medium">CCS Form</p>
                        </CardContent>
                    </Card>
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