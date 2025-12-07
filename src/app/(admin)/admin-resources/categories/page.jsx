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
import { Plus, Trash2, Edit, Folder } from 'lucide-react'
import { toast } from 'sonner'
import CreateCategoryDialog from '../_components/CreateCategoryDialog'
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

export default function CategoriesPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState(null)
    const queryClient = useQueryClient()

    // Fetch categories
    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['resource-categories'],
        queryFn: async () => {
            const res = await fetch('/api/resources/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            return res.json()
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/resources/categories/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to delete category')
            }
            return res.json()
        },
        onSuccess: () => {
            toast.success('Category deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['resource-categories'] })
            setDeleteDialogOpen(false)
            setCategoryToDelete(null)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete category')
        }
    })

    const categories = categoriesData?.data || []

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id)
        }
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
                        <div>
                            <CardTitle>Resource Categories</CardTitle>
                            <p className='text-sm text-muted-foreground mt-1'>
                                Manage categories for organizing resources
                            </p>
                        </div>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className='h-4 w-4 mr-2' />
                            New Category
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            Loading categories...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className='text-center py-12'>
                            <Folder className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
                            <p className='text-muted-foreground mb-4'>No categories created yet</p>
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className='h-4 w-4 mr-2' />
                                Create First Category
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className='font-medium'>
                                            <Badge
                                                variant='secondary'
                                                style={{
                                                    backgroundColor: category.color + '20',
                                                    color: category.color
                                                }}
                                            >
                                                {category.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {category.slug}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <div
                                                    className='w-6 h-6 rounded border'
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className='text-sm text-muted-foreground'>
                                                    {category.color}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='max-w-xs truncate text-sm text-muted-foreground'>
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell className='text-sm text-muted-foreground'>
                                            {formatDate(category.created_at)}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleDeleteClick(category)}
                                            >
                                                <Trash2 className='h-4 w-4 text-destructive' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <CreateCategoryDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the category "{categoryToDelete?.name}"?
                            This action cannot be undone. Make sure no resources are using this category.
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
