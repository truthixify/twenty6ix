'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                {
                    'bg-primary text-primary-foreground hover:bg-primary/80': variant === 'default',
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
                    'bg-green-100 text-green-800 hover:bg-green-200': variant === 'success',
                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': variant === 'warning',
                    'bg-red-100 text-red-800 hover:bg-red-200': variant === 'destructive',
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
                },
                className
            )}
            {...props}
        />
    )
}