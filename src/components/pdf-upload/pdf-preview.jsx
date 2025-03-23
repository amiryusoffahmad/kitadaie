'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Download, Eye, File } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Component to preview and manage uploaded PDF files
 * 
 * @param {Object} props - Component props
 * @param {Object} props.file - File object with id, filename, path
 * @param {function} props.onDelete - Callback when file is deleted
 * @param {boolean} props.showPreview - Whether to show preview inline
 * @param {string} props.className - Additional CSS classes
 */
export function PdfPreview({
    file,
    onDelete,
    showPreview = false,
    className = '',
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(showPreview);

    if (!file) return null;

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/uploads/${file.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete file');
            }

            toast.success('File deleted successfully');
            if (onDelete) {
                onDelete(file.id);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to delete file');
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePreview = () => {
        setPreviewOpen(!previewOpen);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card className={`overflow-hidden ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <File className="h-10 w-10 flex-shrink-0 text-blue-500" />
                        <div className="overflow-hidden">
                            <p className="truncate font-medium">{file.filename}</p>
                            {file.size && (
                                <p className="text-sm text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePreview}
                            title="Preview"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Download"
                        >
                            <a href={file.path} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Delete"
                        >
                            {isDeleting ? (
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                        </Button>
                    </div>
                </div>

                {previewOpen && (
                    <div className="mt-4 h-[500px] w-full overflow-hidden rounded border">
                        <iframe
                            src={`${file.path}#toolbar=0`}
                            className="h-full w-full"
                            title={file.filename}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 