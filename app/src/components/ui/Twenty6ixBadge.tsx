'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface Twenty6ixBadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'admin'
    className?: string
}

export function Twenty6ixBadge({ children, variant = 'default', className }: Twenty6ixBadgeProps) {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200"
    
    const variants = {
        default: {
            backgroundColor: '#00A3AD',
            color: '#FFFFFF',
            boxShadow: '0 0 10px rgba(0, 163, 173, 0.3)'
        },
        secondary: {
            backgroundColor: 'rgba(184, 193, 208, 0.2)',
            color: '#B8C1D0',
            border: '1px solid rgba(184, 193, 208, 0.3)'
        },
        success: {
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.3)'
        },
        warning: {
            backgroundColor: 'rgba(251, 191, 36, 0.2)',
            color: '#FBBF24',
            border: '1px solid rgba(251, 191, 36, 0.3)'
        },
        error: {
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)'
        },
        admin: {
            background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
            color: '#FFFFFF',
            boxShadow: '0 0 15px rgba(161, 0, 255, 0.4)'
        }
    }

    const hoverStyles = {
        default: 'hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,163,173,0.5)]',
        secondary: 'hover:bg-[rgba(184,193,208,0.3)]',
        success: 'hover:bg-[rgba(34,197,94,0.3)]',
        warning: 'hover:bg-[rgba(251,191,36,0.3)]',
        error: 'hover:bg-[rgba(239,68,68,0.3)]',
        admin: 'hover:brightness-110 hover:shadow-[0_0_20px_rgba(161,0,255,0.6)]'
    }

    return (
        <span
            className={cn(
                baseStyles,
                hoverStyles[variant],
                className
            )}
            style={variants[variant]}
        >
            {children}
        </span>
    )
}