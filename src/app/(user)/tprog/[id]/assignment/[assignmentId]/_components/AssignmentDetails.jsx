'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Upload, FileText, Loader2, File, Download, Trash } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAssignmentDetails, deleteSubmission, getActions, tprogApi } from '@/app/api/tprog-api'
import { useParams } from 'next/navigation'

const uriUpload = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000"

export default function AssignmentDetails({ params }) {
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const routeParams = useParams()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [classId, setClassId] = useState(null)
    const [assignmentId, setAssignmentId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    // Extract the params
    useEffect(() => {
        console.log("[CLIENT] AssignmentDetails: Route params:", routeParams)
        console.log("[CLIENT] AssignmentDetails: Passed params:", params)

        // Use either the passed params or get from route
        if (params && params.id) {
            setClassId(params.id)
        } else if (routeParams && routeParams.id) {
            setClassId(routeParams.id)
        }

        if (params && params.assignmentId) {
            console.log("[CLIENT] AssignmentDetails: Using passed assignmentId:", params.assignmentId)
            setAssignmentId(params.assignmentId)
        } else if (routeParams && routeParams.assignmentId) {
            console.log("[CLIENT] AssignmentDetails: Using route assignmentId:", routeParams.assignmentId)
            setAssignmentId(routeParams.assignmentId)
        }
    }, [params, routeParams])

    console.log("[CLIENT] Using classId:", classId, "assignmentId:", assignmentId)

    // Get assignment details with submission info using API
    const { data: assignment, isLoading } = useQuery({
        queryKey: ['assignmentDetails', assignmentId],
        queryFn: () => {
            console.log("[CLIENT] Fetching assignment details for ID:", assignmentId);
            if (!assignmentId) {
                console.error("[CLIENT] Cannot fetch assignment details - assignmentId is null/undefined");
                return Promise.resolve(null);
            }
            return getAssignmentDetails(assignmentId)
        },
        enabled: !!assignmentId && !!session?.user?.id,
        retry: 1 // Limit retries to prevent too many failed requests
    })

    // Direct file upload function
    async function uploadFile(file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'assignment') // Optional: to categorize the file
        const url = `${uriUpload}/upload`

        console.log("[CLIENT] Uploading to URL:", url)

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Upload failed: ${response.statusText}. ${errorText}`)
            }

            const data = await response.json()
            console.log("[CLIENT] Upload response data:", data)

            // Get the file path from the response
            let filePath = data.filePath || data.path || '';

            // Normalize the path format to ensure consistency
            if (!filePath.startsWith('/uploads/') && filePath.includes('/uploads/')) {
                // If the path includes /uploads/ somewhere in the middle, extract that part
                const parts = filePath.split('/uploads/');
                filePath = '/uploads/' + parts[parts.length - 1];
            } else if (filePath.startsWith('uploads/')) {
                // If it starts with uploads/ without the leading slash, add it
                filePath = '/' + filePath;
            }

            console.log("[CLIENT] Normalized file path:", filePath);

            // Use the fileId directly as provided by the server, which is the filename
            // This will be properly handled by the server action to create/find the database record
            const fileId = data.fileId || data.filename || filePath.split('/').pop();
            console.log("[CLIENT] Using fileId from server:", fileId);

            // Normalize the response data
            return {
                filePath: filePath,
                fileName: data.fileName || data.original_filename || file.name,
                fileSize: data.size || file.size || 0,
                mimeType: data.mimeType || data.mimetype || file.type || '',
                fileId: fileId,
                message: data.message || 'File uploaded successfully'
            }
        } catch (error) {
            console.error("[CLIENT] Upload error:", error)
            throw error
        }
    }

    // Submit assignment with the uploaded file
    const handleFileUpload = async (e) => {
        e.preventDefault()
        const file = selectedFile || e.target.files?.[0]

        if (!file) {
            setUploadError("No file selected")
            return
        }

        console.log("[CLIENT] Processing file upload:", file.name)
        setIsUploading(true)
        setUploadError(null)

        try {
            // Step 1: Upload the file and get a clean fileId
            const uploadData = await uploadFile(file)

            // Log the full upload data for debugging
            console.log("[CLIENT] Upload completed with data:", {
                fileId: uploadData.fileId,
                fileName: uploadData.fileName,
                filePath: uploadData.filePath,
                fileSize: uploadData.fileSize,
                mimeType: uploadData.mimeType
            })

            // Verify we have a valid fileId
            if (!uploadData.fileId) {
                throw new Error("Upload succeeded but no valid fileId was returned")
            }

            // Step 2: Submit the assignment with the fileId
            console.log("[CLIENT] Submitting assignment with fileId:", uploadData.fileId)
            const result = await tprogApi.submitAssignment(assignmentId, uploadData.fileId)
            console.log("[CLIENT] Assignment submission result:", result)

            // Step 3: Success handling
            toast.success("Assignment submitted successfully")
            setSelectedFile(null)

            // Step 4: Refresh the data
            queryClient.invalidateQueries(['assignmentDetails', assignmentId])
        } catch (error) {
            console.error("[CLIENT] Error during file upload process:", error)
            setUploadError(error.message || "Failed to upload and submit file")
            toast.error(error.message || "Failed to submit assignment")
        } finally {
            setIsUploading(false)
        }
    }

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => deleteSubmission(assignment?.submission?.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['assignmentDetails', assignmentId])
            toast.success("Submission deleted successfully")
        },
        onError: (error) => {
            console.error("[CLIENT] Delete error:", error)
            toast.error(error.message || "Failed to delete submission")
        }
    })

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setUploadError(null)
            console.log("[CLIENT] File selected:", file.name, "size:", file.size)
        }
    }

    const handleDeleteSubmission = async (submissionId) => {
        setIsDeleting(true);
        try {
            console.log("Deleting submission:", submissionId);
            const result = await tprogApi.deleteSubmission(submissionId);

            if (result.success) {
                console.log("Submission deleted successfully");
                // Refresh the submissions data
                await queryClient.invalidateQueries(['assignmentDetails', assignmentId]);
            } else {
                console.error("Failed to delete submission:", result);
            }
        } catch (error) {
            console.error("Error deleting submission:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date()
    }

    const getStatusBadge = (status) => {
        const styles = {
            not_submitted: 'bg-yellow-100 text-yellow-800',
            pending_review: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800'
        }

        const labels = {
            not_submitted: 'Not Submitted',
            pending_review: 'Pending Review',
            approved: 'Approved',
            overdue: 'Overdue'
        }

        return (
            <Badge className={styles[status]} variant="outline">
                {labels[status]}
            </Badge>
        )
    }

    // Add a function to handle file downloads
    const handleFileDownload = () => {
        if (!assignment?.submission?.filePath) {
            toast.error("No file available for download");
            return;
        }

        // Construct the download URL
        // If the path doesn't start with http or https, assume it's a relative path
        let downloadUrl = assignment.submission.filePath;
        if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
            // For relative paths, prepend the upload URL base
            downloadUrl = `${uriUpload}${downloadUrl}`;
        }

        console.log("[CLIENT] Downloading file from:", downloadUrl);

        // Open the URL in a new tab/window
        window.open(downloadUrl, '_blank');
    }

    const handleDownload = async (submissionId) => {
        setIsDownloading(true);
        try {
            console.log("Downloading submission:", submissionId);
            const response = await tprogApi.downloadSubmission(submissionId);
            if (response && response.success && response.downloadUrl) {
                // Create a temporary link and simulate a click to download the file
                const link = document.createElement('a');
                link.href = response.downloadUrl;
                link.setAttribute('download', ''); // This will use the server's suggested filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                toast.error("Failed to download file");
                console.error("Download failed:", response);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error(`Error downloading file: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2">Loading assignment details...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Assignment Details</h1>
                <Link href={`/tprog/${classId}`}>
                    <Button variant="outline">Back to Assignments</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{assignment?.title}</CardTitle>
                            <CardDescription>
                                Due: {new Date(assignment?.due_date).toLocaleString()}
                            </CardDescription>
                        </div>
                        {getStatusBadge(assignment?.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <p className="text-sm text-muted-foreground">
                            {assignment?.instructions}
                        </p>
                    </div>

                    {isOverdue(assignment?.due_date) && assignment?.status === 'not_submitted' ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Assignment Overdue</AlertTitle>
                            <AlertDescription>
                                This assignment is past its due date and can no longer be submitted.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-4">
                            {assignment?.submission ? (
                                <div className="border rounded-lg p-4 space-y-4">
                                    <div className="grid grid-cols-2 items-center gap-8 text-sm text-muted-foreground">
                                        <div>
                                            <FileText className="h-4 w-4" />
                                            <span>{assignment.submission.fileName}</span>
                                        </div>
                                        <span className="ml-auto">
                                            Submitted: {new Date(assignment.submission.submitted_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="secondary" onClick={handleFileDownload}>Download</Button>
                                        <Button
                                            variant="destructive"
                                            disabled={isDeleting}
                                            onClick={() => handleDeleteSubmission(assignment.submission.id)}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete Submission"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed rounded-lg p-6">
                                    <div className="text-center space-y-4">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <div className="flex flex-col gap-2">
                                            {selectedFile && (
                                                <div className="text-sm text-muted-foreground">
                                                    Selected: {selectedFile.name}
                                                </div>
                                            )}

                                            {uploadError && (
                                                <Alert variant="destructive" className="my-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertTitle>Error</AlertTitle>
                                                    <AlertDescription>{uploadError}</AlertDescription>
                                                </Alert>
                                            )}

                                            <Button
                                                variant="outline"
                                                disabled={isUploading}
                                                onClick={() => document.getElementById('file-upload').click()}
                                            >
                                                Select File
                                            </Button>

                                            <Button
                                                variant="secondary"
                                                disabled={isUploading || !selectedFile}
                                                onClick={handleFileUpload}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : 'Upload File'}
                                            </Button>

                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Upload your assignment file here
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Display current attachments if they exist */}
                            {assignment?.submission?.filename && (
                                <div className="mt-4 border rounded-md p-4 bg-gray-50">
                                    <h3 className="text-md font-medium mb-2">Current Attachment</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <File className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{assignment.submission.filename}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(assignment.submission.id)}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDeleteSubmission(assignment.submission.id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Display advisor feedback/comments if available */}
                    {assignment?.submission?.feedback && (
                        <div className="mt-6 border rounded-lg p-4 ">
                            <h3 className="font-semibold mb-2">Advisor Feedback</h3>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm whitespace-pre-wrap">{assignment.submission.feedback}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 