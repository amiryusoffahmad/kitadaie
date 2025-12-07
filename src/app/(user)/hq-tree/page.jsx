import { Suspense } from 'react';
import { HQManagement } from './_components/hq-management';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
    title: 'HQ Tree',
};

export default function HQTreePage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">HQ Tree Management</h1>

            <Suspense fallback={<HQTreeSkeleton />}>
                <HQManagement />
            </Suspense>
        </div>
    );
}

function HQTreeSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="rounded-md border p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
            <div className="rounded-md border p-6 space-y-4 mt-4">
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
} 