'use client'

import React, { useState } from 'react'
import { useApp } from '~/contexts/AppContext'
import { NFTCard } from '~/components/features/NFTCard'
import { Twenty6ixCard, Twenty6ixCardContent } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { useToast } from '~/components/ui/Toast'
import { NFT_TIERS } from '~/lib/web3'
import { Profile } from '~/types/twenty6ix'

export function NFTCollectionContent() {
    const { state, updateProfile, dispatch } = useApp()
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleNFTMint = async (tierType: string) => {
        if (!state.user) return

        try {
            setIsLoading(true)
            console.log('🎯 Minting NFT:', tierType, 'for user:', state.user.fid)
            
            // Get the tier info
            const tier = NFT_TIERS[tierType as keyof typeof NFT_TIERS]
            if (!tier) {
                throw new Error('Invalid tier type')
            }
            
            // Check if user has enough XP
            if (state.user.xp_total < tier.xp_requirement) {
                console.error('❌ Insufficient XP for minting')
                showToast(`❌ Need ${tier.xp_requirement.toLocaleString()} XP to mint ${tier.name} NFT`, 'error')
                return
            }
            
            // Check mint limits per user
            let currentMintCount = 0
            let mintCountField: keyof Profile
            
            switch (tierType) {
                case 'silver':
                    currentMintCount = state.user.silver_nft_count || 0
                    mintCountField = 'silver_nft_count'
                    break
                case 'gold':
                    currentMintCount = state.user.gold_nft_count || 0
                    mintCountField = 'gold_nft_count'
                    break
                case 'platinum':
                    currentMintCount = state.user.platinum_nft_count || 0
                    mintCountField = 'platinum_nft_count'
                    break
                default:
                    // Early Bird doesn't have a limit check here since it's handled separately
                    mintCountField = 'silver_nft_count' // fallback
            }
            
            if (tier.max_mints_per_user && currentMintCount >= tier.max_mints_per_user) {
                console.error('❌ Mint limit reached for', tierType)
                showToast(`❌ Maximum ${tier.max_mints_per_user} ${tier.name} NFTs per user`, 'error')
                return
            }
            
            // TODO: Implement actual NFT minting via API
            await new Promise(resolve => setTimeout(resolve, 3000))
            
            // Update user XP with bonus and increment mint count
            const newXP = state.user.xp_total + tier.xp_bonus
            const newMintCount = currentMintCount + 1
            
            console.log('✅ Updating user XP from', state.user.xp_total, 'to', newXP, `(+${tier.xp_bonus} bonus)`)
            console.log('✅ Updating', tierType, 'mint count from', currentMintCount, 'to', newMintCount)
            
            const updatedUser = {
                ...state.user,
                xp_total: newXP,
                [mintCountField]: newMintCount
            }
            
            // Update via dispatch for immediate UI update
            dispatch({ type: 'SET_USER', payload: updatedUser })
            
            // Also update via updateProfile for database sync (if available)
            try {
                await updateProfile({ 
                    xp_total: newXP,
                    [mintCountField]: newMintCount
                })
                console.log('✅ Profile updated in database')
            } catch (dbError) {
                console.warn('⚠️ Database update failed, but XP updated locally:', dbError)
            }
            
            console.log(`🎉 ${tier.name} NFT minted successfully! +${tier.xp_bonus} XP`)
            showToast(`🎉 ${tier.name} NFT minted! +${tier.xp_bonus} XP (${newMintCount}/${tier.max_mints_per_user})`, 'success')
            
        } catch (error) {
            console.error('❌ NFT minting failed:', error)
            showToast('❌ NFT minting failed', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    // Upcoming NFTs for sneak peek
    const upcomingNFTs = [
        {
            name: "Diamond Tier",
            description: "Ultra-rare NFT for top performers",
            xp_requirement: "25,000 XP",
            status: "Coming Soon"
        },
        {
            name: "Legendary Tier", 
            description: "Exclusive NFT for community leaders",
            xp_requirement: "50,000 XP",
            status: "In Development"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">NFT Collection</h1>
                <p className="text-[#B8C1D0]">Mint exclusive NFTs as you progress through the tiers. All values shown are XP requirements only.</p>
            </div>

            {/* Available NFTs */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Available NFTs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(NFT_TIERS).map((tier) => (
                        <NFTCard
                            key={tier.type}
                            tier={tier}
                            user={state.user}
                            isOwned={false}
                            onMint={() => handleNFTMint(tier.type)}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            </div>

            {/* Sneak Peek Section - Required by PRD */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">🔮 Sneak Peek - Upcoming NFTs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingNFTs.map((nft, index) => (
                        <Twenty6ixCard key={index} className="opacity-75">
                            <Twenty6ixCardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-white">{nft.name}</h3>
                                    <Twenty6ixBadge variant="secondary">{nft.status}</Twenty6ixBadge>
                                </div>
                                <p className="text-sm text-[#B8C1D0] mb-2">{nft.description}</p>
                                <div className="text-xs text-[#6E7688]">
                                    Estimated Requirement: {nft.xp_requirement}
                                </div>
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>
                    ))}
                </div>
                <p className="text-xs text-[#6E7688] mt-3 text-center">
                    * Upcoming NFTs are subject to change. Requirements and availability may vary.
                </p>
            </div>
        </div>
    )
}