'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Zap, Gift, Users, Coins, Trophy, Heart } from 'lucide-react'

interface WelcomeScreenProps {
    onSignIn: () => void
    isMiniApp: boolean
    isLoading?: boolean
}

export function WelcomeScreen({ onSignIn, isMiniApp, isLoading = false }: WelcomeScreenProps) {
    return (
        <div className='flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                        Welcome to TWENTY6IX
                    </CardTitle>
                    <p className='text-muted-foreground mt-2'>
                        Earn XP, complete tasks, and mint exclusive NFTs on Base
                    </p>
                    {isMiniApp && (
                        <Badge variant="default" className="mt-2 gap-1">
                            🎉 Farcaster Mini App
                        </Badge>
                    )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {/* Features Preview */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-center">What you can do:</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Gift className="h-4 w-4 text-orange-500" />
                                <span>Daily Claims</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>Referrals</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span>Mint NFTs</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <Trophy className="h-4 w-4 text-purple-500" />
                                <span>Leaderboard</span>
                            </div>
                        </div>
                    </div>

                    {/* XP Economy Preview */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-center">XP Economy</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Daily Claims:</span>
                                <span className="font-medium text-green-600">+10 XP</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Referrals:</span>
                                <span className="font-medium text-green-600">+20 XP</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Donations:</span>
                                <span className="font-medium text-green-600">+50 XP/$1</span>
                            </div>
                            <div className="flex justify-between">
                                <span>NFT Mints:</span>
                                <span className="font-medium text-green-600">+100-3000 XP</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <Button
                        className='w-full'
                        onClick={onSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-4 w-4" />
                                Enter Dashboard (Demo)
                            </>
                        )}
                    </Button>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Built on Base • Powered by Farcaster
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                            Demo Mode: Click to explore the full dashboard
                        </p>
                        {isMiniApp && (
                            <p className="text-xs text-blue-600 mt-1">
                                Optimized for mobile experience
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}