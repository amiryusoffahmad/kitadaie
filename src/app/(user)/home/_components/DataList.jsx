'use client'

import { useSession } from '@/lib/auth-client'
import { usePersonalData } from '@/app/api/profile/user-api'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export default function DataList() {
    const { data: session } = useSession()
    const { data: personalData, isLoading } = usePersonalData(session?.user?.id)
    const first_name = personalData?.first_name

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
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    The content of this application is strictly private and confidential; any breach of confidentiality will be treated with the utmost seriousness and may result in appropriate action.
                </AlertDescription>
            </Alert>
            <Button onClick={async () => await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/sign-in"); // redirect to login page
                    },
                },
            })}>
                Logout
            </Button>
        </div>
    )
}