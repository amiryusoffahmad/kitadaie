import { ContentReader } from '@/features/content/content-client';
export default async function Page({ params }) { return <ContentReader kind='bulletin' id={(await params).id} />; }
