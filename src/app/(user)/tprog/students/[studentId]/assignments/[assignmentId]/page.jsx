'use client'

import { useParams } from 'next/navigation'
import AssignmentReviewDetails from '@/app/(user)/tprog/_components/AssignmentReviewDetails'

export default function StudentAssignmentPage() {
    const { studentId, assignmentId } = useParams()

    return (
        <div>
            <AssignmentReviewDetails studentId={studentId} assignmentId={assignmentId} />
        </div>
    )
} 