import { HQTreeList } from './_components/HQTreeList';
import PageBackButton from "@/components/page-back-button";

export const metadata = {
    title: 'HQ Tree',
};

export default function HQTreePage() {
    return (
        <div className="space-y-4">
            <PageBackButton />
            <h1 className="text-2xl font-bold mb-4">HQ Tree</h1>
            <HQTreeList />
        </div>
    );
} 