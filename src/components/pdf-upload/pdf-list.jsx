'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PdfPreview } from './pdf-preview';
import { UploadButton } from './upload-button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Component to display and manage a list of PDF files
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - List title
 * @param {string} props.description - List description
 * @param {number} props.referenceId - Reference ID for filtering uploads
 * @param {string} props.documentType - Document type for filtering uploads
 * @param {boolean} props.showUploadButton - Whether to show the upload button
 * @param {function} props.onUploadComplete - Callback when upload is complete
 * @param {string} props.className - Additional CSS classes
 */
export function PdfList({
    title = 'Documents',
    description = 'Manage your uploaded PDF documents',
    referenceId,
    documentType,
    showUploadButton = true,
    onUploadComplete,
    className = '',
}) {
    const [files, setFiles] = useState([]);

    // Build query parameters for API request
    const queryParams = new URLSearchParams();
    if (referenceId) queryParams.append('referenceId', referenceId);
    if (documentType) queryParams.append('documentType', documentType);
    const queryString = queryParams.toString();

    // Fetch files from API
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['pdf-uploads', referenceId, documentType],
        queryFn: async () => {
            const response = await fetch(`/api/uploads${queryString ? `?${queryString}` : ''}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch uploads');
            }
            return response.json();
        },
    });

    // Update files state when data changes
    useEffect(() => {
        if (data?.uploads) {
            setFiles(data.uploads);
        }
    }, [data]);

    // Handle file upload completion
    const handleUploadComplete = (uploadedFile) => {
        // Add the new file to the list
        setFiles((prev) => [uploadedFile, ...prev]);

        // Call the parent callback if provided
        if (onUploadComplete) {
            onUploadComplete(uploadedFile);
        }

        // Refresh the list
        refetch();
    };

    // Handle file deletion
    const handleDelete = (fileId) => {
        // Remove the file from the list
        setFiles((prev) => prev.filter((file) => file.id !== fileId));

        // Refresh the list
        refetch();
    };

    // Upload button metadata
    const uploadMetadata = {
        ...(referenceId && { reference_id: referenceId }),
        ...(documentType && { document_type: documentType }),
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {showUploadButton && (
                        <UploadButton
                            onUploadComplete={handleUploadComplete}
                            metadata={uploadMetadata}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div role="status" aria-label="Loading PDF files" className="space-y-4 py-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-lg border p-4">
                                <Skeleton className="size-10 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                                <Skeleton className="size-8 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500">
                        {error.message || 'Failed to load files'}
                    </div>
                ) : files.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No PDF files found
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {files.map((file) => (
                            <PdfPreview
                                key={file.id}
                                file={file}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 