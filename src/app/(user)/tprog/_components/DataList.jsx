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

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tarbiah Progress</h1>

            <Tabs defaultValue="enrolled" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="enrolled">My Classes</TabsTrigger>
                    <TabsTrigger value="past">Past Classes</TabsTrigger>
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