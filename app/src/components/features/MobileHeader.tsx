'use client'

import React from 'react'
import { LogOut, Settings } from 'lucide-react'
import { Button } from '~/components/ui/Button'
import { Badge } from '~/components/ui/Badge'
import { useApp } from '~/contexts/AppContext'

interface MobileHeaderProps {
    isAdmin?: boolean
}

export function MobileHeader({ isAdmin = false }: MobileHeaderProps) {
    const { state, signOut } = useApp()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div 
            className="md:hidden border-b px-4 py-3"
            style={{ 
                backgroundColor: '#0A0F1A',
                borderColor: '#1A2332'
            }}
        >
            <div className="flex items-center justify-between">
                {/* Logo and Title */}
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
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>TWENTY6IX</h1>
                        {isAdmin && (
                            <div 
                                className="text-xs gap-1 mt-1 px-2 py-1 rounded-md flex items-center w-fit"
                                style={{
                                    background: 'linear-gradient(135deg, #00A3AD 0%, #A100FF 100%)',
                                    color: '#FFFFFF'
                                }}
                            >
                                <Settings className="h-3 w-3" />
                                Admin
                            </div>
                        )}
                    </div>
                </div>

                {/* User Info and Actions */}
                <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                        <div 
                            className="font-semibold"
                            style={{ color: '#00A3AD' }}
                        >
                            {state.user?.xp_total?.toLocaleString() || 0} XP
                        </div>
                        <div 
                            className="text-xs"
                            style={{ color: '#B8C1D0' }}
                        >
                            FID: {state.user?.fid}
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-2 rounded-lg transition-all duration-200 border"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: '#00A3AD',
                            color: '#00A3AD'
                        }}
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}