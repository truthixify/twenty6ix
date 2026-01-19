'use client'

import React from 'react'
import { Home, CheckSquare, Coins, Trophy, Info, Settings, LogOut } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/Button'
import { Badge } from '~/components/ui/Badge'
import { useApp } from '~/contexts/AppContext'

interface SidebarProps {
    activeTab: string
    onTabChange: (tabId: string) => void
    isAdmin?: boolean
}

export function Sidebar({ activeTab, onTabChange, isAdmin = false }: SidebarProps) {
    const { state, signOut } = useApp()

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'tasks', label: 'Social Tasks', icon: CheckSquare },
        { id: 'nfts', label: 'NFT Collection', icon: Coins },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { 
            id: isAdmin ? 'admin' : 'info', 
            label: isAdmin ? 'Admin Panel' : 'Information', 
            icon: isAdmin ? Settings : Info
        },
    ]

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div 
                className="flex flex-col flex-grow pt-5 overflow-y-auto border-r"
                style={{ 
                    backgroundColor: '#0A0F1A',
                    borderColor: '#1A2332'
                }}
            >
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
                                boxShadow: '0 0 20px rgba(0, 163, 173, 0.3)'
                            }}
                        >
                            <span className="text-white font-bold text-lg">26</span>
                        </div>
                        <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>TWENTY6IX</h1>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex-grow flex flex-col">
                    <nav className="flex-1 px-3 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={cn(
                                        'group flex items-center px-3 py-3 text-sm font-medium rounded-xl w-full text-left transition-all duration-200',
                                        isActive
                                            ? 'text-white shadow-lg'
                                            : 'hover:bg-opacity-10 hover:bg-white'
                                    )}
                                    style={{
                                        backgroundColor: isActive ? '#00A3AD' : 'transparent',
                                        color: isActive ? '#FFFFFF' : '#B8C1D0',
                                        boxShadow: isActive ? '0 0 20px rgba(0, 163, 173, 0.4)' : 'none'
                                    }}
                                >
                                    <Icon
                                        className="mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                                        style={{
                                            color: isActive ? '#FFFFFF' : '#B8C1D0'
                                        }}
                                    />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* User Info & Sign Out */}
                    <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #1A2332' }}>
                        {/* Admin Badge */}
                        {isAdmin && (
                            <div className="mb-4">
                                <div 
                                    className="w-full justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
                                        color: '#FFFFFF',
                                        boxShadow: '0 0 15px rgba(161, 0, 255, 0.3)'
                                    }}
                                >
                                    <Settings className="h-4 w-4" />
                                    Admin Access
                                </div>
                            </div>
                        )}

                        {/* User Stats */}
                        <div className="space-y-3 text-sm mb-4">
                            <div className="flex justify-between items-center">
                                <span style={{ color: '#B8C1D0' }}>XP:</span>
                                <span 
                                    className="font-semibold"
                                    style={{ color: '#00A3AD' }}
                                >
                                    {state.user?.xp_total?.toLocaleString() || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: '#B8C1D0' }}>Spend:</span>
                                <span 
                                    className="font-semibold"
                                    style={{ color: '#A100FF' }}
                                >
                                    ${state.user?.total_spend_usd?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span style={{ color: '#B8C1D0' }}>FID:</span>
                                <span 
                                    className="font-medium"
                                    style={{ color: '#FFFFFF' }}
                                >
                                    {state.user?.fid}
                                </span>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border hover:bg-opacity-10 hover:bg-white"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: '#00A3AD',
                                color: '#00A3AD'
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}