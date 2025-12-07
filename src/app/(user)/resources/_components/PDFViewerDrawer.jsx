'use client'

import { useEffect } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Download, Tag, ExternalLink } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const uriUpload = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000"

export default function PDFViewerDrawer({ open, onOpenChange, resource }) {
    if (!resource) return null

    // Construct full file URL (match assignment pattern)
    const fullFileUrl = resource.file_path ? `${uriUpload}${resource.file_path}` : null

    // Debug: Log the file path when resource changes
    useEffect(() => {
        if (resource?.file_path) {
            console.log('[PDF VIEWER] Resource file path:', resource.file_path)
            console.log('[PDF VIEWER] Full file URL:', fullFileUrl)
            console.log('[PDF VIEWER] Full resource:', resource)
        }
    }, [resource, fullFileUrl])

    const handleDownload = () => {
        if (!fullFileUrl) {
            console.error('[PDF VIEWER] No file path available')
            return
        }
        window.open(fullFileUrl, '_blank')
    }

    const handleOpenNewTab = () => {
        if (!fullFileUrl) {
            console.error('[PDF VIEWER] No file path available')
            return
        }
        window.open(fullFileUrl, '_blank')
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className='h-[90vh] mx-auto max-w-md'>
                <DrawerHeader className='border-b'>
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                            <DrawerTitle className='text-left text-base pr-2'>
                                {resource.title}
                            </DrawerTitle>
                            <div className='flex flex-wrap gap-2 mt-2'>
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
                                        <span>{resource.tags.join(', ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DrawerClose asChild>
                            <Button variant='ghost' size='icon' className='shrink-0'>
                                <X className='h-4 w-4' />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <ScrollArea className='flex-1'>
                    <div className='p-4'>
                        {/* PDF Embed */}
                        {fullFileUrl ? (
                            <div className='w-full' style={{ height: 'calc(90vh - 200px)' }}>
                                <iframe
                                    src={fullFileUrl}
                                    className='w-full h-full border rounded-lg'
                                    title={resource.title}
                                    onError={(e) => {
                                        console.error('[PDF VIEWER] Iframe error:', e)
                                    }}
                                    onLoad={() => {
                                        console.log('[PDF VIEWER] Iframe loaded successfully')
                                    }}
                                />
                            </div>
                        ) : (
                            <div className='text-center py-12'>
                                <p className='text-muted-foreground'>No file available to display</p>
                            </div>
                        )}

                        {/* Description if available */}
                        {resource.description && (
                            <div className='mt-4'>
                                <h3 className='font-semibold mb-2'>Description</h3>
                                <p className='text-sm text-muted-foreground'>
                                    {resource.description}
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DrawerFooter className='border-t'>
                    <div className='flex gap-2'>
                        <Button onClick={handleOpenNewTab} className='flex-1'>
                            <ExternalLink className='h-4 w-4 mr-2' />
                            Open in New Tab
                        </Button>
                        <Button onClick={handleDownload} variant='outline' className='flex-1'>
                            <Download className='h-4 w-4 mr-2' />
                            Download
                        </Button>
                    </div>
                    <DrawerClose asChild>
                        <Button variant='outline' className='w-full'>
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
