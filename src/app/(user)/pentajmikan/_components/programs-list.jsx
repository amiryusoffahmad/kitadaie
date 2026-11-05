'use client'

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState } from 'react'
import { useGetAllPentajmikan, useDeletePentajmikan } from '@/app/api/pentajmikan-api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Users, Trash, Edit, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
import { format } from 'date-fns'

export default function ProgramsList() {
    const { data: programs, isLoading, error } = useGetAllPentajmikan();
    const [selectedId, setSelectedId] = useState(null);
    const deleteProgram = useDeletePentajmikan();

    const handleDelete = async () => {
        if (selectedId) {
            await deleteProgram.mutateAsync(selectedId);
            setSelectedId(null);
        }
    };

    if (isLoading) {
        return <AppLoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
                <p>Error loading programs: {error.message}</p>
            </div>
        );
    }

    if (!programs || programs.length === 0) {
        return (
            <div className="text-center p-12 border rounded-lg">
                <h3 className="text-lg font-medium">No programs found</h3>
                <p className="text-muted-foreground mt-2">Get started by creating your first program.</p>
                <Link href="/pentajmikan/add" className="mt-4 inline-block">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {programs.map((program) => (
                <Card key={program.id} className="overflow-hidden">
                    <div className="px-4 flex justify-between items-start">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{program.name}</h3>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {format(new Date(program.date), 'PPP')}
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    {program.total_participants} participants
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/pentajmikan/${program.id}`}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                </Button>
                            </Link>

                            <Link href={`/pentajmikan/${program.id}/edit`}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setSelectedId(program.id)}
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-300"
                                    >
                                        <Trash className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Program</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this program? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setSelectedId(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                            {deleteProgram.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 