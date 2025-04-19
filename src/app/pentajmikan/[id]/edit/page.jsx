'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProgramForm from '../../_components/program-form'
import { useGetPentajmikanById } from '@/app/api/pentajmikan-api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProgramPage() {
    const params = useParams()
    const router = useRouter()
    const { data: program, isLoading, error } = useGetPentajmikanById(params.id)

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading program...</span>
            </div>
        )
    }

    if (error || !program) {
        return (
            <div className="container mx-auto py-12">
                <div className="bg-red-50 text-red-800 p-6 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>Failed to load program: {error?.message || 'Program not found'}</p>
                    <Link href="/pentajmikan" className="mt-4 inline-block">
                        <Button>Back to Programs</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/pentajmikan/${params.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Edit Program</h1>
            </div>

            <div className="mt-6">
                <ProgramForm
                    initialData={program}
                    onSuccess={() => router.push(`/pentajmikan/${params.id}`)}
                    isEdit={true}
                />
            </div>
        </div>
    )
} 