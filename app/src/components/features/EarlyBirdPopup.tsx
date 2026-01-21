'use client'

import React, { useState } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { Crown, Zap, X, Users } from 'lucide-react'

interface EarlyBirdPopupProps {
    isOpen: boolean
    onClose: () => void
    onClaim: () => void
    isLoading?: boolean
    userCount?: number // Current number of users who claimed
}

export function EarlyBirdPopup({ 
    isOpen, 
    onClose, 
    onClaim, 
    isLoading = false,
    userCount = 0 
}: EarlyBirdPopupProps) {
    if (!isOpen) return null

    const remainingSlots = Math.max(0, 3000 - userCount)
    const isUrgent = remainingSlots < 500

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Twenty6ixCard className="max-w-md w-full relative animate-in fade-in-0 zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#B8C1D0] hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <Twenty6ixCardHeader className="text-center pb-3">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <Crown className="h-16 w-16 text-[#A100FF]" />
                            <div className="absolute -top-2 -right-2">
                                <Twenty6ixBadge variant="success" className="text-xs">
                                    FREE
                                </Twenty6ixBadge>
                            </div>
                        </div>
                    </div>
                    
                    <Twenty6ixCardTitle className="text-xl mb-2">
                        🎉 Early Bird NFT Available!
                    </Twenty6ixCardTitle>
                    
                    <p className="text-[#B8C1D0] text-sm">
                        You're among the first users! Claim your exclusive Early Bird NFT now.
                    </p>
                </Twenty6ixCardHeader>

                <Twenty6ixCardContent className="space-y-4">
                    {/* Urgency Indicator */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-[#00A3AD]" />
                            <span className="text-sm text-[#B8C1D0]">
                                {userCount.toLocaleString()} / 3,000 claimed
                            </span>
                        </div>
                        
                        {isUrgent && (
                            <Twenty6ixBadge variant="warning" className="gap-1">
                                <Zap className="h-3 w-3" />
                                Only {remainingSlots.toLocaleString()} left!
                            </Twenty6ixBadge>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-white text-center">What you get:</h4>
                        <ul className="space-y-1 text-sm text-[#B8C1D0]">
                            <li className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-[#A100FF]" />
                                <span>100 XP bonus instantly</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Crown className="h-3 w-3 text-[#A100FF]" />
                                <span>Exclusive Early Bird status</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-[#A100FF]" />
                                <span>Limited to first 3,000 users</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        <Twenty6ixButton
                            variant="claim"
                            className="w-full"
                            onClick={onClaim}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Claiming...
                                </>
                            ) : (
                                <>
                                    <Crown className="h-4 w-4" />
                                    Claim Early Bird NFT
                                </>
                            )}
                        </Twenty6ixButton>
                        
                        <Twenty6ixButton
                            variant="secondary"
                            className="w-full"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Maybe Later
                        </Twenty6ixButton>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-[#6E7688] text-center">
                        This offer is available only to the first 3,000 users. Once claimed, it cannot be transferred.
                    </p>
                </Twenty6ixCardContent>
            </Twenty6ixCard>
        </div>
    )
}