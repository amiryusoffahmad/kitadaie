'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useGetPentajmikanById, useDeletePentajmikan } from '@/app/api/pentajmikan-api'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { ArrowLeft, Calendar, Edit, Loader2, MapPin, Tag, Trash, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ProgramDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { data: program, isLoading, error } = useGetPentajmikanById(params.id)
    const deleteProgram = useDeletePentajmikan()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const handleDelete = async () => {
        try {
            await deleteProgram.mutateAsync(params.id)
            router.push('/pentajmikan')
        } catch (error) {
            console.error('Error deleting program:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading program details...</span>
            </div>
        )
    }

    if (error || !program) {
        return (
            <div className="container flex flex-col items-center justify-center mx-auto py-12">
                <div className="bg-red-50 text-red-800 p-6 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>Failed to load program details: {error?.message || 'Program not found'}</p>
                    <Link href="/pentajmikan" className="mt-4 inline-block">
                        <Button>Back to Programs</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container flex flex-col mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/pentajmikan">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Program Image */}
                    <Card>
                        <div className="relative h-64 w-full bg-gray-100 rounded-t-lg overflow-hidden">
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
                            <div className="hidden h-full w-full items-center justify-center">
                                <p className="text-muted-foreground">Error loading image</p>
                            </div>
                        </div>
                    </Card>

                    {/* Program Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Program Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {program.description && (
                                <>
                                    <div>
                                        <h3 className="font-medium mb-2">Description</h3>
                                        <p className="text-muted-foreground">{program.description}</p>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-2 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date and Time
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {format(new Date(program.date), 'PPP')}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {format(new Date(program.date), 'p')}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2 flex items-center">
                                        <Users className="h-4 w-4 mr-2" />
                                        Participants
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {program.total_participants} total participants
                                    </p>
                                </div>

                                {program.niche && (
                                    <div>
                                        <h3 className="font-medium mb-2 flex items-center">
                                            <Tag className="h-4 w-4 mr-2" />
                                            Niche/Category
                                        </h3>
                                        <Badge variant="outline">{program.niche}</Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Link href={`/pentajmikan/${program.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Program
                                </Button>
                            </Link>

                            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete Program
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
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
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
                        </CardFooter>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Participants Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Participants</CardTitle>
                            <CardDescription>
                                People involved in this program
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {program.participants && Array.isArray(program.participants) && program.participants.length > 0 ? (
                                <div className="space-y-4">
                                    {program.participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center gap-3">
                                            {participant.avatar ? (
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    <Image
                                                        src={participant.avatar}
                                                        alt={participant.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                    <span className="text-xs font-medium">
                                                        {participant.name ? participant.name.substring(0, 2).toUpperCase() : '??'}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{participant.name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{participant.email || ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No participants added yet</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link href={`/pentajmikan/${program.id}/edit`} className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Participants
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
} 