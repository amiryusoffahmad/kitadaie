'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Upload, FileText, Loader2, File, Download, Trash, BookOpen } from 'lucide-react'
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
            <Card className="min-h-[300px] flex items-center justify-center">
                <CardContent>
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-center mt-4 text-muted-foreground">Loading assignment details...</p>
                </CardContent>
            </Card>
        )
    }

    if (!assignment) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignment Not Found</CardTitle>
                    <CardDescription>The assignment you're looking for doesn't exist or you don't have access to it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            We couldn't find the assignment you're looking for. Please check the URL and try again.
                        </AlertDescription>
                    </Alert>
                    <div className="mt-6">
                        <Link href={`/tprog/${classId}`} passHref>
                            <Button>Return to Class</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                        <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                        {getStatusBadge(isOverdue(assignment.due_date) ? 'overdue' : 'open')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Assignment Instructions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Instructions</h3>
                        <div className="prose max-w-none dark:prose-invert">
                            <p>{assignment.instructions || 'No detailed instructions provided.'}</p>
                        </div>

                        {/* Instruction File Download */}
                        {assignment.file_id && assignment.file && (
                            <div className="bg-muted p-4 rounded-md mt-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 mt-0.5 text-primary" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">Instruction Document</h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            The instructor has provided a detailed instruction document for this assignment.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={assignment.file.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary hover:underline text-sm"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                View Document
                                            </a>
                                            <a
                                                href={assignment.file.path}
                                                download={assignment.file.original_filename || "assignment-instructions"}
                                                className="flex items-center gap-1 text-primary hover:underline text-sm"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Existing Submission Display */}
                    {assignment.submission && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Your Submission</h3>
                            <div className="bg-muted p-4 rounded-md">
                                <div className="flex items-start gap-3">
                                    <File className="h-5 w-5 mt-0.5 text-primary" />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{assignment.submission.fileName || 'Submission File'}</h4>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Submitted on: {new Date(assignment.submission.submitted_at).toLocaleString()}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(assignment.submission.id)}
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </>
                                                )}
                                            </Button>
                                            {!isOverdue(assignment.due_date) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteSubmission(assignment.submission.id)}
                                                    disabled={isDeleting || deleteMutation.isPending}
                                                >
                                                    {deleteMutation.isPending || isDeleting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete & Resubmit
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {assignment.submission.status === 'graded' && (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-medium">Feedback</h4>
                                        <p className="text-sm mt-1">
                                            {assignment.submission.feedback || 'No feedback provided yet.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit New Assignment */}
                    {!isOverdue(assignment.due_date) && (!assignment.submission || deleteMutation.isSuccess) && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Submit Assignment</h3>
                            <div className="bg-muted/50 border border-dashed border-muted-foreground/20 rounded-lg p-4 text-center">
                                <form onSubmit={handleFileUpload} className="space-y-4">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">
                                            {selectedFile
                                                ? `Selected: ${selectedFile.name}`
                                                : 'Upload your assignment file'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Upload a PDF or Word document
                                        </p>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        />
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
                                                Select File
                                            </div>
                                        </label>

                                        <Button
                                            type="submit"
                                            disabled={!selectedFile || isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {uploadError && (
                                        <Alert variant="destructive" className="mt-4">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{uploadError}</AlertDescription>
                                        </Alert>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}

                    {isOverdue(assignment.due_date) && !assignment.submission && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Assignment Overdue</AlertTitle>
                            <AlertDescription>
                                The deadline for this assignment has passed. Contact your instructor if you need an extension.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 