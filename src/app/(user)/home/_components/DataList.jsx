'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import EventCarousel from './EventCarousel';

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
            <EventCarousel />
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