'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getEnrolledClasses, enrollInClass } from '@/app/api/tprog-api'
import { Loader2 } from 'lucide-react'

// This would be imported from your API client
// import { enrollInClass, getEnrolledClasses } from '@/app/api/tprog-api'

export default function DataList() {
    const { data: session } = useSession()
    const [classCode, setClassCode] = useState('')
    const queryClient = useQueryClient()

    // Fetch enrolled classes using the API
    const { data: classes, isLoading } = useQuery({
        queryKey: ['enrolledClasses', session?.user?.id],
        queryFn: getEnrolledClasses,
        enabled: !!session?.user?.id
    })

    // Enroll in class mutation
    const enrollMutation = useMutation({
        mutationFn: (code) => enrollInClass(code),
        onSuccess: () => {
            setClassCode('')
            queryClient.invalidateQueries(['enrolledClasses'])
        }
    })

    const handleEnroll = () => {
        if (classCode.length !== 6) {
            toast({
                title: 'Invalid Class Code',
                description: 'Please enter a valid 6-digit class code.',
                variant: 'destructive',
            })
            return
        }

        enrollMutation.mutate(classCode)
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Class Enrollment</CardTitle>
                    <CardDescription>Enter a 6-digit class code to enroll in a class</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="Enter class code"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value)}
                        maxLength={6}
                        className="w-[200px]"
                    />
                    <Button
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending || classCode.length !== 6}
                    >
                        {enrollMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enrolling...
                            </>
                        ) : 'Enroll'}
                    </Button>
                </CardContent>
            </Card>

            <Tabs defaultValue="enrolled" className="w-full">
                <TabsList>
                    <TabsTrigger value="enrolled">My Classes</TabsTrigger>
                </TabsList>
                <TabsContent value="enrolled">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            <p className="mt-2">Loading classes...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </Tabs>
        </div>
    )
}