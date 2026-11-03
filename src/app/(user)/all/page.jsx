'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { BookOpen, FolderOpen, User, Network, CheckSquare, ScrollText, ListTodo, Newspaper, GraduationCap, Bell } from 'lucide-react';
import UpdateDrawer from '../_components/UpdateDrawer';
import { ContentHeader } from '@/features/content/content-client';

const links = [
  ['/articles', 'Articles', BookOpen], ['/bulletin', 'Bulletin', Newspaper],
  ['/tprog', 'TProg', GraduationCap], ['/user/notifications', 'Notification', Bell],
  ['/profile', 'Profile', User], ['/resources', 'Resources', FolderOpen],
  ['/mathurat', 'Mathurat', BookOpen], ['/mutabaah', 'Mutabaah', CheckSquare],
  ['/hq-tree', 'HQ Tree', Network], ['/ccs-form', 'CCS Form', ScrollText],
  ['/tasks', 'Tugasan', ListTodo],
];
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function AllPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return <div className='space-y-6'>
    <ContentHeader title='All' />
    <div className='grid grid-cols-2 gap-3'>{links.map(([href, label, Icon]) => <Link key={href} href={href} className='rounded-2xl border bg-card p-4 space-y-3 hover:border-primary'><Icon aria-hidden='true' className='text-primary' /><span className='block font-semibold'>{label}</span></Link>)}</div>
    <section className='rounded-2xl border bg-card p-4 space-y-3'><h2 className='text-xl font-semibold'>Update</h2><p className='text-sm text-muted-foreground'>Akses menu kemas kini sedia ada.</p><UpdateDrawer /></section>
    <section className='rounded-2xl border bg-card p-4 space-y-3'><h2 className='text-xl font-semibold'>Paparan</h2><label className='grid gap-2'>Tema<select className='field' value={mounted ? theme : 'system'} disabled={!mounted} onChange={(e) => setTheme(e.target.value)}><option value='system'>Ikut peranti</option><option value='light'>Cerah</option><option value='dark'>Gelap</option></select></label></section>
  </div>;
}
