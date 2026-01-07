'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Home, CheckSquare, Coins, Trophy, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'mint', label: 'Mint', icon: Coins },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'info', label: 'Info', icon: Info },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <div className='bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t'>
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className='grid h-16 w-full grid-cols-5 bg-transparent'>
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={cn(
                                    'flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                    'data-[state=active]:text-primary data-[state=active]:bg-primary/10',
                                    'data-[state=inactive]:text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Icon className='h-5 w-5' />
                                <span className='hidden sm:inline'>
                                    {tab.label}
                                </span>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
            </Tabs>
        </div>
    )
}
