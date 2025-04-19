'use client'

import { useState } from 'react'
import { useGetAllPentajmikan, useDeletePentajmikan } from '@/app/api/pentajmikan-api'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Users, Tag, Trash, Edit, Plus } from 'lucide-react'
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
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading programs...</span>
            </div>
        );
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
        <div className="grid gap-6">
            {programs.map((program) => (
                <Card key={program.id} className="overflow-hidden flex flex-col">
                    <div className="relative h-48 w-full bg-gray-100">
                        {program.image_id ? (
                            <Image
                                src={program.image_url || `/uploads/${program.image_id}`}
                                alt={program.name}
                                fill
                                priority
                                className="object-cover"
                                onError={(e) => {
                                    console.error('Image failed to load:', e);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <p className="text-muted-foreground">No image</p>
                            </div>
                        )}
                        <div className="hidden flex h-full w-full items-center justify-center">
                            <p className="text-muted-foreground">Image not available</p>
                        </div>
                    </div>

                    <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1">{program.name}</CardTitle>
                        <CardDescription>
                            {new Date(program.date).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-grow">
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{format(new Date(program.date), 'PPP')}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{program.total_participants} participants</span>
                            </div>

                            {program.niche && (
                                <div className="flex items-center text-sm">
                                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <Badge variant="outline">{program.niche}</Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between pt-2 border-t">
                        <Link href={`/pentajmikan/${program.id}`}>
                            <Button variant="secondary">View Details</Button>
                        </Link>

                        <div className="flex gap-2">
                            <Link href={`/pentajmikan/${program.id}/edit`}>
                                <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setSelectedId(program.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash className="h-4 w-4" />
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
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
} 