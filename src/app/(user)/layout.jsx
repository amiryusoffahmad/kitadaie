import BottomNavigation from "./_components/BottomNavigation";
import ScreenshotPrevention from "./_components/ScreenshotPrevention";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function MobileLayout({ children }) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect('/sign-in');
    return (
        <div className='app-shell border-x'>
                <ScreenshotPrevention />
                <main className='app-main' id='main-content'>
                    <Link href='/home' className='inline-flex mb-6 rounded-lg' aria-label='KitaDaie Home'>
                        <Image src='/brand/kitadaie-kd-header-logo.png' alt='KitaDaie' width={160} height={52} priority className='brand-header-logo h-auto' />
                    </Link>
                    {children}
                </main>
                <BottomNavigation />
        </div>
    )
}
