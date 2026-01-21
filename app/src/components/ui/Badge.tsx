'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                {
                    'bg-[#00A3AD] text-white hover:bg-[#00A3AD]/80 shadow-[0_0_10px_rgba(0,163,173,0.3)]': variant === 'default',
                    'bg-[#0A0F1A]/80 text-[#B8C1D0] border border-[#00A3AD]/20 hover:bg-[#0A0F1A]': variant === 'secondary',
                    'bg-[#00A3AD]/20 text-[#00A3AD] border border-[#00A3AD]/30 hover:bg-[#00A3AD]/30': variant === 'success',
                    'bg-[#A100FF]/20 text-[#A100FF] border border-[#A100FF]/30 hover:bg-[#A100FF]/30': variant === 'warning',
                    'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30': variant === 'destructive',
                    'border border-[#00A3AD]/30 bg-transparent text-[#00A3AD] hover:bg-[#00A3AD]/10': variant === 'outline',
                },
                className
            )}
            {...props}
        />
    )
}