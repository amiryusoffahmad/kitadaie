'use client'

import { useState } from 'react'
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

export default function UploadResourceDialog({ open, onOpenChange }) {
    const [file, setFile] = useState(null)
    const [title, setTitle] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [tags, setTags] = useState('')
    const [description, setDescription] = useState('')
    const [uploading, setUploading] = useState(false)
    const queryClient = useQueryClient()

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

        if (!file || !title) {
            toast.error('Please provide a file and title')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title)
            if (categoryId) formData.append('category_id', categoryId)
            if (tags) formData.append('tags', tags)
            if (description) formData.append('description', description)

            const res = await fetch('/api/resources', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to upload resource')
            }

            toast.success('Resource uploaded successfully')
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
            toast.error(error.message || 'Failed to upload resource')
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
                    <DialogTitle>Upload Resource</DialogTitle>
                    <DialogDescription>
                        Upload a PDF file to the resources library
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* File Upload */}
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
                        <Button type='submit' disabled={uploading || !file || !title}>
                            {uploading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <Upload className='h-4 w-4 mr-2' />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
