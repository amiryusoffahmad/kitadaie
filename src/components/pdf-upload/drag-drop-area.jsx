'use client';

import { useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { toast } from 'sonner';

/**
 * A drag and drop area for PDF uploads
 * 
 * @param {Object} props - Component props
 * @param {function} props.onUploadComplete - Callback when upload is complete
 * @param {function} props.onUploadError - Callback when upload fails
 * @param {Object} props.metadata - Additional metadata to include with upload
 * @param {string} props.className - Additional CSS classes
 */
export function DragDropArea({
    onUploadComplete,
    onUploadError,
    metadata = {},
    className = '',
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file) => {
        // Check if file is a PDF
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            if (onUploadError) onUploadError(new Error('Only PDF files are allowed'));
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        // Add additional metadata
        Object.entries(metadata).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            toast.success('File uploaded successfully');

            if (onUploadComplete) {
                onUploadComplete(data.upload);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload file');

            if (onUploadError) {
                onUploadError(error);
            }
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${isDragging ? 'border-primary bg-muted/50' : 'border-muted-foreground/25'
                } ${className}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
            />

            {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <svg
                        className="h-8 w-8 animate-spin text-primary"
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
                    <p className="text-sm font-medium">Uploading...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Drag & drop your PDF here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports PDF files up to 10MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 