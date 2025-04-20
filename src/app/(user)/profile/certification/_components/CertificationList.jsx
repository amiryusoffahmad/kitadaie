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
import CertificationForm from './CertificationForm'
import {
    useCurrentUserId,
    useCertificationData,
    useUpdateCertification,
    useDeleteCertification
} from '@/app/api/profile/user-api'

export default function CertificationList() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentCertification, setCurrentCertification] = useState(null);

    // Get the current user ID
    const { data: currentUserId, isLoading: isLoadingUserId, error: userIdError } = useCurrentUserId();

    useEffect(() => {
        if (currentUserId) {
            setUserId(currentUserId);
        }
    }, [currentUserId]);

    // Fetch certification data with TanStack Query
    const {
        data: certificationData,
        isLoading: isLoadingCertification,
        error: certificationError
    } = useCertificationData(userId);

    // Handle form submissions with useMutation
    const updateCertificationMutation = useUpdateCertification();
    const deleteCertificationMutation = useDeleteCertification();

    const handleAdd = () => {
        setCurrentCertification(null);
        setIsFormOpen(true);
    };

    const handleEdit = (certification) => {
        setCurrentCertification(certification);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!userId) {
            alert("You must be logged in to delete certifications");
            return;
        }

        deleteCertificationMutation.mutate({ certificationId: id, userId });
    };

    const handleSubmit = async (data) => {
        if (!userId) {
            alert("You must be logged in to update your certifications");
            return;
        }

        updateCertificationMutation.mutate({ data, userId });
        setIsFormOpen(false);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setCurrentCertification(null);
    };

    // Combined loading state
    const isLoading = isLoadingUserId || isLoadingCertification;

    // Combined error state
    const error = userIdError || certificationError;

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
                            <h1 className="text-2xl font-bold">Certifications</h1>
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
            : `Error loading certification data: ${error?.message || "Unknown error"}`;

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
                            <h1 className="text-2xl font-bold">Certifications</h1>
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
                                    {currentCertification ? "Edit Certification" : "Add Certification"}
                                </h1>
                            </div>
                        </header>

                        <main className="container max-w-md w-full  py-4">
                            <CertificationForm
                                initialData={currentCertification}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={updateCertificationMutation.isPending}
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
                                <h1 className="text-2xl font-bold">Certifications</h1>
                                <Button onClick={handleAdd}>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="container max-w-md w-full  py-4">
                        {(!certificationData || certificationData.length === 0) ? (
                            <div className="p-4 text-gray-500 border border-gray-200 rounded-md bg-gray-50 text-center">
                                No certifications found. Click "Add" to add your certifications.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {certificationData.map((certification) => (
                                    <Card key={certification.id}>
                                        <CardHeader>
                                            <CardTitle>{certification.name}</CardTitle>
                                            <CardDescription>
                                                {certification.type} - {certification.issuing_institution}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Year Obtained: {certification.year_obtained}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(certification)}
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
                                                            This will permanently delete this certification entry.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(certification.id)}
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