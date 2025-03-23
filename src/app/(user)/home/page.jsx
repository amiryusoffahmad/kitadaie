'use client'

import { Button } from '@/components/ui/button';
import DataList from './_components/DataList'
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export default function Page() {
    const router = useRouter()
    return (
        <div>
            <DataList />
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