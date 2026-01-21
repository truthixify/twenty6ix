'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card'
import { Button } from '~/components/ui/Button'
import { Badge } from '~/components/ui/Badge'
import { Progress } from '~/components/ui/Progress'
import { Share2, Copy, Users, Zap, Gift, ExternalLink } from 'lucide-react'
import { Profile } from '~/types/twenty6ix'

interface ReferralCardProps {
    user: Profile | null
    onShare: () => void
    isLoading?: boolean
}

export function ReferralCard({ user, onShare, isLoading = false }: ReferralCardProps) {
    const [copied, setCopied] = useState(false)
    
    // Demo data - in real app this would come from database
    const referralStats = {
        totalReferrals: 3,
        maxReferrals: 15,
        xpEarned: 60, // 3 * 20 XP
        pendingReferrals: 1
    }

    const referralProgress = (referralStats.totalReferrals / referralStats.maxReferrals) * 100

    const handleCopyCode = async () => {
        if (user?.referral_code) {
            try {
                await navigator.clipboard.writeText(user.referral_code)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy referral code:', err)
            }
        }
    }

    const generateReferralUrl = () => {
        if (user?.referral_code) {
            return `${process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.com'}?ref=${user.referral_code}`
        }
        return ''
    }

    if (!user) return null

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Referral Program
                    </CardTitle>
                    <Badge variant="default" className="gap-1">
                        <Zap className="h-3 w-3" />
                        20 XP each
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Referral Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Referrals Made:</span>
                        <span className="font-medium">
                            {referralStats.totalReferrals} / {referralStats.maxReferrals}
                        </span>
                    </div>
                    <Progress value={referralProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>XP Earned: {referralStats.xpEarned}</span>
                        <span>{referralStats.maxReferrals - referralStats.totalReferrals} remaining</span>
                    </div>
                </div>

                {/* Referral Code */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Referral Code</label>
                    <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {user.referral_code}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyCode}
                            className="px-3"
                        >
                            {copied ? (
                                <>
                                    <Gift className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                    {copied && (
                        <p className="text-xs text-green-600">Referral code copied!</p>
                    )}
                </div>

                {/* Referral URL */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Referral Link</label>
                    <div className="p-2 bg-muted rounded-md text-xs text-muted-foreground break-all">
                        {generateReferralUrl()}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        onClick={onShare}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://warpcast.com/~/compose?text=Join me on TWENTY6IX and earn XP! Use my referral code: ${user.referral_code} ${generateReferralUrl()}`, '_blank')}
                        className="gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Cast
                    </Button>
                </div>

                {/* Referral Stats */}
                {referralStats.pendingReferrals > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="font-medium">
                                {referralStats.pendingReferrals} referral{referralStats.pendingReferrals > 1 ? 's' : ''} pending
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            XP will be awarded once your referrals complete their first action.
                        </p>
                    </div>
                )}

                {/* How it Works */}
                <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">How Referrals Work</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Share your code with friends</li>
                        <li>• Earn 20 XP when they join and complete first action</li>
                        <li>• Maximum 15 referrals per user (300 XP total)</li>
                        <li>• Referrals count toward NFT tier requirements</li>
                    </ul>
                </div>

                {/* Referral Leaderboard Teaser */}
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Referral Rank:</span>
                        <Badge variant="secondary">#12</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Top referrers get bonus rewards in future phases!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}