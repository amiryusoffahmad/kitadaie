'use client'

import ProgramsList from './_components/programs-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function PentajmikanPage() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-4">Pentajmikan</h1>
                <Link href="/pentajmikan/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                    </Button>
                </Link>
            </div>

            <ProgramsList />
        </div>
    )
} 