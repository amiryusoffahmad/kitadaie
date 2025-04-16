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
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold pb-6">
                {isLoading ? (
                    <Skeleton className="h-8 w-40" />
                ) : first_name ? (
                    <>Ahlan, {first_name}</>
                ) : (
                    'No name assigned'
                )}
            </h1>
            {/* Uncomment to display EventCarousel */}
            {/* <EventCarousel /> */}

            {/* Profile Completion Section */}
            <div className="border border-amber-200 p-4 rounded-md bg-amber-50/50">
                <div className="flex flex-col gap-2 mb-4">
                    <h2 className="font-semibold">Complete Your Profile</h2>
                    <span className="text-sm flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due by: 30 April 2025
                    </span>
                </div>

                <div className="space-y-0">
                    {/* Step 1 */}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                                1
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="pt-1">
                            <h3 className="font-medium flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-blue-500" />
                                Personal Information
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Complete your basic details including name, contact information, and address
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600 font-medium text-sm">
                                2
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="pt-1">
                            <h3 className="font-medium flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-green-500" />
                                Education
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add your educational background including degrees, institutions, and years
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-600 font-medium text-sm">
                                3
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="pt-1">
                            <h3 className="font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                Family Details
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add information about your family members and relationships
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600 font-medium text-sm">
                                4
                            </div>
                            <div className="w-0.5 h-12 bg-gray-200"></div>
                        </div>
                        <div className="pt-1">
                            <h3 className="font-medium flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-500" />
                                Certificates
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Update your certificates and qualifications
                            </p>
                        </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-medium text-sm">
                                5
                            </div>
                        </div>
                        <div className="pt-1">
                            <h3 className="font-medium flex items-center gap-2">
                                <Download className="h-4 w-4 text-orange-500" />
                                Add to Home Screen
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                For easier access, add this application to your home screen
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-100">
                    <div className="text-sm flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="flex items-center gap-1">
                            Your KitaDaie ID:
                        </span>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
                            {personalData?.username || 'Loading...'}
                        </code>
                    </div>
                    <Button size="sm" onClick={() => router.push('/profile')}>
                        Start Now
                    </Button>
                </div>
            </div>

            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    The content of this application is strictly private and confidential; any breach of confidentiality will be treated with the utmost seriousness and may result in appropriate action.
                </AlertDescription>
            </Alert>
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