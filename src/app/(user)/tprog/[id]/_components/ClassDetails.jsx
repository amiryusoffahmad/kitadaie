'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { useQuery } from '@tanstack/react-query'
import { getClassDetails, getAssignments } from '@/app/api/tprog-api'
import { useParams } from 'next/navigation'

export default function ClassDetails({ params }) {
    const { data: session } = useSession()
    const routeParams = useParams()
    const [classId, setClassId] = useState(null)

    // Extract the classId from params or route
    useEffect(() => {
        console.log("[CLIENT] ClassDetails: Route params:", routeParams)
        console.log("[CLIENT] ClassDetails: Passed params:", params)

        // Use either the passed params or get from route
        if (params && params.id) {
            console.log("[CLIENT] Using id from passed params:", params.id)
            setClassId(params.id)
        } else if (routeParams && routeParams.id) {
            console.log("[CLIENT] Using id from route params:", routeParams.id)
            setClassId(routeParams.id)
        }
    }, [params, routeParams])

    console.log("[CLIENT] Using classId:", classId)

    // Get class details using API
    const { data: classData, isLoading: classLoading } = useQuery({
        queryKey: ['classDetails', classId],
        queryFn: () => getClassDetails(classId),
        enabled: !!classId && !!session?.user?.id
    })

    // Get assignments with status using API
    const { data: assignments, isLoading: assignmentsLoading, error: assignmentsError } = useQuery({
        queryKey: ['assignments', classId],
        queryFn: () => getAssignments(classId),
        enabled: !!classId && !!session?.user?.id,
        onSuccess: (data) => {
            console.log("[CLIENT] Assignments loaded successfully:", data)
        },
        onError: (error) => {
            console.error("[CLIENT] Error loading assignments:", error)
        }
    })

    console.log("[CLIENT] ClassData:", classData)
    console.log("[CLIENT] Assignments:", assignments)
    console.log("[CLIENT] AssignmentsError:", assignmentsError)

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

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date()
    }

    if (classLoading || assignmentsLoading) {
        return (
            <div className="container mx-auto py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2">Loading class details...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{classData?.name}</h1>
                <Link href="/tprog">
                    <Button variant="outline">Back to Classes</Button>
                </Link>
            </div>

            <p className="text-muted-foreground">{classData?.description}</p>

            <h2 className="text-xl font-semibold mt-8">Assignments</h2>
            <div className="grid gap-6">
                {assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{assignment.title}</CardTitle>
                                        <CardDescription>
                                            Due: {new Date(assignment.due_date).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(assignment.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {assignment.instructions}
                                </p>

                                {isOverdue(assignment.due_date) && assignment.status === 'not_submitted' && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Assignment Overdue</AlertTitle>
                                        <AlertDescription>
                                            This assignment is past its due date and can no longer be submitted.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Link href={`/tprog/${params.id}/assignment/${assignment.id}`}>
                                    <Button
                                        className="w-full"
                                        variant={assignment.status === 'overdue' ? "secondary" : "default"}
                                        disabled={assignment.status === 'overdue'}
                                    >
                                        {assignment.status === 'not_submitted' ? 'Submit Assignment' : 'View Submission'}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No assignments found for this class.
                    </div>
                )}
            </div>
        </div>
    )
} 