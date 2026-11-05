import { FormSignIn } from '@/features/auth/sign-in/form-sign-in'
import Image from 'next/image'

export default async function Page({ searchParams }) {
    const currSearchParams = await searchParams
    console.log(currSearchParams)
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
                <FormSignIn callbackUrl={currSearchParams.callbackUrl} />
            </div>

        </div>
    )
}
