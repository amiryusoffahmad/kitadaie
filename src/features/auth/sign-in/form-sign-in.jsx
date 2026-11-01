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

const signInErrorMessages = {
    state_mismatch: 'Your sign-in link expired or could not be verified. Start a new sign-in attempt.',
    access_denied: 'Google sign-in was cancelled. Select Sign In to try again.',
    invalid_code: 'Google could not complete sign-in. Please start again. If this keeps happening, contact your administrator.',
}

export function FormSignIn({ callbackUrl, error }) {
    const [isLoading, setIsLoading] = useState(false)
    const errorMessage = error
        ? Object.hasOwn(signInErrorMessages, error)
            ? signInErrorMessages[error]
            : 'Google sign-in could not be completed. Please try again.'
        : null

    const signInGoogle = async () => {
        setIsLoading(true)
        try {
            await signIn.social(
                {
                    provider: 'google',
                    callbackURL: callbackUrl || '/dashboard',
                },
                {
                    onSuccess: () => {
                        toast.success('Successful sign-in. Ahlan to Kita Daie')
                        // Redirect after successful sign-in
                        if (callbackUrl) {
                            window.location.href = callbackUrl
                        } else {
                            window.location.href = '/dashboard'
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
                    <CardTitle className='text-xl'>Ahlan to Kita Daie</CardTitle>
                    <CardDescription>Sign in with your Yosh Leader Google account</CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMessage && (
                        <p role='alert' className='mb-4 text-sm text-destructive'>
                            {errorMessage}
                        </p>
                    )}
                    <Button
                        className='w-full'
                        onClick={signInGoogle}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </CardContent>
            </Card>
            <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary'>
                By clicking sign in, you agree to our <a href='#'>Terms of Service</a>{' '}
                and <a href='#'>Privacy Policy</a>.
            </div>
        </div>
    )
}
