'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import FamilyForm from './FamilyForm'
import {
    useCurrentUserId,
    useFamilyData,
    useUpdateFamily,
    useDeleteFamily
} from '@/app/api/profile/user-api'

export default function FamilyList() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentFamily, setCurrentFamily] = useState(null);

    // Get the current user ID
    const { data: currentUserId, isLoading: isLoadingUserId, error: userIdError } = useCurrentUserId();

    useEffect(() => {
        if (currentUserId) {
            setUserId(currentUserId);
        }
    }, [currentUserId]);

    // Fetch family data with TanStack Query
    const {
        data: familyData,
        isLoading: isLoadingFamily,
        error: familyError
    } = useFamilyData(userId);

    // Handle form submissions with useMutation
    const updateFamilyMutation = useUpdateFamily();
    const deleteFamilyMutation = useDeleteFamily();

    const handleAdd = () => {
        setCurrentFamily(null);
        setIsFormOpen(true);
    };

    const handleEdit = (family) => {
        setCurrentFamily(family);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!userId) {
            alert("You must be logged in to delete family members");
            return;
        }

        deleteFamilyMutation.mutate({ familyId: id, userId });
    };

    const handleSubmit = async (data) => {
        if (!userId) {
            alert("You must be logged in to update your family data");
            return;
        }

        updateFamilyMutation.mutate({ data, userId });
        setIsFormOpen(false);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setCurrentFamily(null);
    };

    // Combined loading state
    const isLoading = isLoadingUserId || isLoadingFamily;

    // Combined error state
    const error = userIdError || familyError;

    if (isLoading) {
        return (
            <div className="flex flex-col max-w-md mx-auto">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 ">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold">Family</h1>
                        </div>
                    </header>
                    <main className="container max-w-md w-full  py-4">
                        <div>Loading...</div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !userId) {
        const errorMessage = !userId
            ? "You must be logged in to view this page"
            : `Error loading family data: ${error?.message || "Unknown error"}`;

        return (
            <div className="flex flex-col max-w-md mx-auto">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 ">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold">Family</h1>
                        </div>
                    </header>
                    <main className="container max-w-md w-full  py-4">
                        <div className="p-4 text-red-500 border border-red-200 rounded-md bg-red-50">
                            {errorMessage}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (isFormOpen) {
        return (
            <ScrollArea>
                <div className="flex flex-col max-w-md mx-auto">
                    <div className="flex flex-col items-center w-full">
                        <header className="bg-background w-full flex justify-center">
                            <div className="container flex flex-col max-w-md items-start gap-3 ">
                                <Button
                                    variant="ghost"
                                    className="p-0"
                                    onClick={handleCancel}
                                >
                                    <ChevronLeft
                                        style={{ width: "25px", height: "25px", padding: "0" }}
                                    />
                                </Button>
                                <h1 className="text-2xl font-bold">
                                    {currentFamily ? "Edit Family Member" : "Add Family Member"}
                                </h1>
                            </div>
                        </header>

                        <main className="container max-w-md w-full  py-4">
                            <FamilyForm
                                initialData={currentFamily}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={updateFamilyMutation.isPending}
                            />
                        </main>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea>
            <div className="flex flex-col max-w-md mx-auto">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 ">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <div className="flex justify-between items-center w-full">
                                <h1 className="text-2xl font-bold">Family</h1>
                                <Button onClick={handleAdd}>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="container max-w-md w-full  py-4">
                        {(!familyData || familyData.length === 0) ? (
                            <div className="p-4 text-gray-500 border border-gray-200 rounded-md bg-gray-50 text-center">
                                No family members found. Click "Add" to add your family members.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {familyData.map((member) => (
                                    <Card key={member.id}>
                                        <CardHeader>
                                            <CardTitle>{member.full_name}</CardTitle>
                                            <CardDescription>{member.relationship}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(member)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this family member.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(member.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ScrollArea>
    );
} 