'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface Twenty6ixProgressProps {
    value: number
    max?: number
    className?: string
    variant?: 'default' | 'gradient'
}

export function Twenty6ixProgress({ value, max = 100, className, variant = 'default' }: Twenty6ixProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const trackStyles = {
        backgroundColor: 'rgba(26, 35, 50, 0.8)',
        border: '1px solid #1A2332'
    }
    
    const fillStyles = {
        default: {
            backgroundColor: '#00A3AD',
            boxShadow: '0 0 10px rgba(0, 163, 173, 0.5)'
        },
        gradient: {
            background: 'linear-gradient(90deg, #00A3AD 0%, #A100FF 100%)',
            boxShadow: '0 0 15px rgba(161, 0, 255, 0.4)'
        }
    }

    return (
        <div 
            className={cn("relative h-3 w-full overflow-hidden rounded-full", className)}
            style={trackStyles}
        >
            <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                    width: `${percentage}%`,
                    ...fillStyles[variant]
                }}
            />
        </div>
    )
}