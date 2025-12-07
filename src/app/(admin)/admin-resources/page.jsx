'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'
import UploadResourceDialog from './_components/UploadResourceDialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const uriUpload = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000"

export default function AdminResourcesPage() {
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [resourceToDelete, setResourceToDelete] = useState(null)
    const queryClient = useQueryClient()

    // Fetch resources
    const { data: resourcesData, isLoading } = useQuery({
        queryKey: ['admin-resources'],
        queryFn: async () => {
            const res = await fetch('/api/resources')
            if (!res.ok) throw new Error('Failed to fetch resources')
            return res.json()
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/resources/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete resource')
            return res.json()
        },
        onSuccess: () => {
            toast.success('Resource deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
            setDeleteDialogOpen(false)
            setResourceToDelete(null)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete resource')
        }
    })

    const resources = resourcesData?.data || []

    const handleDeleteClick = (resource) => {
        setResourceToDelete(resource)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (resourceToDelete) {
            deleteMutation.mutate(resourceToDelete.id)
        }
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A'
        const kb = bytes / 1024
        const mb = kb / 1024
        if (mb >= 1) return `${mb.toFixed(2)} MB`
        return `${kb.toFixed(2)} KB`
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className='p-6'>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <CardTitle>Resources Management</CardTitle>
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Plus className='h-4 w-4 mr-2' />
                            Upload Resource
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            Loading resources...
                        </div>
                    ) : resources.length === 0 ? (
                        <div className='text-center py-12'>
                            <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
                            <p className='text-muted-foreground mb-4'>No resources uploaded yet</p>
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Plus className='h-4 w-4 mr-2' />
                                Upload First Resource
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resources.map((resource) => (
                                    <TableRow key={resource.id}>
                                        <TableCell className='font-medium'>
                                            {resource.title}
                                        </TableCell>
                                        <TableCell>
                                            {resource.category_name ? (
                                                <Badge
                                                    variant='secondary'
                                                    style={{
                                                        backgroundColor: resource.category_color + '20',
                                                        color: resource.category_color
                                                    }}
                                                >
                                                    {resource.category_name}
                                                </Badge>
                                            ) : (
                                                <span className='text-muted-foreground text-sm'>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {resource.tags && resource.tags.length > 0 ? (
                                                <div className='flex flex-wrap gap-1'>
                                                    {resource.tags.slice(0, 2).map((tag, idx) => (
                                                        <Badge key={idx} variant='outline' className='text-xs'>
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {resource.tags.length > 2 && (
                                                        <Badge variant='outline' className='text-xs'>
                                                            +{resource.tags.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className='text-muted-foreground text-sm'>-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {formatFileSize(resource.file_size)}
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {formatDate(resource.created_at)}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => {
                                                        const fullUrl = `${uriUpload}${resource.file_path}`
                                                        window.open(fullUrl, '_blank')
                                                    }}
                                                >
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => handleDeleteClick(resource)}
                                                >
                                                    <Trash2 className='h-4 w-4 text-destructive' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <UploadResourceDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{resourceToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
