'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Navigation } from '@/components/features/Navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Home, CheckSquare, Coins, Trophy, Info, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
    children: React.ReactNode
    currentPage: string
}

export function AppLayout({ children, currentPage }: AppLayoutProps) {
    const { state, miniApp, signOut } = useApp()
    const router = useRouter()

    // Check if demo mode is enabled
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    // Check if user is admin
    const isAdmin = state.user?.fid.toString() === process.env.NEXT_PUBLIC_OWNER_FID

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'social-tasks', label: 'Social Tasks', icon: CheckSquare, path: '/social-tasks' },
        { id: 'nft-collection', label: 'NFT Collection', icon: Coins, path: '/nft-collection' },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
        { 
            id: isAdmin ? 'admin' : 'information', 
            label: isAdmin ? 'Admin Panel' : 'Information', 
            icon: isAdmin ? Settings : Info, 
            path: isAdmin ? '/admin' : '/information' 
        },
    ]

    const handleNavigation = (path: string) => {
        router.push(path)
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    const currentNavItem = navigationItems.find(item => item.id === currentPage)

    return (
        <div className='bg-background min-h-screen'>
            {/* Header */}
            <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border sticky top-0 z-40 border-b backdrop-blur md:ml-64'>
                <div className='container mx-auto p-6'>
                    <div className='flex items-center justify-between'>
                        {/* Mobile Header - Show full header */}
                        <div className='md:hidden flex items-center gap-2'>
                            <h1 className='text-xl font-bold'>TWENTY6IX</h1>
                            {miniApp.isMiniApp && (
                                <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                                    Mini App
                                </span>
                            )}
                            {isDemoMode && (
                                <span className='rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800'>
                                    Demo
                                </span>
                            )}
                        </div>
                        
                        {/* Desktop Header - Only show user info, offset for sidebar */}
                        <div className='hidden md:flex items-center justify-between w-full'>
                            <div className="flex items-center gap-2">
                                {currentNavItem && (
                                    <>
                                        <currentNavItem.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium text-foreground">{currentNavItem.label}</span>
                                    </>
                                )}
                            </div>
                            <div>
                                <div className='flex items-center gap-4'>
                                    {isAdmin && (
                                        <Badge variant="default" className="gap-1">
                                            <Settings className="h-3 w-3" />
                                            Admin
                                        </Badge>
                                    )}
                                    {miniApp.isMiniApp && (
                                        <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                                            Mini App
                                        </span>
                                    )}
                                    <div className='text-muted-foreground text-sm'>
                                        FID: {state.user?.fid}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSignOut}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Mobile User Info */}
                        <div className='md:hidden flex items-center gap-2'>
                            <div className='text-muted-foreground text-sm'>
                                FID: {state.user?.fid}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex">
                {/* Desktop Sidebar Navigation - Fixed */}
                <div className="fixed left-0 top-0 w-64 border-r bg-muted/30 h-screen z-50">
                    {/* Header space to account for sticky header */}
                    <div className="h-[80px] bg-muted/30 flex items-center px-6">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold">TWENTY6IX</h1>
                            {isDemoMode && (
                                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                                    Demo
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Navigation Menu */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {navigationItems.map(item => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.path)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                                            currentPage === item.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                        
                        {/* User Info in Sidebar */}
                        <div className="mt-8 pt-6 border-t">
                            {isAdmin && (
                                <div className="mb-3">
                                    <Badge variant="default" className="w-full justify-center gap-1">
                                        <Settings className="h-3 w-3" />
                                        Admin Access
                                    </Badge>
                                </div>
                            )}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">XP:</span>
                                    <span className="font-medium text-yellow-600">
                                        {state.user?.xp_total.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">FID:</span>
                                    <span className="font-medium">{state.user?.fid}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Main Content - With left margin to account for fixed sidebar */}
                <div className="flex-1 ml-64">
                    <div className="max-w-6xl mx-auto p-6">
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden pb-20">
                <div className='container mx-auto space-y-6 px-4 py-6'>
                    {children}
                </div>
            </div>

            {/* Mobile Navigation - Only show on mobile */}
            <div className="md:hidden">
                <Navigation 
                    activeTab={currentPage} 
                    isAdmin={isAdmin} 
                />
            </div>
        </div>
    )
}