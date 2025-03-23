'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * A button component for uploading PDF files
 * 
 * @param {Object} props - Component props
 * @param {function} props.onUploadComplete - Callback when upload is complete
 * @param {function} props.onUploadError - Callback when upload fails
 * @param {Object} props.metadata - Additional metadata to include with the upload
 * @param {string} props.variant - Button variant (default, outline, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.children - Button text
 */
export function UploadButton({
    onUploadComplete,
    onUploadError,
    metadata = {},
    variant = 'default',
    className = '',
    children = 'Upload PDF',
    ...props
}) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="inline-block">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="application/pdf"
                className="hidden"
            />
            <Button
                variant={variant}
                className={className}
                onClick={triggerFileInput}
                disabled={isUploading}
                {...props}
            >
                {isUploading ? (
                    <span className="flex items-center gap-2">
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
                        Uploading...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {children}
                    </span>
                )}
            </Button>
        </div>
    );
} 