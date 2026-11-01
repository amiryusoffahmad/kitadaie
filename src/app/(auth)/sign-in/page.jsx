import { FormSignIn } from '@/features/auth/sign-in/form-sign-in'
import Image from 'next/image'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Page({ searchParams }) {
    const currSearchParams = await searchParams
    const requestHeaders = await headers()
    const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    const protocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim() || 'http'
    const requestOrigin = `${protocol}://${requestHeaders.get('host')}`
    if (baseURL && requestOrigin !== new URL(baseURL).origin) {
        const signInURL = new URL('/sign-in', baseURL)
        for (const [key, value] of Object.entries(currSearchParams)) {
            if (typeof value === 'string') signInURL.searchParams.set(key, value)
        }
        redirect(signInURL.toString())
    }
    const session = await auth.api.getSession({ headers: requestHeaders })
    if (session?.user) redirect('/mutabaah')
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className='flex w-full max-w-sm flex-col gap-6 p-6 rounded-lg shadow-md bg-card'>
                <div className='flex flex-col items-center gap-3 self-center font-medium'>
                    <Image
                        src='/brand/kitadaie-kd-app-icon.png'
                        alt='KitaDaie app icon'
                        width={80}
                        height={80}
                        className='rounded-2xl'
                        loading='eager'
                    />
                    Kita Daie
                </div>
                <FormSignIn error={currSearchParams.error} />
            </div>

        </div>
    )
}
