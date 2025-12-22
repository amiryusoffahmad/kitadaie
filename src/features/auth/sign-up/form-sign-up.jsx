'use client'

import { useState } from 'react'
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

export function FormSignUp() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSignUp = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setIsLoading(false)
            return
        }

        try {
            const result = await authClient.signUp.email({
                email,
                password,
                name,
            })

            if (result.error) {
                setError(result.error.message || 'Failed to sign up')
            } else {
                toast.success('Account created successfully! Ahlan to Kita Daie')
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error('Sign up error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <Card className='w-full max-w-md mx-auto'>
                <CardHeader className='text-center'>
                    <CardTitle className='text-xl'>Create Account</CardTitle>
                    <CardDescription>Sign up for Kita Daie</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Full Name</Label>
                            <Input
                                id='name'
                                type='text'
                                placeholder='Your full name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
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
                                placeholder='At least 8 characters'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>Confirm Password</Label>
                            <Input
                                id='confirmPassword'
                                type='password'
                                placeholder='Re-enter your password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </form>
                    <div className='mt-4 text-center text-sm'>
                        Already have an account?{' '}
                        <Link href='/sign-in' className='text-primary hover:underline'>
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
