'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import EducationForm from './EducationForm'
import {
    useCurrentUserId,
    useEducationData,
    useUpdateEducationData,
    useDeleteEducation
} from '@/app/api/profile/user-api'

export default function EducationList() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentEducation, setCurrentEducation] = useState(null);

    // Get the current user ID
    const { data: currentUserId, isLoading: isLoadingUserId, error: userIdError } = useCurrentUserId();

    useEffect(() => {
        if (currentUserId) {
            setUserId(currentUserId);
        }
    }, [currentUserId]);

    // Fetch education data with TanStack Query
    const {
        data: educationData,
        isLoading: isLoadingData,
        error: dataError
    } = useEducationData(userId);

    // Handle form submission with useMutation
    const updateMutation = useUpdateEducationData();
    const deleteMutation = useDeleteEducation();

    const handleAdd = () => {
        setCurrentEducation(null);
        setIsFormOpen(true);
    };

    const handleEdit = (education) => {
        setCurrentEducation(education);
        setIsFormOpen(true);
    };

    const handleDelete = async (educationId) => {
        if (!userId) {
            alert("You must be logged in to delete education");
            return;
        }

        deleteMutation.mutate({ educationId, userId });
    };

    const handleSubmit = async (data) => {
        if (!userId) {
            alert("You must be logged in to update your education");
            return;
        }

        updateMutation.mutate({ data, userId });
        setIsFormOpen(false);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setCurrentEducation(null);
    };

    // Combined loading state
    const isLoading = isLoadingUserId || isLoadingData;

    // Combined error state
    const error = userIdError || dataError;

    if (isLoading) {
        return (
            <div className="flex flex-col max-w-md mx-auto">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 px-4">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold">Education</h1>
                        </div>
                    </header>
                    <main className="container max-w-md w-full px-4 py-4">
                        <div>Loading...</div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !userId) {
        const errorMessage = !userId
            ? "You must be logged in to view this page"
            : `Error loading education data: ${error?.message || "Unknown error"}`;

        return (
            <div className="flex flex-col max-w-md mx-auto">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 px-4">
                            <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft
                                    style={{ width: "25px", height: "25px", padding: "0" }}
                                />
                            </Button>
                            <h1 className="text-2xl font-bold">Education</h1>
                        </div>
                    </header>
                    <main className="container max-w-md w-full px-4 py-4">
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
                <div className="flex flex-col max-w-md mx-auto pb-16">
                    <div className="flex flex-col items-center w-full">
                        <header className="bg-background w-full flex justify-center">
                            <div className="container flex flex-col max-w-md items-start gap-3 px-4">
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
                                    {currentEducation ? "Edit Education" : "Add Education"}
                                </h1>
                            </div>
                        </header>

                        <main className="container max-w-md w-full px-4 py-4">
                            <EducationForm
                                initialData={currentEducation || undefined}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={updateMutation.isPending}
                            />
                        </main>
                    </div>
                </div>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea>
            <div className="flex flex-col max-w-md mx-auto pb-16">
                <div className="flex flex-col items-center w-full">
                    <header className="bg-background w-full flex justify-center">
                        <div className="container flex flex-col max-w-md items-start gap-3 px-4">
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
                                <h1 className="text-2xl font-bold">Education</h1>
                                <Button onClick={handleAdd}>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="container max-w-md w-full px-4 py-4">
                        {(!educationData || educationData.length === 0) && (
                            <div className="p-4 text-gray-500 border border-gray-200 rounded-md bg-gray-50 text-center">
                                No education entries found. Click "Add" to add your education.
                            </div>
                        )}

                        {educationData && educationData.length > 0 && (
                            <div className="space-y-4">
                                {educationData.map((education) => (
                                    <Card key={education.id}>
                                        <CardHeader>
                                            <CardTitle>{education.university}</CardTitle>
                                            <CardDescription>
                                                {education.degree} in {education.field_of_study}
                                                {education.course && ` - ${education.course}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p>
                                                {education.start_year} - {education.is_current
                                                    ? "Present"
                                                    : education.end_year}
                                            </p>
                                            {education.scholarship && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Scholarship:</span> {education.scholarship}
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(education)}
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
                                                            This will permanently delete this education entry.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(education.id)}
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