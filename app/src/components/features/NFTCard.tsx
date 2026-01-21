'use client'

import React, { useState } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixProgress } from '~/components/ui/Twenty6ixProgress'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { NFTTier, Profile } from '~/types/twenty6ix'
import { Check, Lock, Coins, Zap } from 'lucide-react'
import { cn } from '~/lib/utils'

interface NFTCardProps {
    tier: NFTTier
    user: Profile | null
    isOwned: boolean
    onMint: () => void
    isLoading?: boolean
}

export function NFTCard({ tier, user, isOwned, onMint, isLoading = false }: NFTCardProps) {
    const [showDetails, setShowDetails] = useState(false)

    if (!user) return null

    // Check eligibility - Only XP requirement per PRD
    const hasRequiredXP = user.xp_total >= tier.xp_requirement
    
    // Check mint limits
    let currentMintCount = 0
    let hasReachedLimit = false
    
    switch (tier.type) {
        case 'early_bird':
            hasReachedLimit = user.early_bird_claimed || false
            currentMintCount = hasReachedLimit ? 1 : 0
            break
        case 'silver':
            currentMintCount = user.silver_nft_count || 0
            hasReachedLimit = tier.max_mints_per_user ? currentMintCount >= tier.max_mints_per_user : false
            break
        case 'gold':
            currentMintCount = user.gold_nft_count || 0
            hasReachedLimit = tier.max_mints_per_user ? currentMintCount >= tier.max_mints_per_user : false
            break
        case 'platinum':
            currentMintCount = user.platinum_nft_count || 0
            hasReachedLimit = tier.max_mints_per_user ? currentMintCount >= tier.max_mints_per_user : false
            break
    }
    
    // Eligibility is based on XP and not reaching mint limit
    const isEligible = hasRequiredXP && !hasReachedLimit

    const getProgressPercentage = () => {
        if (tier.xp_requirement === 0) return 100
        return Math.min((user.xp_total / tier.xp_requirement) * 100, 100)
    }

    return (
        <Twenty6ixCard className={cn(
            'relative overflow-hidden transition-all duration-200',
            isOwned && 'ring-2 ring-[#00A3AD] bg-[#00A3AD]/10',
            isEligible && !isOwned && 'ring-2 ring-[#A100FF] bg-[#A100FF]/10',
            !isEligible && 'opacity-75'
        )}>
            <Twenty6ixCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <Twenty6ixCardTitle className="flex items-center gap-2">
                        <Coins className={cn(
                            'h-5 w-5',
                            tier.type === 'early_bird' && 'text-[#A100FF]',
                            tier.type === 'silver' && 'text-gray-400',
                            tier.type === 'gold' && 'text-yellow-400',
                            tier.type === 'platinum' && 'text-[#A100FF]'
                        )} />
                        {tier.name} NFT
                    </Twenty6ixCardTitle>
                    {isOwned && (
                        <Twenty6ixBadge variant="success" className="gap-1">
                            <Check className="h-3 w-3" />
                            Owned
                        </Twenty6ixBadge>
                    )}
                    {!isOwned && !hasReachedLimit && isEligible && (
                        <Twenty6ixBadge variant="default" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Ready
                        </Twenty6ixBadge>
                    )}
                    {!isOwned && hasReachedLimit && (
                        <Twenty6ixBadge variant="warning" className="gap-1">
                            <Check className="h-3 w-3" />
                            Limit Reached
                        </Twenty6ixBadge>
                    )}
                    {!isEligible && !hasReachedLimit && (
                        <Twenty6ixBadge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                        </Twenty6ixBadge>
                    )}
                </div>
            </Twenty6ixCardHeader>

            <Twenty6ixCardContent className="space-y-4">
                {/* XP Bonus Only - No Price Display per PRD */}
                <div className="flex justify-center">
                    <div className="text-center">
                        <div className="text-sm text-[#B8C1D0]">
                            XP Bonus: <span className="font-medium text-[#00A3AD]">+{tier.xp_bonus} XP</span>
                        </div>
                        {tier.max_mints_per_user && tier.max_mints_per_user > 1 && (
                            <div className="text-xs text-[#6E7688] mt-1">
                                Max {tier.max_mints_per_user} per user
                            </div>
                        )}
                    </div>
                </div>

                {/* XP Requirement Only */}
                <div className="space-y-3">
                    {tier.xp_requirement > 0 ? (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#B8C1D0]">XP Required</span>
                                <span className={cn(
                                    'font-medium',
                                    hasRequiredXP ? 'text-[#00A3AD]' : 'text-[#A100FF]'
                                )}>
                                    {user.xp_total.toLocaleString()} / {tier.xp_requirement.toLocaleString()}
                                </span>
                            </div>
                            <Twenty6ixProgress value={getProgressPercentage()} className="h-2" />
                        </div>
                    ) : (
                        <div className="text-center">
                            <Twenty6ixBadge variant="success" className="gap-1">
                                <Zap className="h-3 w-3" />
                                No XP Required
                            </Twenty6ixBadge>
                            {tier.mint_limit_global && (
                                <div className="text-xs text-[#6E7688] mt-2">
                                    Limited to first {tier.mint_limit_global.toLocaleString()} users
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    {isOwned ? (
                        <Twenty6ixButton variant="secondary" className="w-full" disabled>
                            <Check className="h-4 w-4" />
                            Already Owned
                        </Twenty6ixButton>
                    ) : isEligible ? (
                        <Twenty6ixButton 
                            variant="claim"
                            className="w-full" 
                            onClick={onMint}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Minting...
                                </>
                            ) : (
                                <>
                                    <Coins className="h-4 w-4" />
                                    Mint NFT
                                </>
                            )}
                        </Twenty6ixButton>
                    ) : (
                        <Twenty6ixButton variant="secondary" className="w-full" disabled>
                            <Lock className="h-4 w-4" />
                            Need {tier.xp_requirement.toLocaleString()} XP
                        </Twenty6ixButton>
                    )}
                </div>

                {/* Toggle Details */}
                <Twenty6ixButton
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </Twenty6ixButton>

                {/* Detailed Information */}
                {showDetails && (
                    <div className="space-y-2 pt-2 border-t border-[#2A3441] text-xs text-[#B8C1D0]">
                        <p>This NFT grants you:</p>
                        <ul className="space-y-1 pl-4">
                            <li>• {tier.xp_bonus} XP bonus upon minting</li>
                            <li>• Exclusive {tier.name} tier status</li>
                            <li>• Access to tier-specific features</li>
                            {tier.max_mints_per_user && tier.max_mints_per_user > 1 && (
                                <li>• Can mint up to {tier.max_mints_per_user} times</li>
                            )}
                            {tier.mint_limit_global && (
                                <li>• Limited edition: {tier.mint_limit_global.toLocaleString()} total</li>
                            )}
                        </ul>
                    </div>
                )}
            </Twenty6ixCardContent>
        </Twenty6ixCard>
    )
}