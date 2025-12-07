'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { toast } from 'sonner'

const PRESET_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#84cc16', // lime
]

export default function CreateCategoryDialog({ open, onOpenChange }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState(PRESET_COLORS[0])
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch('/api/resources/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to create category')
            }
            return res.json()
        },
        onSuccess: () => {
            toast.success('Category created successfully')
            queryClient.invalidateQueries({ queryKey: ['resource-categories'] })
            handleClose()
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create category')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error('Please enter a category name')
            return
        }
        createMutation.mutate({ name, description, color })
    }

    const handleClose = () => {
        if (!createMutation.isPending) {
            setName('')
            setDescription('')
            setColor(PRESET_COLORS[0])
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                    <DialogDescription>
                        Create a new category for organizing resources
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Name */}
                    <div className='space-y-2'>
                        <Label htmlFor='name'>Category Name *</Label>
                        <Input
                            id='name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='e.g., Training Materials'
                            disabled={createMutation.isPending}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                            id='description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder='Brief description of this category'
                            disabled={createMutation.isPending}
                            rows={2}
                        />
                    </div>

                    {/* Color */}
                    <div className='space-y-2'>
                        <Label>Color</Label>
                        <div className='flex gap-2'>
                            {PRESET_COLORS.map((presetColor) => (
                                <button
                                    key={presetColor}
                                    type='button'
                                    className={`w-10 h-10 rounded-md border-2 transition-all ${
                                        color === presetColor
                                            ? 'border-foreground scale-110'
                                            : 'border-transparent hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: presetColor }}
                                    onClick={() => setColor(presetColor)}
                                    disabled={createMutation.isPending}
                                />
                            ))}
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                            <Input
                                type='color'
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className='w-20 h-10 cursor-pointer'
                                disabled={createMutation.isPending}
                            />
                            <Input
                                type='text'
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder='#000000'
                                className='flex-1'
                                disabled={createMutation.isPending}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClose}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={createMutation.isPending || !name.trim()}>
                            {createMutation.isPending ? 'Creating...' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
