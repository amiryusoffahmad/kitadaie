'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { signIn } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'

export function FormSignIn({ callbackUrl }) {
    const [isLoading, setIsLoading] = useState(false)

    const signInGoogle = async () => {
        setIsLoading(true)
        try {
            await signIn.social(
                {
                    provider: 'google',
                    callbackURL: callbackUrl || '/admin',
                },
                {
                    onSuccess: () => {
                        toast.success('Successful sign-in. Ahlan to Kita Daie')
                        // Redirect after successful sign-in
                        if (callbackUrl) {
                            window.location.href = callbackUrl
                        } else {
                            window.location.href = '/admin'
                        }
                    },
                }
            )
        } catch (error) {
            toast.error('Sign-in failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-xl'>Welcome back</CardTitle>
                    <CardDescription>Sign in with your Google account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className='w-full'
                        onClick={signInGoogle}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className='size-5 animate-spin mr-2' />
                        ) : (
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 24 24'
                                className='size-5 mr-2'
                            >
                                <path
                                    d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                                    fill='currentColor'
                                />
                            </svg>
                        )}
                        {isLoading ? 'Signing in...' : 'Sign In with Google'}
                    </Button>
                </CardContent>
            </Card>
            <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary'>
                By clicking continue, you agree to our <a href='#'>Terms of Service</a>{' '}
                and <a href='#'>Privacy Policy</a>.
            </div>
        </div>
    )
}
