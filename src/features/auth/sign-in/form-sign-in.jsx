'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Chrome } from 'lucide-react'

export function FormSignIn({ callbackUrl }) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const [error, setError] = useState('')
    const [returningUser, setReturningUser] = useState(null)
    const [showManualForm, setShowManualForm] = useState(false)

    // Auto-detect existing session and check for returning user
    useEffect(() => {
        async function checkSession() {
            try {
                const session = await authClient.getSession()
                if (session?.data?.session) {
                    // User is already signed in, redirect to dashboard
                    const targetUrl = callbackUrl || '/dashboard'
                    router.push(targetUrl)
                    router.refresh()
                    return
                }

                // Check for returning user in localStorage
                const lastUserEmail = localStorage.getItem('kitadaie_last_user')
                if (lastUserEmail) {
                    setReturningUser(lastUserEmail)
                    setEmail(lastUserEmail)
                }
            } catch (err) {
                console.error('Session check error:', err)
            } finally {
                setIsCheckingSession(false)
            }
        }

        checkSession()
    }, [callbackUrl, router])

    const handleSignIn = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await authClient.signIn.email({
                email,
                password,
            })

            if (result.error) {
                setError(result.error.message || 'Invalid email or password')
            } else {
                // Store email in localStorage for returning user detection
                localStorage.setItem('kitadaie_last_user', email)

                toast.success('Successful sign-in. Ahlan to Kita Daie')
                const targetUrl = callbackUrl || '/dashboard'
                router.push(targetUrl)
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error('Sign in error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOneTapSignIn = async () => {
        if (!returningUser) return

        setIsLoading(true)
        setError('')

        try {
            // Try to use browser's credential manager
            if (window.PasswordCredential) {
                const credential = await navigator.credentials.get({
                    password: true,
                    mediation: 'optional'
                })

                if (credential && credential.password) {
                    const result = await authClient.signIn.email({
                        email: credential.id,
                        password: credential.password,
                    })

                    if (result.error) {
                        setError('Please sign in manually')
                        setShowManualForm(true)
                    } else {
                        localStorage.setItem('kitadaie_last_user', credential.id)
                        toast.success('Welcome back to Kita Daie')
                        const targetUrl = callbackUrl || '/dashboard'
                        router.push(targetUrl)
                        router.refresh()
                    }
                    return
                }
            }

            // Fallback: show manual form
            setShowManualForm(true)
        } catch (err) {
            console.error('One-tap sign in error:', err)
            setShowManualForm(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDifferentAccount = () => {
        setReturningUser(null)
        setEmail('')
        setPassword('')
        setShowManualForm(true)
        localStorage.removeItem('kitadaie_last_user')
    }

    const handleGoogleSignIn = async () => {
        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: callbackUrl || '/dashboard',
            })
        } catch (error) {
            console.error('Google sign-in error:', error)
            toast.error('Failed to sign in with Google')
        }
    }

    // Show loading state while checking for existing session
    if (isCheckingSession) {
        return (
            <div className='flex flex-col gap-6'>
                <Card className='w-full max-w-md mx-auto'>
                    <CardContent className='pt-6'>
                        <div className='flex flex-col items-center justify-center space-y-4 py-8'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                            <p className='text-sm text-muted-foreground'>Checking session...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Show one-tap sign-in for returning users
    if (returningUser && !showManualForm) {
        return (
            <div className='flex flex-col gap-6'>
                <Card className='w-full max-w-md mx-auto'>
                    <CardHeader className='text-center'>
                        <CardTitle className='text-xl'>Welcome Back!</CardTitle>
                        <CardDescription>Continue as {returningUser}</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {error && (
                            <p className='text-sm text-destructive'>{error}</p>
                        )}
                        <Button
                            onClick={handleOneTapSignIn}
                            className='w-full'
                            disabled={isLoading}
                            size='lg'
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Button
                            onClick={handleDifferentAccount}
                            variant='outline'
                            className='w-full'
                            disabled={isLoading}
                        >
                            Use a different account
                        </Button>
                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <span className='w-full border-t' />
                            </div>
                            <div className='relative flex justify-center text-xs uppercase'>
                                <span className='bg-background px-2 text-muted-foreground'>
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={handleGoogleSignIn}
                            variant='outline'
                            className='w-full'
                            disabled={isLoading}
                        >
                            <Chrome className='mr-2 h-4 w-4' />
                            Sign in with Google
                        </Button>
                        <div className='text-center text-sm text-muted-foreground'>
                            Don&apos;t have an account?{' '}
                            <Link href='/sign-up' className='text-primary hover:underline'>
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-6'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-xl'>Ahlan to Kita Daie</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='email'>Email</Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='your@email.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>Password</Label>
                            <Input
                                id='password'
                                type='password'
                                placeholder='Enter your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <p className='text-sm text-destructive'>{error}</p>
                        )}
                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className='relative my-4'>
                        <div className='absolute inset-0 flex items-center'>
                            <span className='w-full border-t' />
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                            <span className='bg-background px-2 text-muted-foreground'>
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={handleGoogleSignIn}
                        variant='outline'
                        className='w-full'
                        disabled={isLoading}
                    >
                        <Chrome className='mr-2 h-4 w-4' />
                        Sign in with Google
                    </Button>
                    <div className='mt-4 text-center text-sm'>
                        Don&apos;t have an account?{' '}
                        <Link href='/sign-up' className='text-primary hover:underline'>
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}