'use client'

import React from 'react'
import { Twenty6ixProgress } from '~/components/ui/Twenty6ixProgress'
import { Twenty6ixCard, Twenty6ixCardContent } from '~/components/ui/Twenty6ixCard'
import { formatXP, calculateXPProgress } from '~/lib/utils'
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
        <Twenty6ixCard variant="featured" className={className}>
            <Twenty6ixCardContent className='p-6'>
                <div className='flex items-center gap-4'>
                    <div 
                        className='flex h-12 w-12 items-center justify-center rounded-full'
                        style={{
                            backgroundColor: 'rgba(0, 163, 173, 0.2)',
                            border: '1px solid #00A3AD'
                        }}
                    >
                        <Zap 
                            className='h-6 w-6'
                            style={{ color: '#00A3AD' }}
                        />
                    </div>

                    <div className='flex-1'>
                        <div className='flex items-baseline gap-2'>
                            <span 
                                className='text-3xl font-bold'
                                style={{ color: '#00A3AD' }}
                            >
                                {formatXP(currentXP)}
                            </span>
                            <span 
                                className='text-lg font-medium'
                                style={{ color: '#B8C1D0' }}
                            >
                                XP
                            </span>
                            {nextTierXP && currentXP < nextTierXP && (
                                <span 
                                    className='text-sm'
                                    style={{ color: '#6E7688' }}
                                >
                                    / {formatXP(nextTierXP)}
                                </span>
                            )}
                        </div>

                        {showProgress &&
                            nextTierXP &&
                            currentXP < nextTierXP && (
                                <div className='mt-3'>
                                    <Twenty6ixProgress
                                        value={progress}
                                        variant="gradient"
                                        className='h-3'
                                    />
                                    <p 
                                        className='mt-2 text-sm'
                                        style={{ color: '#B8C1D0' }}
                                    >
                                        {formatXP(nextTierXP - currentXP)} XP to next tier
                                    </p>
                                </div>
                            )}

                        {currentXP >= (nextTierXP || 0) && nextTierXP && (
                            <p 
                                className='mt-2 text-sm font-medium'
                                style={{ color: '#22C55E' }}
                            >
                                ✓ Tier requirement met!
                            </p>
                        )}
                    </div>
                </div>
            </Twenty6ixCardContent>
        </Twenty6ixCard>
    )
}
