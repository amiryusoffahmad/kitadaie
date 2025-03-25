'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Download, CheckCircle, XCircle } from 'lucide-react'
import { formatRelative } from 'date-fns'
import { getStudentAssignmentDetails, updateSubmissionStatus } from '@/app/api/tprog-api'

const uriUpload = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "http://localhost:4000"

export default function AssignmentReviewDetails({ studentId, assignmentId }) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [comments, setComments] = useState('')

    // Fetch assignment details with submission status
    const { data: assignment, isLoading } = useQuery({
        queryKey: ['studentAssignment', studentId, assignmentId],
        queryFn: () => getStudentAssignmentDetails(assignmentId, studentId),
        enabled: !!assignmentId && !!studentId,
    })

    // Action to update submission status
    const updateStatusMutation = useMutation({
        mutationFn: ({ submissionId, status }) =>
            updateSubmissionStatus(submissionId, status, comments),
        onSuccess: () => {
            queryClient.invalidateQueries(['studentAssignment', studentId, assignmentId])
            queryClient.invalidateQueries(['studentAssignments', studentId])
            queryClient.invalidateQueries(['advisorStudents']) // Refresh all advisor data
            setComments('')
        }
    })

    const hasSubmission = assignment?.submission?.id

    // Function to handle approve/reject actions
    const handleStatusUpdate = (status) => {
        if (!hasSubmission) {
            toast.error('No submission found to update')
            return
        }

        updateStatusMutation.mutate({
            submissionId: assignment.submission.id,
            status
        })
    }

    // Function to download the submission
    const handleDownload = () => {
        if (!hasSubmission || !assignment.submission.filePath) {
            toast.error('No file available to download')
            return
        }

        // Open file in new tab/download
        window.open(`${uriUpload}${assignment.submission.filePath}`, '_blank')
    }

    // Function to get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500 hover:bg-green-600'
            case 'pending_review':
                return 'bg-yellow-500 hover:bg-yellow-600'
            case 'overdue':
                return 'bg-red-500 hover:bg-red-600'
            case 'not_submitted':
            default:
                return 'bg-gray-500 hover:bg-gray-600'
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Loading assignment details...</h1>
                </div>
                <div className="text-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2">Loading assignment details...</p>
                </div>
            </div>
        )
    }

    if (!assignment) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Assignment not found</h1>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">The requested assignment could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
                {assignment.submission && (
                    <Badge className={getStatusColor(assignment.submission.status)}>
                        {assignment.submission.status.replace('_', ' ')}
                    </Badge>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                        <CardDescription>
                            Due: {formatRelative(new Date(assignment.due_date), new Date())}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium">Instructions</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {assignment.instructions || 'No instructions provided.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Submission</CardTitle>
                        {assignment.submission?.submitted_at && (
                            <CardDescription>
                                Submitted: {formatRelative(new Date(assignment.submission.submitted_at), new Date())}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {hasSubmission ? (
                            <div className="space-y-4">
                                {assignment.submission.fileName && (
                                    <div>
                                        <h3 className="text-sm font-medium">Submitted File</h3>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-muted-foreground">{assignment.submission.fileName}</p>
                                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-medium">Feedback</h3>
                                    <Textarea
                                        className="mt-1"
                                        placeholder="Enter feedback for the student"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="w-full bg-green-50 hover:bg-green-100 border-green-200"
                                        onClick={() => handleStatusUpdate('approved')}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        {updateStatusMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Approve
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full bg-red-50 hover:bg-red-100 border-red-200"
                                        onClick={() => handleStatusUpdate('pending_review')}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        {updateStatusMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Request Revision
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground">No submission available yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {assignment.submission?.feedback && (
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Previous Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{assignment.submission.feedback}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
} 