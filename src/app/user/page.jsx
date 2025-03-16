'use client'

import { Button } from '@/components/ui/button';
import DataList from './_components/DataList'
import { createAuthClient } from "better-auth/react"
import { useRouter } from 'next/navigation';
const authClient = createAuthClient()

export default function Page() {
    const router = useRouter()
    return (
        <div>
            <DataList />
            <Button onClick={() => authClient.signOut({
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