'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WelcomeScreen } from '@/components/features/WelcomeScreen'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
    const { state, miniApp, dispatch } = useApp()
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Demo mode - set to true to test the authenticated dashboard
    const DEMO_MODE = true

    // Demo mode setup
    useEffect(() => {
        if (DEMO_MODE && !state.user) {
            const demoUser = {
                fid: 123456,
                wallet_address: '0x1234567890123456789012345678901234567890',
                xp_total: 1250,
                total_spend_usd: 15.50,
                referral_code: 'DEMO123',
                referred_by_fid: undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            
            // Set demo user
            dispatch({ type: 'SET_USER', payload: demoUser })
        }
    }, [DEMO_MODE, state.user, dispatch])

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
        
        // Simulate sign-in process
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setIsLoading(false)
    }

    if (!state.isAuthenticated) {
        return (
            <WelcomeScreen
                onSignIn={handleSignIn}
                isMiniApp={miniApp.isMiniApp}
                isLoading={isLoading}
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