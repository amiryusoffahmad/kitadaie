'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PdfPreview } from './pdf-preview';
import { UploadButton } from './upload-button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
                    <div className="flex justify-center py-8">
                        <svg
                            className="h-8 w-8 animate-spin text-muted-foreground"
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