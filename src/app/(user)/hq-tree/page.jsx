'use client';

import HQTreeView from './_components/hq-tree-view';

export default function HQTreePage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">HQ Tree</h1>
            <HQTreeView />
        </div>
    );
} 