'use client'

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
import { X, Download, Tag } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PDFViewerDrawer({ open, onOpenChange, resource }) {
    if (!resource) return null

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = resource.file_path
        link.download = resource.file_name || 'download.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
                        <div className='w-full' style={{ height: 'calc(90vh - 200px)' }}>
                            <iframe
                                src={resource.file_path}
                                className='w-full h-full border rounded-lg'
                                title={resource.title}
                            />
                        </div>

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
                    <Button onClick={handleDownload} className='w-full'>
                        <Download className='h-4 w-4 mr-2' />
                        Download PDF
                    </Button>
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
