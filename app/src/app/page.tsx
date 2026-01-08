'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeScreen } from '@/components/features/WelcomeScreen'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
    const { state, miniApp, signInWithFarcaster } = useApp()
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Redirect to dashboard if authenticated
    useEffect(() => {
        if (state.isAuthenticated && state.user) {
            router.push('/dashboard')
        }
    }, [state.isAuthenticated, state.user, router])

    if (state.isLoading || (miniApp.isMiniApp && !miniApp.isReady)) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-center'>
                    <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                    <p className='text-muted-foreground'>
                        {miniApp.isMiniApp
                            ? 'Loading TWENTY6IX Mini App...'
                            : 'Loading TWENTY6IX...'}
                    </p>
                </div>
            </div>
        )
    }

    const handleSignIn = async () => {
        setIsLoading(true)
        
        try {
            await signInWithFarcaster()
        } catch (error) {
            console.error('Sign in failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!state.isAuthenticated) {
        return (
            <WelcomeScreen
                onSignIn={handleSignIn}
                isMiniApp={miniApp.isMiniApp}
                isLoading={isLoading}
                error={state.error}
            />
        )
    }

    // This should not be reached due to the redirect above, but just in case
    return (
        <div className='flex min-h-screen items-center justify-center'>
            <div className='text-center'>
                <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                <p className='text-muted-foreground'>Redirecting to dashboard...</p>
            </div>
        </div>
    )
}