'use client'

import React, { useState } from 'react'
import { useApp } from '~/contexts/AppContext'
import { NFTCard } from '~/components/features/NFTCard'
import { NFT_TIERS } from '~/lib/web3'

export function NFTCollectionContent() {
    const { state } = useApp()
    const [isLoading, setIsLoading] = useState(false)

    const handleNFTMint = async (tierType: string) => {
        if (!state.user) return

        try {
            setIsLoading(true)
            
            // TODO: Implement actual NFT minting
            
            // Simulate minting delay
            await new Promise(resolve => setTimeout(resolve, 3000))
            
        } catch (error) {
            // NFT minting failed
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">NFT Collection</h1>
                    <p className="text-[#B8C1D0]">Mint exclusive NFTs as you progress through the tiers.</p>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
                    <div className="space-y-4">
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
            </div>
    )
}