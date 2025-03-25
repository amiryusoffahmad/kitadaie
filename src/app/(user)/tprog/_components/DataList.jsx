'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getEnrolledClasses,
    enrollInClass,
    isUserAdvisor,
    getAdvisorStudents,
    getStudentClasses
} from '@/app/api/tprog-api'
import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// This would be imported from your API client
// import { enrollInClass, getEnrolledClasses } from '@/app/api/tprog-api'

export default function DataList() {
    const { data: session } = useSession()
    const [classCode, setClassCode] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    // Check if user is an advisor
    const { data: isAdvisor, isLoading: isAdvisorLoading } = useQuery({
        queryKey: ['isAdvisor', session?.user?.id],
        queryFn: async () => {
            console.log("[CLIENT] Checking if user is advisor with ID:", session?.user?.id);
            const result = await isUserAdvisor();
            console.log("[CLIENT] Advisor check result:", result);
            return result;
        },
        enabled: !!session?.user?.id,
        onSuccess: (data) => {
            console.log("[CLIENT] User is advisor:", data);
        },
        onError: (error) => {
            console.error("[CLIENT] Error checking advisor status:", error);
        }
    })

    // Fetch enrolled classes using the API
    const { data: classes, isLoading: isClassesLoading } = useQuery({
        queryKey: ['enrolledClasses', session?.user?.id],
        queryFn: getEnrolledClasses,
        enabled: !!session?.user?.id
    })

    // Fetch advisor students
    const { data: students, isLoading: isStudentsLoading, error: studentsError } = useQuery({
        queryKey: ['advisorStudents', session?.user?.id],
        queryFn: async () => {
            console.log("[CLIENT] Fetching advisor students");
            const result = await getAdvisorStudents();
            console.log("[CLIENT] Advisor students result:", result);
            return result;
        },
        enabled: !!session?.user?.id && isAdvisor === true,
        retry: 2
    })

    // Fetch student classes for each student
    const { data: studentClassMap, isLoading: isStudentClassesLoading, error: studentClassesError } = useQuery({
        queryKey: ['studentClasses', students],
        queryFn: async () => {
            if (!students || students.length === 0) {
                console.log("[CLIENT] No students to fetch classes for");
                return {};
            }

            console.log("[CLIENT] Fetching classes for students:", students.length);
            const classMap = {};
            for (const student of students) {
                console.log("[CLIENT] Fetching classes for student:", student.id);
                try {
                    const classes = await getStudentClasses(student.id);
                    console.log("[CLIENT] Found classes for student:", classes.length);
                    classMap[student.id] = classes;
                } catch (error) {
                    console.error("[CLIENT] Error fetching classes for student:", student.id, error);
                    classMap[student.id] = [];
                }
            }
            return classMap;
        },
        enabled: !!students && students.length > 0,
        retry: 2
    })

    // Enroll in class mutation
    const enrollMutation = useMutation({
        mutationFn: (code) => enrollInClass(code),
        onSuccess: () => {
            setClassCode('')
            queryClient.invalidateQueries(['enrolledClasses'])
            setIsOpen(false)
        }
    })

    const handleEnroll = () => {
        if (classCode.length !== 6) {
            toast.error('Please enter a valid 6-digit class code.')
            return
        }

        enrollMutation.mutate(classCode)
    }

    // Determine if we should show the My Students tab
    const loadingClasses = isClassesLoading || false;
    const loadingStudents = isStudentsLoading || false;
    const isLoading = isAdvisorLoading || loadingClasses || (isAdvisor === true && loadingStudents);
    const showMyStudentsTab = isAdvisor === true;

    // Calculate number of tabs
    const numTabs = showMyStudentsTab ? 3 : 2;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tarbiah Progress</h1>

            <Tabs defaultValue="enrolled" className="w-full">
                <TabsList className={`grid w-full grid-cols-${numTabs}`}>
                    <TabsTrigger value="enrolled">My Classes</TabsTrigger>
                    <TabsTrigger value="past">Past Classes</TabsTrigger>
                    {showMyStudentsTab && (
                        <TabsTrigger value="students">My Students</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="enrolled">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2">Loading classes...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {classes && classes.length > 0 ? (
                                classes.map((classItem) => (
                                    <Card key={classItem.id}>
                                        <CardHeader>
                                            <CardTitle>{classItem.name}</CardTitle>
                                            <CardDescription>Class Code: {classItem.class_code}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="mb-4 text-sm text-muted-foreground">{classItem.description}</p>
                                            <Link href={`/tprog/${classItem.id}`}>
                                                <Button variant="secondary" className="w-full">
                                                    View Assignments
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No classes enrolled yet. Use a class code to enroll in a class.
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past">
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        Past classes will appear here.
                    </div>
                </TabsContent>

                {showMyStudentsTab && (
                    <TabsContent value="students">
                        {isStudentsLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                <p className="mt-2">Loading students...</p>
                            </div>
                        ) : studentsError ? (
                            <div className="text-center py-10 text-red-500">
                                <p>Error loading students: {studentsError.message}</p>
                                <Button
                                    onClick={() => queryClient.invalidateQueries(['advisorStudents'])}
                                    variant="outline"
                                    className="mt-2"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : isStudentClassesLoading ? (
                            <div className="text-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                <p className="mt-2">Loading student classes...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {students && students.length > 0 ? (
                                    <>
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Found {students.length} student{students.length > 1 ? 's' : ''}
                                        </div>
                                        {students.map((student) => {
                                            const studentClasses = studentClassMap?.[student.id] || [];
                                            console.log(`[CLIENT] Rendering classes for student ${student.name}:`, studentClasses.length);

                                            if (studentClasses.length === 0) {
                                                return (
                                                    <Card key={student.id}>
                                                        <CardHeader>
                                                            <CardTitle>{student.name}</CardTitle>
                                                            <CardDescription>{student.email}</CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm text-muted-foreground">
                                                                This student is not enrolled in any classes yet.
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            }

                                            return studentClasses.map((classItem) => (
                                                <Card key={`${student.id}-${classItem.id}`}>
                                                    <CardHeader>
                                                        <CardTitle>{student.name}</CardTitle>
                                                        <CardDescription>{classItem.name}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <p className="mb-4 text-sm text-muted-foreground">{classItem.description}</p>
                                                        <Link href={`/tprog/students/${student.id}/class/${classItem.id}`}>
                                                            <Button variant="secondary" className="w-full">
                                                                Mark Assignments
                                                            </Button>
                                                        </Link>
                                                    </CardContent>
                                                </Card>
                                            ));
                                        })}
                                    </>
                                ) : (
                                    <div className="col-span-full text-center py-10 text-muted-foreground">
                                        No students assigned to you yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">Enroll</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Class Enrollment</DialogTitle>
                        <DialogDescription>Enter a 6-digit class code to enroll in a class</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Input
                            placeholder="Enter class code"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                            maxLength={6}
                        />
                        <Button
                            onClick={handleEnroll}
                            disabled={enrollMutation.isPending || classCode.length !== 6}
                            className="w-full"
                        >
                            {enrollMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enrolling...
                                </>
                            ) : 'Enroll'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}