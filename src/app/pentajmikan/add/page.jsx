'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgramForm from '../_components/program-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddProgramPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/pentajmikan">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add New Program</h1>
            </div>

            <div className="mt-6">
                <ProgramForm
                    onSuccess={(id) => router.push(`/pentajmikan/${id}`)}
                />
            </div>
        </div>
    )
} 