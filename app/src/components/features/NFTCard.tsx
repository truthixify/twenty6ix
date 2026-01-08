'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { NFTTier, Profile } from '@/types'
import { Check, Lock, Coins, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        <Card className={cn(
            'relative overflow-hidden transition-all duration-200',
            isOwned && 'ring-2 ring-green-500 bg-green-50/50',
            isEligible && !isOwned && 'ring-2 ring-blue-500 bg-blue-50/50',
            !isEligible && 'opacity-75'
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Coins className={cn(
                            'h-5 w-5',
                            tier.type === 'early_bird' && 'text-orange-500',
                            tier.type === 'silver' && 'text-gray-500',
                            tier.type === 'gold' && 'text-yellow-500',
                            tier.type === 'platinum' && 'text-purple-500'
                        )} />
                        {tier.name} NFT
                    </CardTitle>
                    {isOwned && (
                        <Badge variant="success" className="gap-1">
                            <Check className="h-3 w-3" />
                            Owned
                        </Badge>
                    )}
                    {!isOwned && isEligible && (
                        <Badge variant="default" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Ready
                        </Badge>
                    )}
                    {!isEligible && (
                        <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Price and XP Bonus */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Mint Price: <span className="font-medium text-foreground">${tier.mint_price_usd}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        XP Bonus: <span className="font-medium text-green-600">+{tier.xp_bonus} XP</span>
                    </div>
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                    {/* XP Requirement */}
                    {tier.xp_requirement > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">XP Required</span>
                                <span className={cn(
                                    'font-medium',
                                    hasRequiredXP ? 'text-green-600' : 'text-orange-600'
                                )}>
                                    {user.xp_total.toLocaleString()} / {tier.xp_requirement.toLocaleString()}
                                </span>
                            </div>
                            <Progress value={getProgressPercentage()} className="h-2" />
                        </div>
                    )}

                    {/* Spend OR Referral Requirement */}
                    {(tier.spend_requirement > 0 || tier.referral_requirement > 0) && (
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Complete ONE of:</div>
                            
                            {/* Spend Option */}
                            {tier.spend_requirement > 0 && (
                                <div className="space-y-1 pl-4 border-l-2 border-muted">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Spend</span>
                                        <span className={cn(
                                            'font-medium',
                                            hasRequiredSpend ? 'text-green-600' : 'text-orange-600'
                                        )}>
                                            ${user.total_spend_usd} / ${tier.spend_requirement}
                                        </span>
                                    </div>
                                    <Progress value={getSpendProgress()} className="h-2" />
                                </div>
                            )}

                            {/* Referral Option */}
                            {tier.referral_requirement > 0 && (
                                <div className="flex items-center justify-between pl-4 border-l-2 border-muted">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>OR {tier.referral_requirement} Referrals</span>
                                    </div>
                                    <span className={cn(
                                        'text-sm font-medium',
                                        hasRequiredReferrals ? 'text-green-600' : 'text-orange-600'
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
                            <span className="text-muted-foreground">Previous Tier NFT</span>
                            <span className={cn(
                                'font-medium',
                                hasPreviousTier ? 'text-green-600' : 'text-orange-600'
                            )}>
                                {hasPreviousTier ? 'Owned' : 'Required'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    {isOwned ? (
                        <Button variant="outline" className="w-full" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            Already Owned
                        </Button>
                    ) : isEligible ? (
                        <Button 
                            className="w-full" 
                            onClick={onMint}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Minting...
                                </>
                            ) : (
                                <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    Mint for ${tier.mint_price_usd}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" disabled>
                            <Lock className="mr-2 h-4 w-4" />
                            Requirements Not Met
                        </Button>
                    )}
                </div>

                {/* Toggle Details */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>

                {/* Detailed Information */}
                {showDetails && (
                    <div className="space-y-2 pt-2 border-t text-xs text-muted-foreground">
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
            </CardContent>
        </Card>
    )
}