'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/features/Navigation'
import { XPDisplay } from '@/components/features/XPDisplay'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent } from '@/components/ui/Tabs'
import { NFT_TIERS } from '@/lib/web3'

export default function HomePage() {
    const { state, miniApp } = useApp()
    const [activeTab, setActiveTab] = useState('home')

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

    if (!state.isAuthenticated) {
        return (
            <div className='flex min-h-screen items-center justify-center p-4'>
                <Card className='w-full max-w-md'>
                    <CardHeader className='text-center'>
                        <CardTitle className='text-2xl font-bold'>
                            Welcome to TWENTY6IX
                        </CardTitle>
                        <p className='text-muted-foreground'>
                            Earn XP, complete tasks, and mint exclusive NFTs on
                            Base
                        </p>
                        {miniApp.isMiniApp && (
                            <p className='mt-2 text-xs text-blue-600'>
                                🎉 Running as Farcaster Mini App
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Button
                            className='w-full'
                            onClick={() => {
                                // TODO: Implement Farcaster sign-in
                                console.log('Sign in with Farcaster')
                            }}
                        >
                            Sign in with Farcaster
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleShareReferral = () => {
        if (state.user?.referral_code) {
            const shareText = `Join me on TWENTY6IX and earn XP! Use my referral code: ${state.user.referral_code}`
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${state.user.referral_code}`
            miniApp.shareContent(shareText, shareUrl)
        }
    }

    return (
        <div className='bg-background min-h-screen pb-20'>
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
            >
                {/* Header */}
                <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border sticky top-0 z-40 border-b backdrop-blur'>
                    <div className='container mx-auto px-4 py-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <h1 className='text-xl font-bold'>TWENTY6IX</h1>
                                {miniApp.isMiniApp && (
                                    <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                                        Mini App
                                    </span>
                                )}
                            </div>
                            <div className='text-muted-foreground text-sm'>
                                FID: {state.user?.fid}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className='container mx-auto space-y-6 px-4 py-6'>
                    <TabsContent value='home' className='space-y-6'>
                        <XPDisplay
                            currentXP={state.user?.xp_total || 0}
                            nextTierXP={NFT_TIERS.silver.xp_requirement}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Claim</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground mb-4 text-sm'>
                                    Claim 10 XP daily for just $0.10
                                </p>
                                <Button className='w-full'>
                                    Claim Daily Reward
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-2'>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                        Total Spend:
                                    </span>
                                    <span className='font-medium'>
                                        ${state.user?.total_spend_usd || 0}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                        Referral Code:
                                    </span>
                                    <span className='font-mono text-sm'>
                                        {state.user?.referral_code}
                                    </span>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='mt-2 w-full'
                                    onClick={handleShareReferral}
                                >
                                    Share Referral Code
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='tasks' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground mb-4'>
                                    Complete social tasks to earn 5 XP each
                                </p>
                                <div className='space-y-2'>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                        onClick={() =>
                                            miniApp.openUrl(
                                                'https://warpcast.com/twenty6ix'
                                            )
                                        }
                                    >
                                        Follow @twenty6ix on Farcaster
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'
                                        onClick={() =>
                                            miniApp.openUrl(
                                                'https://warpcast.com/~/compose?text=Just%20joined%20@twenty6ix%20to%20earn%20XP!'
                                            )
                                        }
                                    >
                                        Cast about TWENTY6IX
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='mint' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>NFT Collection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground'>
                                    Mint exclusive NFTs as you progress
                                </p>
                                {/* TODO: Add NFT mint cards */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='leaderboard' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-muted-foreground'>
                                    See how you rank against other users
                                </p>
                                {/* TODO: Add leaderboard */}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='info' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>About TWENTY6IX</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground text-sm'>
                                    TWENTY6IX is a Farcaster-native social
                                    rewards platform built on Base.
                                </p>
                                <div className='space-y-2'>
                                    <h4 className='font-medium'>
                                        How to earn XP:
                                    </h4>
                                    <ul className='text-muted-foreground space-y-1 text-sm'>
                                        <li>• Daily claims: 10 XP ($0.10)</li>
                                        <li>• Donations: 50 XP per $1</li>
                                        <li>
                                            • Referrals: 20 XP each (max 15)
                                        </li>
                                        <li>• Social tasks: 5 XP each</li>
                                        <li>• NFT mints: 100-3000 XP bonus</li>
                                    </ul>
                                </div>
                                {miniApp.isMiniApp && (
                                    <div className='border-t pt-4'>
                                        <h4 className='mb-2 font-medium'>
                                            Mini App Features:
                                        </h4>
                                        <ul className='text-muted-foreground space-y-1 text-sm'>
                                            <li>
                                                • Native Farcaster integration
                                            </li>
                                            <li>• One-click sharing</li>
                                            <li>• Seamless authentication</li>
                                            <li>
                                                • Mobile-optimized experience
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    )
}
