'use client'

import React, { useState } from 'react'
import { useApp } from '~/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card'
import { Button } from '~/components/ui/Button'
import { Badge } from '~/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/TabsComponent'
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import { NFT_TIERS } from '~/lib/web3'
import { AppLayout } from '~/components/layout/AppLayout'

export function InformationContent() {
    const { miniApp } = useApp()
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [infoTab, setInfoTab] = useState('about')

    return (
        <AppLayout currentPage="information">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Platform Information</h1>
                    <p className="text-muted-foreground">Learn about TWENTY6IX, view our roadmap, and get answers to common questions.</p>
                </div>

                {/* Sub-navigation */}
                <Tabs value={infoTab} onValueChange={setInfoTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                    </TabsList>

                    {/* About Tab */}
                    <TabsContent value="about" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>How to Earn XP</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <span className="text-sm">Daily claims</span>
                                            <Badge variant="secondary">10 XP</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <span className="text-sm">Donations</span>
                                            <Badge variant="secondary">50 XP/$1</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <span className="text-sm">Referrals</span>
                                            <Badge variant="secondary">20 XP each</Badge>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                            <span className="text-sm">Social tasks</span>
                                            <Badge variant="secondary">5 XP each</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>NFT Tiers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.values(NFT_TIERS).map((tier) => (
                                            <div key={tier.type} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{tier.name}</span>
                                                    <Badge variant="secondary">${tier.mint_price_usd}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {tier.xp_requirement > 0 && `${tier.xp_requirement.toLocaleString()} XP required`}
                                                    {tier.spend_requirement > 0 && ` • ${tier.spend_requirement} spend OR 15 referrals`}
                                                    {tier.requires_previous_tier && ` • Previous tier required`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Platform Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Network:</span>
                                            <span className="font-medium">Base (Ethereum L2)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Framework:</span>
                                            <span className="font-medium">Farcaster Mini App</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Authentication:</span>
                                            <span className="font-medium">Sign-In With Farcaster</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Database:</span>
                                            <span className="font-medium">Supabase (Real-time)</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>External Links</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => miniApp.openUrl('https://warpcast.com/twenty6ix')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Follow @twenty6ix on Farcaster
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => miniApp.openUrl('https://base.org')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Learn about Base Network
                                    </Button>
                                </CardContent>
                            </Card>
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
                                <Card key={faq.id} className="overflow-hidden">
                                    <CardHeader 
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{faq.question}</CardTitle>
                                            {expandedFAQ === faq.id ? (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    {expandedFAQ === faq.id && (
                                        <CardContent className="pt-0">
                                            <p className="text-muted-foreground">
                                                {faq.answer}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Roadmap Tab */}
                    <TabsContent value="roadmap" className="space-y-6">
                        <div className="space-y-6">
                            {/* Phase 1 */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <CardTitle className="text-lg">Phase 1 – Launch & Growth</CardTitle>
                                            <p className="text-sm text-muted-foreground">Q1-Q2 2026</p>
                                        </div>
                                        <Badge variant="success">Current Phase</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Early Birds NFT Claim</h4>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Wallet connect via Sign-In with Farcaster
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Unlimited daily claims system
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Social tasks integration
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Real-time leaderboard
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Phase 2 */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <div>
                                            <CardTitle className="text-lg">Phase 2 – Features & Boosts</CardTitle>
                                            <p className="text-sm text-muted-foreground">Q2-Q3 2026</p>
                                        </div>
                                        <Badge variant="secondary">Coming Soon</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Unlock Exclusive NFT Minting</h4>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Silver NFT tier unlocked
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Gold NFT tier unlocked
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                Enhanced referral system
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Phase 3 */}
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <div>
                                            <CardTitle className="text-lg">Phase 3 – Token Generation Event</CardTitle>
                                            <p className="text-sm text-muted-foreground">Q3 2026</p>
                                        </div>
                                        <Badge variant="secondary">Future</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Fair Token Launch on Base</h4>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Platinum NFT tier
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Token rewards & utility system
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                Governance token launch
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}