'use client'

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PersonalForm from './PersonalForm'
import { useCurrentUserId, usePersonalData, useUpdatePersonalData } from '@/app/api/profile/user-api'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DataList() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);

    // Get the current user ID
    const { data: currentUserId, isLoading: isLoadingUserId, error: userIdError } = useCurrentUserId();

    useEffect(() => {
        if (currentUserId) {
            setUserId(currentUserId);
        }
    }, [currentUserId]);

    // Fetch user data with TanStack Query
    const {
        data: personalData,
        isLoading: isLoadingData,
        error: dataError
    } = usePersonalData(userId);

    // Handle form submission with useMutation
    const mutation = useUpdatePersonalData();

    const handleSubmit = async (data) => {
        if (!userId) {
            alert("You must be logged in to update your profile");
            return;
        }

        await mutation.mutateAsync({ data, userId });
        router.push('/profile');
    };

    // Combined loading state
    const isLoading = isLoadingUserId || isLoadingData;

    // Combined error state
    const error = userIdError || dataError;

    if (isLoading) {
        return <AppLoadingSkeleton />;
    }

    if (error || !userId) {
        const errorMessage = !userId
            ? "You must be logged in to view this page"
            : `Error loading profile data: ${error?.message || "Unknown error"}`;

        return (
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full">
                        <div className="flex flex-col items-start gap-3">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold">Personal Information</h1>
                        </div>
                    </header>
                    <main className="container -w-md w-full  py-4">
                        <div className="p-4 text-red-500 border border-red-200 rounded-md bg-red-50">
                            {errorMessage}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea>
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full">
                        <div className="flex flex-col items-start gap-3">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold mb-4">Personal Information</h1>
                        </div>
                    </header>

                    <main className="w-full">
                        <PersonalForm
                            initialData={personalData || undefined}
                            onSubmit={handleSubmit}
                            onCancel={() => router.back()}
                            isSubmitting={mutation.isPending}
                        />
                    </main>
                </div>
            </div>
        </ScrollArea>

    );
}