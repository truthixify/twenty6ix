'use client'

import React, { useState } from 'react'
import { useApp } from '~/contexts/AppContext'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/TabsComponent'
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { NFT_TIERS } from '~/lib/web3'

export function InformationContent() {
    const { miniApp } = useApp()
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [infoTab, setInfoTab] = useState('about')

    return (
        <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Platform Information</h1>
                    <p className="text-[#B8C1D0]">Learn about TWENTY6IX, view our roadmap, and get answers to common questions.</p>
                </div>

                {/* Sub-navigation */}
                <Tabs value={infoTab} onValueChange={setInfoTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0A0F1A] border border-[#00A3AD]/20">
                        <TabsTrigger value="about" className="data-[state=active]:bg-[#00A3AD] data-[state=active]:text-white">About</TabsTrigger>
                        <TabsTrigger value="faq" className="data-[state=active]:bg-[#00A3AD] data-[state=active]:text-white">FAQ</TabsTrigger>
                        <TabsTrigger value="roadmap" className="data-[state=active]:bg-[#00A3AD] data-[state=active]:text-white">Roadmap</TabsTrigger>
                    </TabsList>

                    {/* About Tab */}
                    <TabsContent value="about" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Twenty6ixCard>
                                <Twenty6ixCardHeader>
                                    <Twenty6ixCardTitle>How to Earn XP</Twenty6ixCardTitle>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-[#0A0F1A]/50 rounded border border-[#00A3AD]/10">
                                            <span className="text-sm text-[#B8C1D0]">Daily claims</span>
                                            <Twenty6ixBadge variant="secondary">10 XP</Twenty6ixBadge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-[#0A0F1A]/50 rounded border border-[#00A3AD]/10">
                                            <span className="text-sm text-[#B8C1D0]">Donations</span>
                                            <Twenty6ixBadge variant="secondary">50 XP/$1</Twenty6ixBadge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-[#0A0F1A]/50 rounded border border-[#00A3AD]/10">
                                            <span className="text-sm text-[#B8C1D0]">Referrals</span>
                                            <Twenty6ixBadge variant="secondary">20 XP each</Twenty6ixBadge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-[#0A0F1A]/50 rounded border border-[#00A3AD]/10">
                                            <span className="text-sm text-[#B8C1D0]">Social tasks</span>
                                            <Twenty6ixBadge variant="secondary">5 XP each</Twenty6ixBadge>
                                        </div>
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>

                            <Twenty6ixCard>
                                <Twenty6ixCardHeader>
                                    <Twenty6ixCardTitle>NFT Tiers</Twenty6ixCardTitle>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent>
                                    <div className="space-y-3">
                                        {Object.values(NFT_TIERS).map((tier) => (
                                            <div key={tier.type} className="p-3 border border-[#00A3AD]/20 rounded-lg bg-[#0A0F1A]/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-white">{tier.name}</span>
                                                    <Twenty6ixBadge variant="secondary">${tier.mint_price_usd}</Twenty6ixBadge>
                                                </div>
                                                <div className="text-xs text-[#B8C1D0]">
                                                    {tier.xp_requirement > 0 && `${tier.xp_requirement.toLocaleString()} XP required`}
                                                    {tier.spend_requirement > 0 && ` • ${tier.spend_requirement} spend OR 15 referrals`}
                                                    {tier.requires_previous_tier && ` • Previous tier required`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>

                            <Twenty6ixCard>
                                <Twenty6ixCardHeader>
                                    <Twenty6ixCardTitle>Platform Information</Twenty6ixCardTitle>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Network:</span>
                                            <span className="font-medium text-white">Base (Ethereum L2)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Framework:</span>
                                            <span className="font-medium text-white">Farcaster Mini App</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Authentication:</span>
                                            <span className="font-medium text-white">Sign-In With Farcaster</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Database:</span>
                                            <span className="font-medium text-white">Supabase (Real-time)</span>
                                        </div>
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>

                            <Twenty6ixCard>
                                <Twenty6ixCardHeader>
                                    <Twenty6ixCardTitle>External Links</Twenty6ixCardTitle>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent className="space-y-3">
                                    <Twenty6ixButton
                                        variant="secondary"
                                        className="w-full justify-start"
                                        onClick={() => miniApp.openUrl('https://warpcast.com/twenty6ix')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Follow @twenty6ix on Farcaster
                                    </Twenty6ixButton>
                                    <Twenty6ixButton
                                        variant="secondary"
                                        className="w-full justify-start"
                                        onClick={() => miniApp.openUrl('https://base.org')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Learn about Base Network
                                    </Twenty6ixButton>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>
                        </div>
                    </TabsContent>

                    {/* FAQ Tab */}
                    <TabsContent value="faq" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                {
                                    id: 'what-is',
                                    question: 'What is TWENTY6IX?',
                                    answer: 'A Farcaster Mini App for daily fun. Connect your wallet, complete simple social tasks (likes, retweets, comments), mint exclusive NFTs, claim rewards, refer friends and climb the leaderboard. Built for fun, engagement, and real onchain ownership.'
                                },
                                {
                                    id: 'get-started',
                                    question: 'How do I get started?',
                                    answer: 'Open the app in Warpcast — your wallet connects automatically via Sign-In with Farcaster. No extra sign-ups or downloads needed.'
                                },
                                {
                                    id: 'mint-nfts',
                                    question: 'When can I mint NFTs?',
                                    answer: 'NFT minting will unlock in later phases as we hit milestones for Early supporters and active users.'
                                },
                                {
                                    id: 'donations',
                                    question: 'What about donations?',
                                    answer: 'Completely optional from day 1, onchain. Donating earns you bonus XP (points) toward the leaderboard and future perks.'
                                },
                                {
                                    id: 'costs',
                                    question: 'Are there costs involved?',
                                    answer: 'Tiny Base network fees (usually under a penny) for onchain actions like minting. Tasks and daily claims are low-cost or free. NFT mints have their own prices.'
                                },
                                {
                                    id: 'earnings',
                                    question: 'What do I actually earn?',
                                    answer: 'Points for the leaderboard, exclusive NFTs, and future token rewards (coming soon). Top players will get extra perks.'
                                },
                                {
                                    id: 'support',
                                    question: 'How can I give feedback or get support?',
                                    answer: 'Reply to our casts, join our community channel across Telegram and X. We are building this together!'
                                }
                            ].map((faq) => (
                                <Twenty6ixCard key={faq.id} className="overflow-hidden">
                                    <Twenty6ixCardHeader 
                                        className="cursor-pointer hover:bg-[#00A3AD]/10 transition-colors"
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Twenty6ixCardTitle className="text-lg">{faq.question}</Twenty6ixCardTitle>
                                            {expandedFAQ === faq.id ? (
                                                <ChevronDown className="h-5 w-5 text-[#B8C1D0]" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-[#B8C1D0]" />
                                            )}
                                        </div>
                                    </Twenty6ixCardHeader>
                                    {expandedFAQ === faq.id && (
                                        <Twenty6ixCardContent className="pt-0">
                                            <p className="text-[#B8C1D0]">
                                                {faq.answer}
                                            </p>
                                        </Twenty6ixCardContent>
                                    )}
                                </Twenty6ixCard>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap" className="space-y-6">
                        <div className="space-y-6">
                            {/* Phase 1 */}
                            <Twenty6ixCard className="border-l-4 border-l-[#00A3AD]">
                                <Twenty6ixCardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-[#00A3AD] rounded-full shadow-[0_0_10px_rgba(0,163,173,0.5)]"></div>
                                        <div>
                                            <Twenty6ixCardTitle className="text-lg">Phase 1 – Launch & Growth</Twenty6ixCardTitle>
                                            <p className="text-sm text-[#B8C1D0]">Q1-Q2 2026</p>
                                        </div>
                                        <Twenty6ixBadge variant="primary">Current Phase</Twenty6ixBadge>
                                    </div>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-white">Early Birds NFT Claim</h4>
                                        <ul className="space-y-2 text-sm text-[#B8C1D0]">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#00A3AD] rounded-full"></div>
                                                Wallet connect via Sign-In with Farcaster
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#00A3AD] rounded-full"></div>
                                                Unlimited daily claims system
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#00A3AD] rounded-full"></div>
                                                Social tasks integration
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#00A3AD] rounded-full"></div>
                                                Real-time leaderboard
                                            </li>
                                        </ul>
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>

                            {/* Phase 2 */}
                            <Twenty6ixCard className="border-l-4 border-l-[#A100FF]">
                                <Twenty6ixCardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-[#A100FF] rounded-full shadow-[0_0_10px_rgba(161,0,255,0.5)]"></div>
                                        <div>
                                            <Twenty6ixCardTitle className="text-lg">Phase 2 – Features & Boosts</Twenty6ixCardTitle>
                                            <p className="text-sm text-[#B8C1D0]">Q2-Q3 2026</p>
                                        </div>
                                        <Twenty6ixBadge variant="secondary">Coming Soon</Twenty6ixBadge>
                                    </div>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-white">Unlock Exclusive NFT Minting</h4>
                                        <ul className="space-y-2 text-sm text-[#B8C1D0]">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#A100FF] rounded-full"></div>
                                                Silver NFT tier unlocked
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#A100FF] rounded-full"></div>
                                                Gold NFT tier unlocked
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-[#A100FF] rounded-full"></div>
                                                Enhanced referral system
                                            </li>
                                        </ul>
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>

                            {/* Phase 3 */}
                            <Twenty6ixCard className="border-l-4 border-l-gradient-to-b from-[#00A3AD] to-[#A100FF]">
                                <Twenty6ixCardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-gradient-to-r from-[#00A3AD] to-[#A100FF] rounded-full shadow-[0_0_10px_rgba(0,163,173,0.3),0_0_10px_rgba(161,0,255,0.3)]"></div>
                                        <div>
                                            <Twenty6ixCardTitle className="text-lg">Phase 3 – Token Generation Event</Twenty6ixCardTitle>
                                            <p className="text-sm text-[#B8C1D0]">Q3 2026</p>
                                        </div>
                                        <Twenty6ixBadge variant="secondary">Future</Twenty6ixBadge>
                                    </div>
                                </Twenty6ixCardHeader>
                                <Twenty6ixCardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-white">Fair Token Launch on Base</h4>
                                        <ul className="space-y-2 text-sm text-[#B8C1D0]">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-[#00A3AD] to-[#A100FF] rounded-full"></div>
                                                Platinum NFT tier
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-[#00A3AD] to-[#A100FF] rounded-full"></div>
                                                Token rewards & utility system
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-[#00A3AD] to-[#A100FF] rounded-full"></div>
                                                Governance token launch
                                            </li>
                                        </ul>
                                    </div>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
    )
}