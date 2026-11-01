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

export function FormSignIn({ callbackUrl }) {
    const [isLoading, setIsLoading] = useState(false)

    const signInGoogle = async () => {
        setIsLoading(true)
        try {
            // Better Auth redirects to Google first and applies callbackURL only
            // after OAuth completes. A successful initiation is not a login yet.
            const result = await signIn.social({
                provider: 'google',
                callbackURL: callbackUrl || '/dashboard',
            })
            if (result.error) {
                toast.error(result.error.message || 'Sign-in failed. Please try again.')
            }
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
