'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Heart, Zap, DollarSign } from 'lucide-react'
import { XP_REWARDS } from '@/lib/web3'

interface DonationCardProps {
    onDonate: (amount: number) => void
    isLoading?: boolean
}

const DONATION_AMOUNTS = [1, 5, 10, 25, 50, 100]

export function DonationCard({ onDonate, isLoading = false }: DonationCardProps) {
    const [customAmount, setCustomAmount] = useState('')
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

    const handleDonate = (amount: number) => {
        if (amount >= 1) {
            onDonate(amount)
        }
    }

    const handleCustomDonate = () => {
        const amount = parseFloat(customAmount)
        if (amount >= 1) {
            handleDonate(amount)
            setCustomAmount('')
        }
    }

    const calculateXP = (amount: number) => {
        return Math.floor(amount * XP_REWARDS.DONATION_PER_USD)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Support TWENTY6IX
                    </CardTitle>
                    <Badge variant="default" className="gap-1">
                        <Zap className="h-3 w-3" />
                        {XP_REWARDS.DONATION_PER_USD} XP/$1
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Support the platform and earn XP! Every $1 donated gives you {XP_REWARDS.DONATION_PER_USD} XP.
                </p>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    {DONATION_AMOUNTS.map((amount) => (
                        <Button
                            key={amount}
                            variant={selectedAmount === amount ? "default" : "outline"}
                            size="sm"
                            className="flex flex-col h-auto py-2"
                            onClick={() => {
                                setSelectedAmount(amount)
                                handleDonate(amount)
                            }}
                            disabled={isLoading}
                        >
                            <span className="font-semibold">${amount}</span>
                            <span className="text-xs opacity-75">
                                +{calculateXP(amount)} XP
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Amount</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Enter amount"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <Button
                            onClick={handleCustomDonate}
                            disabled={!customAmount || parseFloat(customAmount) < 1 || isLoading}
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            ) : (
                                'Donate'
                            )}
                        </Button>
                    </div>
                    {customAmount && parseFloat(customAmount) >= 1 && (
                        <p className="text-xs text-muted-foreground">
                            You'll earn {calculateXP(parseFloat(customAmount))} XP
                        </p>
                    )}
                </div>

                {/* Info */}
                <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Why donate?</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Support platform development</li>
                        <li>• Earn XP to unlock NFT tiers faster</li>
                        <li>• Help maintain server costs</li>
                        <li>• Show appreciation for the team</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}