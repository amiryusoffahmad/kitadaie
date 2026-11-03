import { CollectionPage } from '@/features/content/content-client';
export default async function Page({ params }) { return <CollectionPage kind='category' id={(await params).id} />; }
