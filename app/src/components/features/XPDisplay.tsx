'use client'

import React from 'react'
import { Progress } from '@/components/ui/Progress'
import { Card, CardContent } from '@/components/ui/Card'
import { formatXP, calculateXPProgress } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface XPDisplayProps {
    currentXP: number
    nextTierXP?: number
    showProgress?: boolean
    className?: string
}

export function XPDisplay({
    currentXP,
    nextTierXP,
    showProgress = true,
    className,
}: XPDisplayProps) {
    const progress = nextTierXP
        ? calculateXPProgress(currentXP, nextTierXP)
        : 100

    return (
        <Card className={className}>
            <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                        <Zap className='text-primary h-5 w-5' />
                    </div>

                    <div className='flex-1'>
                        <div className='flex items-baseline gap-2'>
                            <span className='text-2xl font-bold'>
                                {formatXP(currentXP)}
                            </span>
                            <span className='text-muted-foreground text-sm'>
                                XP
                            </span>
                            {nextTierXP && currentXP < nextTierXP && (
                                <span className='text-muted-foreground text-xs'>
                                    / {formatXP(nextTierXP)}
                                </span>
                            )}
                        </div>

                        {showProgress &&
                            nextTierXP &&
                            currentXP < nextTierXP && (
                                <div className='mt-2'>
                                    <Progress
                                        value={progress}
                                        className='bg-secondary h-2'
                                    />
                                    <p className='text-muted-foreground mt-1 text-xs'>
                                        {formatXP(nextTierXP - currentXP)} XP to
                                        next tier
                                    </p>
                                </div>
                            )}

                        {currentXP >= (nextTierXP || 0) && nextTierXP && (
                            <p className='mt-1 text-xs text-green-600'>
                                ✓ Tier requirement met!
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
