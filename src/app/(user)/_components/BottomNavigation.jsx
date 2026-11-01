"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, GraduationCap, Bell, Grid2X2 } from 'lucide-react';
import { useNotifications } from '@/providers/notification-provider';
import { BulletinBadge } from '@/features/content/content-client';
import { Badge } from '@/components/ui/badge';

const tabs = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/bulletin', label: 'Bulletin', icon: Newspaper },
  { href: '/tprog', label: 'TProg', icon: GraduationCap },
  { href: '/user/notifications', label: 'Notification', icon: Bell },
  { href: '/all', label: 'All', icon: Grid2X2 },
];
export default function BottomNavigation() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const known = tabs.slice(0, 4).some((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`));
  return <nav className='bottom-nav' aria-label='Navigasi utama'>
    {tabs.map(({ href, label, icon: Icon }) => {
      const active = href === '/all' ? !known : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} className='bottom-nav__item' aria-current={active ? 'page' : undefined}>
        <span className='relative flex items-center gap-1'>
          <Icon className='bottom-nav__icon' aria-hidden='true' />
          {href === '/bulletin' && <span className='absolute -top-2 left-4'><BulletinBadge /></span>}
          {href === '/user/notifications' && unreadCount > 0 && <Badge className='absolute -top-2 left-4 px-1.5' aria-label={`${unreadCount} notifikasi belum dibaca`}>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
        </span>
        <span className='bottom-nav__label'>{label}</span>
      </Link>;
    })}
  </nav>;
}
