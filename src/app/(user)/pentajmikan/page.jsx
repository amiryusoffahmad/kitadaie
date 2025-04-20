'use client'

import ProgramsList from './_components/programs-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function PentajmikanPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pentajmikan</h2>
                <Link href="/pentajmikan/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                    </Button>
                </Link>
            </div>

            <div className="mt-6">
                <ProgramsList />
            </div>
        </div>
    )
} 