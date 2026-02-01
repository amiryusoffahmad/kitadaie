'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadResourceDialog({ open, onOpenChange, resourceToEdit = null }) {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [tags, setTags] = useState('')
    const [description, setDescription] = useState('')
    const [uploading, setUploading] = useState(false)
    const queryClient = useQueryClient()

    const isEditMode = !!resourceToEdit

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['resource-categories'],
        queryFn: async () => {
            const res = await fetch('/api/resources/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            return res.json()
        }
    })

    const categories = categoriesData?.data || []

    // Populate form when editing
    useEffect(() => {
        if (resourceToEdit) {
            setTitle(resourceToEdit.title || '')
            setCategoryId(resourceToEdit.category_id?.toString() || '')
            setTags(Array.isArray(resourceToEdit.tags) ? resourceToEdit.tags.join(', ') : resourceToEdit.tags || '')
            setDescription(resourceToEdit.description || '')
        } else {
            // Reset form when creating new
            setFile(null)
            setTitle('')
            setCategoryId('')
            setTags('')
            setDescription('')
        }
    }, [resourceToEdit])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Please select a PDF file')
                return
            }
            setFile(selectedFile)
            // Auto-fill title from filename if empty
            if (!title) {
                setTitle(selectedFile.name.replace('.pdf', ''))
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation: file required for create, title always required
        if (!isEditMode && !file) {
            toast.error('Please select a file')
            return
        }
        if (!title) {
            toast.error('Please provide a title')
            return
        }

        setUploading(true)

        try {
            if (isEditMode) {
                // Update existing resource (metadata only)
                const res = await fetch(`/api/resources/${resourceToEdit.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        category_id: categoryId || null,
                        tags,
                        description,
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Failed to update resource')
                }

                toast.success('Resource updated successfully')
            } else {
                // Create new resource with file upload
                // Step 1: Upload file directly to upload server to bypass kitadaie.com size limits
                const uploadApiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'http://localhost:4000'
                const uploadFormData = new FormData()
                uploadFormData.append('file', file)
                uploadFormData.append('type', 'resource')

                const uploadRes = await fetch(`${uploadApiUrl}/upload`, {
                    method: 'POST',
                    body: uploadFormData
                })

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text()
                    throw new Error(errorText || 'Failed to upload file')
                }

                const uploadResult = await uploadRes.json()
                const filePath = uploadResult.filePath || uploadResult.path || ''
                const fileId = uploadResult.fileId || uploadResult.filename || filePath.split('/').pop()

                // Normalize path format
                let normalizedPath = filePath
                if (!normalizedPath.startsWith('/uploads/') && normalizedPath.includes('/uploads/')) {
                    const parts = normalizedPath.split('/uploads/')
                    normalizedPath = '/uploads/' + parts[parts.length - 1]
                } else if (normalizedPath.startsWith('uploads/')) {
                    normalizedPath = '/' + normalizedPath
                }

                // Step 2: Send metadata to our API
                const res = await fetch('/api/resources', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        category_id: categoryId || null,
                        tags,
                        description,
                        file_id: fileId,
                        file_path: normalizedPath,
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Failed to save resource')
                }

                toast.success('Resource uploaded successfully')
            }

            queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
            queryClient.invalidateQueries({ queryKey: ['resources'] })

            // Reset form
            setFile(null)
            setTitle('')
            setCategoryId('')
            setTags('')
            setDescription('')
            onOpenChange(false)
        } catch (error) {
            toast.error(error.message || 'Failed to save resource')
        } finally {
            setUploading(false)
        }
    }

    const handleClose = () => {
        if (!uploading) {
            setFile(null)
            setTitle('')
            setCategoryId('')
            setTags('')
            setDescription('')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Resource' : 'Upload Resource'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update resource information (file cannot be changed)'
                            : 'Upload a PDF file to the resources library'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* File Upload - only show in create mode */}
                    {!isEditMode && (
                        <div className='space-y-2'>
                            <Label htmlFor='file'>PDF File *</Label>
                            <div className='relative'>
                                <Input
                                    id='file'
                                    type='file'
                                    accept='application/pdf'
                                    onChange={handleFileChange}
                                    className='cursor-pointer'
                                    disabled={uploading}
                                />
                                {file && (
                                    <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
                                        <FileText className='h-4 w-4' />
                                        <span className='flex-1 truncate'>{file.name}</span>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => setFile(null)}
                                            disabled={uploading}
                                        >
                                            <X className='h-4 w-4' />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div className='space-y-2'>
                        <Label htmlFor='title'>Title *</Label>
                        <Input
                            id='title'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder='Enter resource title'
                            disabled={uploading}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className='space-y-2'>
                        <Label htmlFor='category'>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId} disabled={uploading}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select a category' />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tags */}
                    <div className='space-y-2'>
                        <Label htmlFor='tags'>Tags</Label>
                        <Input
                            id='tags'
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder='Enter tags separated by commas'
                            disabled={uploading}
                        />
                        <p className='text-xs text-muted-foreground'>
                            Example: training, beginner, important
                        </p>
                    </div>

                    {/* Description */}
                    <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                            id='description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Brief description of the resource'
                            disabled={uploading}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={uploading || (!isEditMode && !file) || !title}>
                            {uploading ? (
                                <>{isEditMode ? 'Updating...' : 'Uploading...'}</>
                            ) : (
                                <>
                                    <Upload className='h-4 w-4 mr-2' />
                                    {isEditMode ? 'Update' : 'Upload'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
