import { ContentHeader, ContentList } from '@/features/content/content-client';
export default function Page() {
  return <div className='space-y-4'><ContentHeader title='Bulletin' /><p className='text-muted-foreground'>Pengumuman rasmi dan makluman terkini KitaDaie.</p><ContentList kind='bulletin' /></div>;
}
