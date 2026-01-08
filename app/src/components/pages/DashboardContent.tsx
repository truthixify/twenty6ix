'use client'

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import { XPDisplay } from '@/components/features/XPDisplay'
import { DailyClaimCard } from '@/components/features/DailyClaimCard'
import { DonationCard } from '@/components/features/DonationCard'
import { ReferralCard } from '@/components/features/ReferralCard'
import { ContractStatus } from '@/components/features/ContractStatus'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { NFT_TIERS } from '@/lib/web3'
import { AppLayout } from '@/components/layout/AppLayout'

export function DashboardContent() {
    const { state, miniApp } = useApp()

    const handleDailyClaim = async () => {
        // TODO: Implement daily claim logic
        console.log('Processing daily claim...')
    }

    const handleDonate = async (amount: number) => {
        // TODO: Implement donation logic
        console.log(`Processing donation of ${amount}...`)
    }

    const handleShareReferral = () => {
        if (state.user?.referral_code) {
            const shareText = `Join me on TWENTY6IX and earn XP! Use my referral code: ${state.user.referral_code}`
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${state.user.referral_code}`
            miniApp.shareContent(shareText, shareUrl)
        }
    }

    return (
        <AppLayout currentPage="dashboard">
            <div className="space-y-6">
                {/* Desktop Layout */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Actions */}
                        <div className="lg:col-span-2 space-y-6">
                            <XPDisplay
                                currentXP={state.user?.xp_total || 0}
                                nextTierXP={NFT_TIERS.silver.xp_requirement}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DailyClaimCard
                                    lastClaimTime={undefined}
                                    onClaim={handleDailyClaim}
                                    isLoading={false}
                                />
                                <DonationCard
                                    onDonate={handleDonate}
                                    isLoading={false}
                                />
                            </div>
                        </div>

                        {/* Right Column - Stats & Referrals */}
                        <div className="space-y-6">
                            <ReferralCard
                                user={state.user}
                                onShare={handleShareReferral}
                                isLoading={false}
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-3'>
                                    <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>Total XP:</span>
                                        <span className='font-medium text-yellow-600'>
                                            {state.user?.xp_total.toLocaleString() || 0}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>Total Spend:</span>
                                        <span className='font-medium text-green-600'>
                                            ${state.user?.total_spend_usd || 0}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>Wallet:</span>
                                        <span className='font-mono text-xs'>
                                            {state.user?.wallet_address 
                                                ? `${state.user.wallet_address.slice(0, 6)}...${state.user.wallet_address.slice(-4)}`
                                                : 'Not connected'
                                            }
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contract Status */}
                            <ContractStatus />
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-6">
                    <XPDisplay
                        currentXP={state.user?.xp_total || 0}
                        nextTierXP={NFT_TIERS.silver.xp_requirement}
                    />

                    <DailyClaimCard
                        lastClaimTime={undefined}
                        onClaim={handleDailyClaim}
                        isLoading={false}
                    />

                    <DonationCard
                        onDonate={handleDonate}
                        isLoading={false}
                    />

                    <ReferralCard
                        user={state.user}
                        onShare={handleShareReferral}
                        isLoading={false}
                    />
                </div>
            </div>
        </AppLayout>
    )
}