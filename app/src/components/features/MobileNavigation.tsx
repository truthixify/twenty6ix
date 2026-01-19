'use client'

import React from 'react'
import { Home, CheckSquare, Coins, Trophy, Info, Settings } from 'lucide-react'
import { cn } from '~/lib/utils'

interface MobileNavigationProps {
    activeTab: string
    onTabChange: (tabId: string) => void
    isAdmin?: boolean
}

export function MobileNavigation({ activeTab, onTabChange, isAdmin = false }: MobileNavigationProps) {
    const tabs = [
        { id: 'dashboard', label: 'Home', icon: Home },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'nfts', label: 'Mint', icon: Coins },
        { id: 'leaderboard', label: 'Board', icon: Trophy },
        { 
            id: isAdmin ? 'admin' : 'info', 
            label: isAdmin ? 'Admin' : 'Info', 
            icon: isAdmin ? Settings : Info
        },
    ]

    return (
        <div 
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
            style={{ 
                backgroundColor: '#0A0F1A',
                borderColor: '#1A2332'
            }}
        >
            <div className="grid grid-cols-5 h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 relative"
                            style={{
                                color: isActive ? '#00A3AD' : '#6E7688'
                            }}
                        >
                            {isActive && (
                                <div 
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        backgroundColor: 'rgba(0, 163, 173, 0.1)',
                                        boxShadow: '0 0 15px rgba(0, 163, 173, 0.2)'
                                    }}
                                />
                            )}
                            <Icon 
                                className="h-5 w-5 relative z-10"
                                style={{
                                    color: isActive ? '#00A3AD' : '#6E7688',
                                    filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 163, 173, 0.6))' : 'none'
                                }}
                            />
                            <span 
                                className="text-xs relative z-10"
                                style={{
                                    color: isActive ? '#00A3AD' : '#6E7688'
                                }}
                            >
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}