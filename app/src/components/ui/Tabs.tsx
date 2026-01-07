'use client'

import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
    value: string
    onValueChange?: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
    value: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1',
            className
        )}
        {...props}
    />
))
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, onClick, ...props }, ref) => {
        const context = useContext(TabsContext)
        if (!context) {
            throw new Error('TabsTrigger must be used within Tabs')
        }

        const isActive = context.value === value

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            context.onValueChange?.(value)
            onClick?.(e)
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                    isActive
                        ? 'bg-background text-foreground shadow'
                        : 'text-muted-foreground hover:text-foreground',
                    className
                )}
                onClick={handleClick}
                data-state={isActive ? 'active' : 'inactive'}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = useContext(TabsContext)
        if (!context) {
            throw new Error('TabsContent must be used within Tabs')
        }

        if (context.value !== value) {
            return null
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
