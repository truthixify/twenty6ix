'use client'

import React from 'react'
import { useApp } from '~/contexts/AppContext'
import { XPDisplay } from '~/components/features/XPDisplay'
import { DailyClaimCard } from '~/components/features/DailyClaimCard'
import { Twenty6ixCard, Twenty6ixCardHeader, Twenty6ixCardContent, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { useToast } from '~/components/ui/Toast'
import { NFT_TIERS } from '~/lib/web3'

export function DashboardContent({ onShowWelcome }: { onShowWelcome?: () => void }) {
    const { state, updateProfile, dispatch } = useApp()
    const { showToast } = useToast()

    const handleDailyClaim = async () => {
        if (!state.user) return
        
        // Check if user can claim (24-hour restriction)
        if (state.user.last_claim_time) {
            const lastClaim = new Date(state.user.last_claim_time)
            const now = new Date()
            const timeDiff = now.getTime() - lastClaim.getTime()
            const hoursElapsed = timeDiff / (1000 * 60 * 60)
            
            if (hoursElapsed < 24) {
                const hoursRemaining = Math.ceil(24 - hoursElapsed)
                showToast(`❌ Daily claim available in ${hoursRemaining} hours`, 'error')
                return
            }
        }
        
        try {
            console.log('🎯 Processing daily claim for user:', state.user.fid)
            
            // TODO: Implement actual daily claim via API
            // For now, simulate the claim
            
            const now = new Date().toISOString()
            
            // Update user XP with daily claim reward (10 XP) and last claim time
            const newXP = state.user.xp_total + 10
            console.log('✅ Updating user XP from', state.user.xp_total, 'to', newXP, '(+10 daily claim)')
            
            // Update both XP and last claim time
            const updatedUser = {
                ...state.user,
                xp_total: newXP,
                last_claim_time: now
            }
            
            // Update via dispatch for immediate UI update
            dispatch({ type: 'SET_USER', payload: updatedUser })
            
            // Also update via updateProfile for database sync (if available)
            try {
                await updateProfile({ 
                    xp_total: newXP,
                    last_claim_time: now
                })
                console.log('✅ Profile updated in database')
            } catch (dbError) {
                console.warn('⚠️ Database update failed, but XP updated locally:', dbError)
            }
            
            console.log('🎉 Daily claim successful! +10 XP')
            showToast('🎉 Daily claim successful! +10 XP', 'success')
            
        } catch (error) {
            console.error('❌ Daily claim failed:', error)
            showToast('❌ Daily claim failed', 'error')
        }
    }

    const handleDonate = async (amount: number) => {
        // TODO: Implement donation logic
    }

    const handleShareReferral = () => {
        if (state.user?.referral_code) {
            const shareText = `Join me on TWENTY6IX and earn XP! Use my referral code: ${state.user.referral_code}`
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${state.user.referral_code}`
            // TODO: Implement sharing
        }
    }

    const handleMintNFT = async (tier: string) => {
        // TODO: Implement NFT minting logic
        console.log('Mint NFT clicked:', tier)
    }

    return (
        <div className="space-y-6">
            {/* Desktop Layout */}
            <div className="hidden md:block">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* XP Display */}
                        <XPDisplay 
                            currentXP={state.user?.xp_total || 0}
                            nextTierXP={2000}
                            showProgress={true}
                        />

                        {/* Daily Claim */}
                        <DailyClaimCard 
                            onClaim={handleDailyClaim} 
                            lastClaimTime={state.user?.last_claim_time}
                        />

                        {/* Quick Actions */}
                        <Twenty6ixCard>
                            <Twenty6ixCardHeader>
                                <Twenty6ixCardTitle>Quick Actions</Twenty6ixCardTitle>
                            </Twenty6ixCardHeader>
                            <Twenty6ixCardContent className="grid grid-cols-2 gap-4">
                                <Twenty6ixButton 
                                    variant="claim" 
                                    onClick={() => handleDonate(5)}
                                    className="h-20 flex-col gap-2"
                                >
                                    <span className="text-2xl">💝</span>
                                    <span>Donate</span>
                                </Twenty6ixButton>
                                <Twenty6ixButton 
                                    variant="secondary"
                                    onClick={() => handleMintNFT('early_bird')} 
                                    className="h-20 flex-col gap-2"
                                >
                                    <span className="text-2xl">🎨</span>
                                    <span>Mint NFT</span>
                                </Twenty6ixButton>
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>

                        {/* Referral Card */}
                        <Twenty6ixCard variant="featured">
                            <Twenty6ixCardHeader>
                                <Twenty6ixCardTitle>Invite Friends</Twenty6ixCardTitle>
                            </Twenty6ixCardHeader>
                            <Twenty6ixCardContent>
                                <p className="text-sm mb-4" style={{ color: '#B8C1D0' }}>
                                    Share your referral code and earn 20 XP for each friend who joins!
                                </p>
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="flex-1 px-3 py-2 rounded-lg font-mono text-sm border"
                                        style={{ 
                                            backgroundColor: 'rgba(0, 163, 173, 0.1)',
                                            borderColor: '#00A3AD',
                                            color: '#00A3AD'
                                        }}
                                    >
                                        {state.user?.referral_code}
                                    </div>
                                    <Twenty6ixButton 
                                        variant="primary" 
                                        size="sm"
                                        onClick={handleShareReferral}
                                    >
                                        Share
                                    </Twenty6ixButton>
                                </div>
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>
                    </div>

                    {/* Right Column - Stats & NFTs */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <Twenty6ixCard>
                            <Twenty6ixCardHeader>
                                <Twenty6ixCardTitle>Your Stats</Twenty6ixCardTitle>
                            </Twenty6ixCardHeader>
                            <Twenty6ixCardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span style={{ color: '#B8C1D0' }}>Total XP</span>
                                    <span 
                                        className="font-semibold text-lg"
                                        style={{ color: '#00A3AD' }}
                                    >
                                        {state.user?.xp_total?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span style={{ color: '#B8C1D0' }}>Total Spent</span>
                                    <span 
                                        className="font-semibold text-lg"
                                        style={{ color: '#A100FF' }}
                                    >
                                        ${state.user?.total_spend_usd?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span style={{ color: '#B8C1D0' }}>Referral Code</span>
                                    <span 
                                        className="font-mono text-sm"
                                        style={{ color: '#FFFFFF' }}
                                    >
                                        {state.user?.referral_code}
                                    </span>
                                </div>
                                
                                {/* Demo Reset Button */}
                                {state.user?.fid === 123456 && onShowWelcome && (
                                    <div className="pt-3 border-t border-[#2A3441]">
                                        <Twenty6ixButton
                                            variant="secondary"
                                            onClick={onShowWelcome}
                                            className="w-full text-xs"
                                            size="sm"
                                        >
                                            🔄 Show Welcome Again
                                        </Twenty6ixButton>
                                    </div>
                                )}
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>

                        {/* Available NFTs */}
                        <Twenty6ixCard variant="glow">
                            <Twenty6ixCardHeader>
                                <Twenty6ixCardTitle>Available NFTs</Twenty6ixCardTitle>
                            </Twenty6ixCardHeader>
                            <Twenty6ixCardContent className="space-y-4">
                                {Object.values(NFT_TIERS).slice(0, 2).map((tier) => (
                                    <div 
                                        key={tier.type} 
                                        className="p-4 rounded-lg border"
                                        style={{ 
                                            backgroundColor: 'rgba(161, 0, 255, 0.1)',
                                            borderColor: '#A100FF'
                                        }}
                                    >
                                        <h4 className="font-medium mb-1" style={{ color: '#FFFFFF' }}>
                                            {tier.name}
                                        </h4>
                                        <p className="text-sm mb-2" style={{ color: '#B8C1D0' }}>
                                            {tier.xp_requirement} XP required
                                        </p>
                                        <p className="text-sm font-semibold" style={{ color: '#A100FF' }}>
                                            ${tier.mint_price_usd}
                                        </p>
                                    </div>
                                ))}
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
                {/* XP Display */}
                <XPDisplay 
                    currentXP={state.user?.xp_total || 0}
                    nextTierXP={2000}
                    showProgress={true}
                />

                {/* Daily Claim */}
                <DailyClaimCard 
                    onClaim={handleDailyClaim} 
                    lastClaimTime={state.user?.last_claim_time}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Twenty6ixCard>
                        <Twenty6ixCardContent className="p-4 text-center">
                            <div 
                                className="text-2xl font-bold"
                                style={{ color: '#A100FF' }}
                            >
                                ${state.user?.total_spend_usd?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-sm" style={{ color: '#B8C1D0' }}>Total Spent</div>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                    <Twenty6ixCard>
                        <Twenty6ixCardContent className="p-4 text-center">
                            <div 
                                className="text-2xl font-bold"
                                style={{ color: '#00A3AD' }}
                            >
                                {state.user?.xp_total?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm" style={{ color: '#B8C1D0' }}>Total XP</div>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Twenty6ixButton 
                        variant="claim"
                        onClick={() => handleDonate(5)}
                        className="h-16 flex-col gap-1"
                    >
                        <span className="text-xl">💝</span>
                        <span className="text-sm">Donate</span>
                    </Twenty6ixButton>
                    <Twenty6ixButton 
                        variant="secondary"
                        onClick={() => handleMintNFT('early_bird')} 
                        className="h-16 flex-col gap-1"
                    >
                        <span className="text-xl">🎨</span>
                        <span className="text-sm">Mint NFT</span>
                    </Twenty6ixButton>
                </div>

                {/* Referral Card */}
                <Twenty6ixCard variant="featured">
                    <Twenty6ixCardContent className="p-4">
                        <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>
                            Invite Friends
                        </h3>
                        <p className="text-xs mb-3" style={{ color: '#B8C1D0' }}>
                            Earn 20 XP for each referral!
                        </p>
                        <div className="flex items-center gap-2">
                            <div 
                                className="flex-1 px-2 py-1 rounded text-xs font-mono border"
                                style={{ 
                                    backgroundColor: 'rgba(0, 163, 173, 0.1)',
                                    borderColor: '#00A3AD',
                                    color: '#00A3AD'
                                }}
                            >
                                {state.user?.referral_code}
                            </div>
                            <Twenty6ixButton 
                                variant="primary" 
                                size="sm"
                                onClick={handleShareReferral}
                            >
                                Share
                            </Twenty6ixButton>
                        </div>
                    </Twenty6ixCardContent>
                </Twenty6ixCard>

                {/* Demo Reset Button (Mobile) */}
                {state.user?.fid === 123456 && onShowWelcome && (
                    <Twenty6ixCard>
                        <Twenty6ixCardContent className="p-4">
                            <Twenty6ixButton
                                variant="secondary"
                                onClick={onShowWelcome}
                                className="w-full"
                            >
                                🔄 Show Welcome Screen Again (Demo)
                            </Twenty6ixButton>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                )}
            </div>
        </div>
    )
}