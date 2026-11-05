import { FormSignIn } from '@/features/auth/sign-in/form-sign-in'
import { GalleryVerticalEnd } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Page({ searchParams }) {
    const currSearchParams = await searchParams
    const requestHeaders = await headers()
    const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    const protocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0].trim() || 'http'
    const host = requestHeaders.get('host')
    const requestOrigin = host ? `${protocol}://${host}` : null

    if (baseURL && requestOrigin && requestOrigin !== new URL(baseURL).origin) {
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
                <a href='#' className='flex items-center gap-2 self-center rounded-md bg-white px-2 py-1 font-medium'>
                    <Image
                        src="/branding/kitadaie-header-logo.png"
                        alt="Kita Daie"
                        width={2172}
                        height={724}
                        priority
                        className="h-10 w-auto object-contain"
                    />
                </a>
                <FormSignIn error={currSearchParams.error} />
            </div>
        </div>
    )
}
