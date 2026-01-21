'use client'

import React from 'react'
import { cn } from '~/lib/utils'

interface Twenty6ixCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'featured' | 'glow'
}

interface Twenty6ixCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

interface Twenty6ixCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
}

interface Twenty6ixCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
    className?: string
}

export function Twenty6ixCard({ children, className, variant = 'default', ...props }: Twenty6ixCardProps) {
    const baseStyles = "rounded-xl border transition-all duration-200"
    
    const variants = {
        default: {
            backgroundColor: 'rgba(26, 35, 50, 0.6)',
            borderColor: '#1A2332',
            backdropFilter: 'blur(10px)'
        },
        featured: {
            background: 'linear-gradient(135deg, rgba(0, 163, 173, 0.1) 0%, rgba(161, 0, 255, 0.1) 100%)',
            borderColor: '#00A3AD',
            boxShadow: '0 0 30px rgba(0, 163, 173, 0.2)'
        },
        glow: {
            backgroundColor: 'rgba(26, 35, 50, 0.8)',
            borderColor: '#A100FF',
            boxShadow: '0 0 25px rgba(161, 0, 255, 0.3)'
        }
    }

    return (
        <div
            className={cn(baseStyles, className)}
            style={variants[variant]}
            {...props}
        >
            {children}
        </div>
    )
}

export function Twenty6ixCardHeader({ children, className, ...props }: Twenty6ixCardHeaderProps) {
    return (
        <div className={cn("p-6 pb-3", className)} {...props}>
            {children}
        </div>
    )
}

export function Twenty6ixCardContent({ children, className, ...props }: Twenty6ixCardContentProps) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
            {children}
        </div>
    )
}

export function Twenty6ixCardTitle({ children, className, ...props }: Twenty6ixCardTitleProps) {
    return (
        <h3 
            className={cn("text-lg font-semibold", className)}
            style={{ color: '#FFFFFF' }}
            {...props}
        >
            {children}
        </h3>
    )
}