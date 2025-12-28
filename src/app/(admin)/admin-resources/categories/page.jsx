'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Folder } from 'lucide-react'
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
import { PageContainer, PageHeader, EmptyState, DataTableWrapper, LoadingText } from '@/components/admin'

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
        <PageContainer>
            <PageHeader
                title="Resource Categories"
                description="Manage categories for organizing resources"
                action={
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className='h-4 w-4 mr-2' />
                        New Category
                    </Button>
                }
            />

            {isLoading ? (
                <LoadingText />
            ) : categories.length === 0 ? (
                <DataTableWrapper>
                    <EmptyState
                        icon={Folder}
                        title="No categories yet"
                        description="Create your first category to organize resources"
                        action={
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className='h-4 w-4 mr-2' />
                                Create First Category
                            </Button>
                        }
                    />
                </DataTableWrapper>
            ) : (
                <DataTableWrapper>
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
                </DataTableWrapper>
            )}

            <CreateCategoryDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

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
        </PageContainer>
    )
}
