'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Tag } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import PDFViewerDrawer from './_components/PDFViewerDrawer'

export default function ResourcesPage() {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedResource, setSelectedResource] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['resource-categories'],
        queryFn: async () => {
            const res = await fetch('/api/resources/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            return res.json()
        }
    })

    // Fetch resources
    const { data: resourcesData, isLoading } = useQuery({
        queryKey: ['resources', selectedCategory],
        queryFn: async () => {
            const url = selectedCategory === 'all'
                ? '/api/resources'
                : `/api/resources?category=${selectedCategory}`
            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch resources')
            return res.json()
        }
    })

    const categories = categoriesData?.data || []
    const resources = resourcesData?.data || []

    const handleResourceClick = (resource) => {
        setSelectedResource(resource)
        setDrawerOpen(true)
    }

    return (
        <div className='pb-20 px-4'>
            {/* Header */}
            <div className='sticky top-0 bg-background z-10 py-4 -mx-4 px-4'>
                <h1 className='text-2xl font-bold mb-4'>Resources</h1>

                {/* Category Filter */}
                <ScrollArea className='w-full whitespace-nowrap'>
                    <div className='flex space-x-2 pb-2'>
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => setSelectedCategory('all')}
                            className='shrink-0'
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? 'default' : 'outline'}
                                size='sm'
                                onClick={() => setSelectedCategory(category.id)}
                                className='shrink-0'
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation='horizontal' />
                </ScrollArea>
            </div>

            {/* Resources Grid */}
            <div className='mt-4'>
                {isLoading ? (
                    <div className='grid grid-cols-2 gap-3'>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className='animate-pulse'>
                                <CardHeader className='p-3'>
                                    <div className='h-4 bg-muted rounded w-3/4'></div>
                                </CardHeader>
                                <CardContent className='p-3 pt-0'>
                                    <div className='h-3 bg-muted rounded w-1/2'></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : resources.length === 0 ? (
                    <div className='text-center py-12'>
                        <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
                        <p className='text-muted-foreground'>No resources found</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-3'>
                        {resources.map((resource) => (
                            <Card
                                key={resource.id}
                                className='cursor-pointer hover:shadow-md transition-shadow'
                                onClick={() => handleResourceClick(resource)}
                            >
                                <CardHeader className='p-3 pb-2'>
                                    <div className='flex items-start gap-2'>
                                        <FileText className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
                                        <CardTitle className='text-sm line-clamp-2 leading-tight'>
                                            {resource.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-3 pt-0 space-y-2'>
                                    {resource.category_name && (
                                        <Badge
                                            variant='secondary'
                                            className='text-xs'
                                            style={{
                                                backgroundColor: resource.category_color + '20',
                                                color: resource.category_color,
                                                borderColor: resource.category_color
                                            }}
                                        >
                                            {resource.category_name}
                                        </Badge>
                                    )}
                                    {resource.tags && resource.tags.length > 0 && (
                                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                            <Tag className='h-3 w-3' />
                                            <span className='truncate'>{resource.tags[0]}</span>
                                            {resource.tags.length > 1 && (
                                                <span>+{resource.tags.length - 1}</span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Viewer Drawer */}
            <PDFViewerDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                resource={selectedResource}
            />
        </div>
    )
}
