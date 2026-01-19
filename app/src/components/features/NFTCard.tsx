'use client'

import React, { useState } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixProgress } from '~/components/ui/Twenty6ixProgress'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { NFTTier, Profile } from '~/types/twenty6ix'
import { Check, Lock, Coins, Users, Zap } from 'lucide-react'
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

    // Check eligibility
    const hasRequiredXP = user.xp_total >= tier.xp_requirement
    const hasRequiredSpend = user.total_spend_usd >= tier.spend_requirement
    const hasRequiredReferrals = true // TODO: Get actual referral count
    
    // For tiers that require previous NFT, we'll assume they're eligible for now
    // TODO: Check actual NFT ownership
    const hasPreviousTier = !tier.requires_previous_tier || true

    const isEligible = hasRequiredXP && (hasRequiredSpend || hasRequiredReferrals) && hasPreviousTier

    const getProgressPercentage = () => {
        if (tier.xp_requirement === 0) return 100
        return Math.min((user.xp_total / tier.xp_requirement) * 100, 100)
    }

    const getSpendProgress = () => {
        return Math.min((user.total_spend_usd / tier.spend_requirement) * 100, 100)
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
                    {!isOwned && isEligible && (
                        <Twenty6ixBadge variant="default" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Ready
                        </Twenty6ixBadge>
                    )}
                    {!isEligible && (
                        <Twenty6ixBadge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                        </Twenty6ixBadge>
                    )}
                </div>
            </Twenty6ixCardHeader>

            <Twenty6ixCardContent className="space-y-4">
                {/* Price and XP Bonus */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-[#B8C1D0]">
                        Mint Price: <span className="font-medium text-white">${tier.mint_price_usd}</span>
                    </div>
                    <div className="text-sm text-[#B8C1D0]">
                        XP Bonus: <span className="font-medium text-[#00A3AD]">+{tier.xp_bonus} XP</span>
                    </div>
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                    {/* XP Requirement */}
                    {tier.xp_requirement > 0 && (
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
                    )}

                    {/* Spend OR Referral Requirement */}
                    {(tier.spend_requirement > 0 || tier.referral_requirement > 0) && (
                        <div className="space-y-2">
                            <div className="text-sm text-[#B8C1D0]">Complete ONE of:</div>
                            
                            {/* Spend Option */}
                            {tier.spend_requirement > 0 && (
                                <div className="space-y-1 pl-4 border-l-2 border-[#00A3AD]/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#B8C1D0]">Total Spend</span>
                                        <span className={cn(
                                            'font-medium',
                                            hasRequiredSpend ? 'text-[#00A3AD]' : 'text-[#A100FF]'
                                        )}>
                                            ${user.total_spend_usd} / ${tier.spend_requirement}
                                        </span>
                                    </div>
                                    <Twenty6ixProgress value={getSpendProgress()} className="h-2" />
                                </div>
                            )}

                            {/* Referral Option */}
                            {tier.referral_requirement > 0 && (
                                <div className="flex items-center justify-between pl-4 border-l-2 border-[#00A3AD]/20">
                                    <div className="flex items-center gap-2 text-sm text-[#B8C1D0]">
                                        <Users className="h-4 w-4" />
                                        <span>OR {tier.referral_requirement} Referrals</span>
                                    </div>
                                    <span className={cn(
                                        'text-sm font-medium',
                                        hasRequiredReferrals ? 'text-[#00A3AD]' : 'text-[#A100FF]'
                                    )}>
                                        0 / {tier.referral_requirement}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Previous Tier Requirement */}
                    {tier.requires_previous_tier && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#B8C1D0]">Previous Tier NFT</span>
                            <span className={cn(
                                'font-medium',
                                hasPreviousTier ? 'text-[#00A3AD]' : 'text-[#A100FF]'
                            )}>
                                {hasPreviousTier ? 'Owned' : 'Required'}
                            </span>
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
                                    Mint for ${tier.mint_price_usd}
                                </>
                            )}
                        </Twenty6ixButton>
                    ) : (
                        <Twenty6ixButton variant="secondary" className="w-full" disabled>
                            <Lock className="h-4 w-4" />
                            Requirements Not Met
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
                    <div className="space-y-2 pt-2 border-t text-xs text-[#B8C1D0]">
                        <p>This NFT grants you:</p>
                        <ul className="space-y-1 pl-4">
                            <li>• {tier.xp_bonus} XP bonus upon minting</li>
                            <li>• Exclusive {tier.name} tier status</li>
                            <li>• Access to tier-specific features</li>
                            {tier.requires_previous_tier && (
                                <li>• Prerequisite for higher tiers</li>
                            )}
                        </ul>
                    </div>
                )}
            </Twenty6ixCardContent>
        </Twenty6ixCard>
    )
}