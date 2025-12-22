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

export default function DataList() {
    const { data: session } = useSession()
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id)
    const first_name = personalData?.first_name
    const router = useRouter()

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">
                {isLoading ? (
                    <Skeleton className="h-8 w-40" />
                ) : first_name ? (
                    <>Ahlan {first_name}</>
                ) : (
                    'Ahlan!'
                )}
            </h1>
            {/* Uncomment to display EventCarousel */}
            {/* <EventCarousel /> */}
            <Alert className="bg-background border-border">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    The content of this application is strictly private and confidential! Any breach of confidentiality will be treated with the utmost seriousness and may result in appropriate action.
                </AlertDescription>
            </Alert>

            {/* Link to previous version */}
            <Alert variant="outline" className="border-blue-200 bg-blue-50/50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle>Go To Previous Version</AlertTitle>
                <AlertDescription>
                    You can access the previous version of KitaDaie at <a href="https://v1.kitadaie.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">v1.kitadaie.com</a>
                </AlertDescription>
            </Alert>

            {/* Profile Completion Section */}
            <div className="border border-amber-200 p-4 rounded-md bg-amber-50/50">
                <div className="flex items-center justify-between">
                    <div className="text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="flex items-center gap-1">
                            Your New KitaDaie ID:
                        </span>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
                            {personalData?.username || 'Loading...'}
                        </code>
                    </div>
                    <Button size="sm" onClick={() => router.push('/profile')}>
                        Complete Profile
                    </Button>
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