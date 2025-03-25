'use client'

import { useParams } from 'next/navigation'
import StudentClassDetails from '@/app/(user)/tprog/_components/StudentClassDetails'

export default function StudentClassPage() {
    const { studentId, classId } = useParams()

    return (
        <div>
            <StudentClassDetails studentId={studentId} classId={classId} />
        </div>
    )
} 