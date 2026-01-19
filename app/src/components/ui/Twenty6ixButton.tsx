'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface Twenty6ixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'claim' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export function Twenty6ixButton({ 
    variant = 'primary', 
    size = 'md', 
    className, 
    children, 
    ...props 
}: Twenty6ixButtonProps) {
    const baseStyles = "font-medium rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
        primary: {
            backgroundColor: '#00A3AD',
            color: '#FFFFFF',
            boxShadow: '0 0 20px rgba(0, 163, 173, 0.3)',
            border: 'none'
        },
        claim: {
            background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
            color: '#FFFFFF',
            boxShadow: '0 0 25px rgba(161, 0, 255, 0.4)',
            border: 'none'
        },
        secondary: {
            backgroundColor: 'transparent',
            color: '#00A3AD',
            border: '1px solid #00A3AD',
            boxShadow: 'none'
        }
    }
    
    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg'
    }

    const hoverStyles = {
        primary: 'hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,163,173,0.5)]',
        claim: 'hover:brightness-110 hover:shadow-[0_0_35px_rgba(161,0,255,0.6)]',
        secondary: 'hover:bg-[rgba(0,163,173,0.1)]'
    }

    return (
        <button
            className={cn(
                baseStyles,
                sizes[size],
                hoverStyles[variant],
                className
            )}
            style={variants[variant]}
            {...props}
        >
            {children}
        </button>
    )
}