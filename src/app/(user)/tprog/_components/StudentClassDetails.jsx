'use client'

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getStudentAssignments, getClassDetails } from '@/app/api/tprog-api'
import { Badge } from '@/components/ui/badge'
import { formatRelative } from 'date-fns'

export default function StudentClassDetails({ studentId, classId }) {
    const router = useRouter()

    // Fetch class details
    const { data: classDetails, isLoading: isClassLoading } = useQuery({
        queryKey: ['studentClass', studentId, classId],
        queryFn: () => getClassDetails(classId),
        enabled: !!classId && !!studentId
    })

    // Fetch assignments for this class
    const { data: assignments, isLoading: isAssignmentsLoading } = useQuery({
        queryKey: ['studentAssignments', studentId, classId],
        queryFn: () => getStudentAssignments(studentId, classId),
        enabled: !!classId && !!studentId
    })

    const isLoading = isClassLoading || isAssignmentsLoading

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

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isLoading ? (
                            <Skeleton className="h-7 w-56" />
                        ) : (
                            `Student Assignments - ${classDetails?.name || 'Class'}`
                        )}
                    </h1>
                </div>
            </div>

            {isLoading ? (
                <AppLoadingSkeleton />
            ) : (
                <div className="flex flex-col gap-4">
                    {assignments && assignments.length > 0 ? (
                        assignments.map((assignment) => (
                            <Card key={assignment.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start">
                                        <span>{assignment.title}</span>
                                        <Badge className={getStatusColor(assignment.status)}>
                                            {assignment.status.replace('_', ' ')}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Due: {formatRelative(new Date(assignment.due_date), new Date())}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {assignment.instructions || 'No instructions provided.'}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link
                                        href={`/tprog/students/${studentId}/assignments/${assignment.id}`}
                                        className="w-full"
                                    >
                                        <Button variant="secondary" className="w-full">
                                            Review Assignment
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No assignments found for this class.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 