import { CollectionPage } from '@/features/content/content-client';
export default async function Page({ params }) { return <CollectionPage kind='series' id={(await params).id} />; }
