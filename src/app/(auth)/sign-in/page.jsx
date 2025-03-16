import { FormSignIn } from '@/features/auth/sign-in/form-sign-in'
import { GalleryVerticalEnd } from 'lucide-react'

export default async function Page({ searchParams }) {
    const currSearchParams = await searchParams
    console.log(currSearchParams)
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className='flex w-full max-w-sm flex-col gap-6 p-6 rounded-lg shadow-md bg-card'>
                <a href='#' className='flex items-center gap-2 self-center font-medium'>
                    <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
                        <GalleryVerticalEnd className='size-4' />
                    </div>
                    Kita Daie
                </a>
                <FormSignIn callbackUrl={currSearchParams.callbackUrl} />
            </div>

        </div>
    )
}
