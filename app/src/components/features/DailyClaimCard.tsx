'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Gift, Clock, Zap, DollarSign } from 'lucide-react'
import { FEES, XP_REWARDS } from '@/lib/web3'

interface DailyClaimCardProps {
    lastClaimTime?: string
    onClaim: () => void
    isLoading?: boolean
}

export function DailyClaimCard({ lastClaimTime, onClaim, isLoading = false }: DailyClaimCardProps) {
    const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0)
    const [canClaim, setCanClaim] = useState(false)

    useEffect(() => {
        const updateTimer = () => {
            if (!lastClaimTime) {
                setCanClaim(true)
                setTimeUntilNextClaim(0)
                return
            }

            const lastClaim = new Date(lastClaimTime)
            const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000) // 24 hours
            const now = new Date()
            const timeDiff = nextClaimTime.getTime() - now.getTime()

            if (timeDiff <= 0) {
                setCanClaim(true)
                setTimeUntilNextClaim(0)
            } else {
                setCanClaim(false)
                setTimeUntilNextClaim(timeDiff)
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [lastClaimTime])

    const formatTimeRemaining = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60))
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((ms % (1000 * 60)) / 1000)

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`
        } else {
            return `${seconds}s`
        }
    }

    const getProgressPercentage = () => {
        if (!lastClaimTime || canClaim) return 100
        
        const lastClaim = new Date(lastClaimTime)
        const nextClaimTime = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
        const now = new Date()
        
        const totalCooldown = 24 * 60 * 60 * 1000 // 24 hours in ms
        const elapsed = now.getTime() - lastClaim.getTime()
        
        return Math.min((elapsed / totalCooldown) * 100, 100)
    }

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-orange-500" />
                        Daily Claim
                    </CardTitle>
                    {canClaim ? (
                        <Badge variant="success" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Ready!
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Cooldown
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rewards Info */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span>Reward: <span className="font-medium text-green-600">+{XP_REWARDS.DAILY_CLAIM} XP</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>Cost: <span className="font-medium text-foreground">${FEES.DAILY_CLAIM}</span></span>
                    </div>
                </div>

                {/* Cooldown Progress */}
                {!canClaim && timeUntilNextClaim > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Next claim in:</span>
                            <span className="font-mono font-medium">
                                {formatTimeRemaining(timeUntilNextClaim)}
                            </span>
                        </div>
                        <Progress value={getProgressPercentage()} className="h-2" />
                    </div>
                )}

                {/* Action Button */}
                <Button 
                    className="w-full" 
                    onClick={onClaim}
                    disabled={!canClaim || isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : canClaim ? (
                        <>
                            <Gift className="mr-2 h-4 w-4" />
                            Claim {XP_REWARDS.DAILY_CLAIM} XP
                        </>
                    ) : (
                        <>
                            <Clock className="mr-2 h-4 w-4" />
                            {formatTimeRemaining(timeUntilNextClaim)} remaining
                        </>
                    )}
                </Button>

                {/* Description */}
                <p className="text-xs text-muted-foreground text-center">
                    Claim your daily XP reward every 24 hours. Small fee helps maintain the platform.
                </p>
            </CardContent>
        </Card>
    )
}