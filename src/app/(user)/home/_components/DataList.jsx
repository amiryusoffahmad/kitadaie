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
            <h1 className="text-page-title mb-4">
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
                <div className="relative overflow-hidden rounded-lg border border-border bg-selected transition-colors group-hover:bg-accent">
                    <div className="relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
                        <CompletionWidget
                            completion={completion}
                            isLoading={isLoadingCompletion}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                    {/* Mathurat */}
                    <Card
                        className="cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/mathurat')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-brand" />
                            </div>
                            <p className="text-sm font-medium">Mathurat</p>
                        </CardContent>
                    </Card>

                    {/* Mutabaah */}
                    <Card
                        className="cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/mutabaah')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <CheckSquare className="h-6 w-6 text-brand" />
                            </div>
                            <p className="text-sm font-medium">Mutabaah</p>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <Card
                        className="cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/resources')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-brand" />
                            </div>
                            <p className="text-sm font-medium">Resources</p>
                        </CardContent>
                    </Card>

                    {/* HQ Tree */}
                    <Card
                        className="cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/hq-tree')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <Network className="h-6 w-6 text-brand" />
                            </div>
                            <p className="text-sm font-medium">HQ Tree</p>
                        </CardContent>
                    </Card>

                    {/* CCS Form */}
                    <Card
                        className="cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
                        onClick={() => router.push('/ccs-form')}
                    >
                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                                <ScrollText className="h-6 w-6 text-brand" />
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