'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/TabsComponent'
import { Home, CheckSquare, Coins, Trophy, Info, Settings } from 'lucide-react'
import { cn } from '~/lib/utils'

interface NavigationProps {
    activeTab: string
    isAdmin?: boolean
}

export function Navigation({ activeTab, isAdmin = false }: NavigationProps) {
    const router = useRouter()

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
        { id: 'social-tasks', label: 'Tasks', icon: CheckSquare, path: '/social-tasks' },
        { id: 'nft-collection', label: 'Mint', icon: Coins, path: '/nft-collection' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
        { 
            id: isAdmin ? 'admin' : 'information', 
            label: isAdmin ? 'Admin' : 'Info', 
            icon: isAdmin ? Settings : Info,
            path: isAdmin ? '/admin' : '/information'
        },
    ]

    const handleTabChange = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            router.push(tab.path)
        }
    }

    return (
        <div className='bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t'>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
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
