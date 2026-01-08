'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/features/Navigation'
import { XPDisplay } from '@/components/features/XPDisplay'
import { NFTCard } from '@/components/features/NFTCard'
import { TaskCard } from '@/components/features/TaskCard'
import { LeaderboardCard } from '@/components/features/LeaderboardCard'
import { DailyClaimCard } from '@/components/features/DailyClaimCard'
import { DonationCard } from '@/components/features/DonationCard'
import { ReferralCard } from '@/components/features/ReferralCard'
import { AdminDashboard } from '@/components/features/AdminDashboard'
import { WelcomeScreen } from '@/components/features/WelcomeScreen'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { NFT_TIERS } from '@/lib/web3'
import { supabase, TABLES } from '@/lib/supabase'
import { Task, UserTask, ClaimLog } from '@/types'
import { Share2, ExternalLink, Crown, Home, CheckSquare, Coins, Trophy, Info, Settings, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
    const { state, miniApp, leaderboard, refreshLeaderboard, dispatch } = useApp()
    const [activeTab, setActiveTab] = useState('home')
    const [infoTab, setInfoTab] = useState('about')
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [userTasks, setUserTasks] = useState<UserTask[]>([])
    const [lastClaimTime, setLastClaimTime] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Demo mode - set to true to test the authenticated dashboard
    // Set to false when implementing real Farcaster authentication
    const DEMO_MODE = true

    // Check if user is admin (for demo, we'll make the demo user an admin)
    const isAdmin =state.user?.fid.toString() === process.env.NEXT_PUBLIC_OWNER_FID

    // Demo mode setup
    useEffect(() => {
        if (DEMO_MODE && !state.user) {
            const demoUser = {
                fid: 123456,
                wallet_address: '0x1234567890123456789012345678901234567890',
                xp_total: 1250,
                total_spend_usd: 15.50,
                referral_code: 'DEMO123',
                referred_by_fid: undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
            
            // Set demo user
            dispatch({ type: 'SET_USER', payload: demoUser })
            
            // Load demo tasks
            const demoTasks = [
                {
                    id: '1',
                    title: 'Follow @twenty6ix on Farcaster',
                    description: 'Follow our official account to stay updated',
                    xp_reward: 5,
                    intent_url: 'https://warpcast.com/twenty6ix',
                    is_active: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Cast about TWENTY6IX',
                    description: 'Share your experience with the community',
                    xp_reward: 5,
                    intent_url: 'https://warpcast.com/~/compose?text=Just%20joined%20@twenty6ix%20to%20earn%20XP!',
                    is_active: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'Join our Telegram',
                    description: 'Connect with other users in our community',
                    xp_reward: 5,
                    intent_url: 'https://t.me/twenty6ix',
                    is_active: true,
                    created_at: new Date().toISOString()
                }
            ]
            setTasks(demoTasks)
            
            // Set last claim time to 20 hours ago (so user can claim soon)
            const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
            setLastClaimTime(twentyHoursAgo)
        }
    }, [DEMO_MODE, state.user, dispatch])

    // Load tasks and user progress (only in production mode)
    useEffect(() => {
        if (state.user && !DEMO_MODE) {
            loadTasks()
            loadUserTasks()
            loadLastClaim()
        }
    }, [state.user, DEMO_MODE])

    const loadTasks = async () => {
        try {
            const { data, error } = await supabase
                .from(TABLES.TASKS)
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTasks(data || [])
        } catch (error) {
            console.error('Error loading tasks:', error)
        }
    }

    const loadUserTasks = async () => {
        if (!state.user) return

        try {
            const { data, error } = await supabase
                .from(TABLES.USER_TASKS)
                .select('*')
                .eq('fid', state.user.fid)

            if (error) throw error
            setUserTasks(data || [])
        } catch (error) {
            console.error('Error loading user tasks:', error)
        }
    }

    const loadLastClaim = async () => {
        if (!state.user) return

        try {
            const { data, error } = await supabase
                .from(TABLES.CLAIMS_LOG)
                .select('claimed_at')
                .eq('fid', state.user.fid)
                .order('claimed_at', { ascending: false })
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            setLastClaimTime(data?.claimed_at || null)
        } catch (error) {
            console.error('Error loading last claim:', error)
        }
    }

    const handleTaskComplete = async (taskId: string) => {
        if (!state.user) return

        try {
            setIsLoading(true)

            // Check if task already attempted
            const existingUserTask = userTasks.find(ut => ut.task_id === taskId)
            if (existingUserTask) return

            // Create user task entry
            const { data, error } = await supabase
                .from(TABLES.USER_TASKS)
                .insert({
                    fid: state.user.fid,
                    task_id: taskId,
                    verified: false // Will be verified manually by admin
                })
                .select()
                .single()

            if (error) throw error

            setUserTasks(prev => [...prev, data])
        } catch (error) {
            console.error('Error completing task:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDailyClaim = async () => {
        if (!state.user) return

        try {
            setIsLoading(true)
            
            // TODO: Implement actual payment processing
            // For now, just simulate the claim
            console.log('Processing daily claim payment...')
            
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Create claim log entry
            const { data, error } = await supabase
                .from(TABLES.CLAIMS_LOG)
                .insert({
                    fid: state.user.fid,
                    amount_usd: 0.10,
                    xp_earned: 10,
                    transaction_hash: 'demo_tx_' + Date.now()
                })
                .select()
                .single()

            if (error) throw error

            setLastClaimTime(data.claimed_at)
            
        } catch (error) {
            console.error('Error processing daily claim:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDonate = async (amount: number) => {
        if (!state.user) return

        try {
            setIsLoading(true)
            
            // TODO: Implement actual payment processing
            console.log(`Processing donation of $${amount}...`)
            
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Create donation entry
            const xpEarned = Math.floor(amount * 50) // 50 XP per $1
            
            const { error } = await supabase
                .from(TABLES.DONATIONS)
                .insert({
                    fid: state.user.fid,
                    amount_usd: amount,
                    xp_earned: xpEarned,
                    transaction_hash: 'demo_donation_' + Date.now()
                })

            if (error) throw error
            
        } catch (error) {
            console.error('Error processing donation:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNFTMint = async (tierType: string) => {
        if (!state.user) return

        try {
            setIsLoading(true)
            
            // TODO: Implement actual NFT minting
            console.log(`Minting ${tierType} NFT...`)
            
            // Simulate minting delay
            await new Promise(resolve => setTimeout(resolve, 3000))
            
        } catch (error) {
            console.error('Error minting NFT:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (state.isLoading || (miniApp.isMiniApp && !miniApp.isReady)) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-center'>
                    <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                    <p className='text-muted-foreground'>
                        {miniApp.isMiniApp
                            ? 'Loading TWENTY6IX Mini App...'
                            : 'Loading TWENTY6IX...'}
                    </p>
                </div>
            </div>
        )
    }

    const handleSignIn = async () => {
        setIsLoading(true)
        
        // Simulate sign-in process
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setIsLoading(false)
    }

    if (!state.isAuthenticated) {
        return (
            <WelcomeScreen
                onSignIn={handleSignIn}
                isMiniApp={miniApp.isMiniApp}
                isLoading={isLoading}
            />
        )
    }

    const handleShareReferral = () => {
        if (state.user?.referral_code) {
            const shareText = `Join me on TWENTY6IX and earn XP! Use my referral code: ${state.user.referral_code}`
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${state.user.referral_code}`
            miniApp.shareContent(shareText, shareUrl)
        }
    }

    return (
        <div className='bg-background min-h-screen'>
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
            >
                {/* Header */}
                <div className='bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border sticky top-0 z-40 border-b backdrop-blur md:ml-64'>
                    <div className='container mx-auto p-6 '>
                        <div className='flex items-center justify-between'>
                            {/* Mobile Header - Show full header */}
                            <div className='md:hidden flex items-center gap-2'>
                                <h1 className='text-xl font-bold'>TWENTY6IX</h1>
                                {miniApp.isMiniApp && (
                                    <span className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                                        Mini App
                                    </span>
                                )}
                                {DEMO_MODE && (
                                    <span className='rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800'>
                                        Demo
                                    </span>
                                )}
                            </div>
                            
                            {/* Desktop Header - Only show user info, offset for sidebar */}
                            <div className='hidden md:flex items-center justify-between w-full'>
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const currentTab = [
                                            { id: 'home', label: 'Dashboard', icon: Home },
                                            { id: 'tasks', label: 'Social Tasks', icon: CheckSquare },
                                            { id: 'mint', label: 'NFT Collection', icon: Coins },
                                            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                                            { id: 'info', label: isAdmin ? 'Admin Panel' : 'Information', icon: isAdmin ? Settings : Info },
                                        ].find(tab => tab.id === activeTab)
                                        
                                        if (currentTab) {
                                            const Icon = currentTab.icon
                                            return (
                                                <>
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                    <span className="font-medium text-foreground">{currentTab.label}</span>
                                                </>
                                            )
                                        }
                                        return null
                                    })()}
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
                                    {DEMO_MODE && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                dispatch({ type: 'RESET_STATE' })
                                                setTasks([])
                                                setUserTasks([])
                                                setLastClaimTime(null)
                                            }}
                                        >
                                            Sign Out
                                        </Button>
                                    )}
                                </div>
                                </div>
                            </div>
                            
                            {/* Mobile User Info */}
                            <div className='md:hidden flex items-center gap-2'>
                                <div className='text-muted-foreground text-sm'>
                                    FID: {state.user?.fid}
                                </div>
                                {DEMO_MODE && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            dispatch({ type: 'RESET_STATE' })
                                            setTasks([])
                                            setUserTasks([])
                                            setLastClaimTime(null)
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                )}
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
                                {DEMO_MODE && (
                                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">
                                        Demo
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Navigation Menu */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {[
                                    { id: 'home', label: 'Dashboard', icon: Home },
                                    { id: 'tasks', label: 'Social Tasks', icon: CheckSquare },
                                    { id: 'mint', label: 'NFT Collection', icon: Coins },
                                    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                                    { id: 'info', label: isAdmin ? 'Admin Panel' : 'Information', icon: isAdmin ? Settings : Info },
                                ].map(tab => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                                                activeTab === tab.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{tab.label}</span>
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
                            {/* Desktop Home Tab */}
                            <TabsContent value='home' className='space-y-6'>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - Main Actions */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <XPDisplay
                                            currentXP={state.user?.xp_total || 0}
                                            nextTierXP={NFT_TIERS.silver.xp_requirement}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <DailyClaimCard
                                                lastClaimTime={lastClaimTime || undefined}
                                                onClaim={handleDailyClaim}
                                                isLoading={isLoading}
                                            />
                                            <DonationCard
                                                onDonate={handleDonate}
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column - Stats & Referrals */}
                                    <div className="space-y-6">
                                        <ReferralCard
                                            user={state.user}
                                            onShare={handleShareReferral}
                                            isLoading={isLoading}
                                        />

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Quick Stats</CardTitle>
                                            </CardHeader>
                                            <CardContent className='space-y-3'>
                                                <div className='flex justify-between'>
                                                    <span className='text-muted-foreground'>Total XP:</span>
                                                    <span className='font-medium text-yellow-600'>
                                                        {state.user?.xp_total.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span className='text-muted-foreground'>Total Spend:</span>
                                                    <span className='font-medium text-green-600'>
                                                        ${state.user?.total_spend_usd || 0}
                                                    </span>
                                                </div>
                                                <div className='flex justify-between'>
                                                    <span className='text-muted-foreground'>Wallet:</span>
                                                    <span className='font-mono text-xs'>
                                                        {state.user?.wallet_address 
                                                            ? `${state.user.wallet_address.slice(0, 6)}...${state.user.wallet_address.slice(-4)}`
                                                            : 'Not connected'
                                                        }
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Other Desktop Tabs */}
                            <TabsContent value='tasks' className='space-y-6'>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold">Social Tasks</h2>
                                    <p className="text-muted-foreground">Complete social tasks to earn XP. Tasks are verified manually.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {tasks.map((task) => {
                                        const userTask = userTasks.find(ut => ut.task_id === task.id)
                                        return (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                userTask={userTask}
                                                onComplete={handleTaskComplete}
                                                isLoading={isLoading}
                                            />
                                        )
                                    })}
                                    
                                    {tasks.length === 0 && (
                                        <div className="lg:col-span-2">
                                            <Card>
                                                <CardContent className="py-12 text-center">
                                                    <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">
                                                        No active tasks available. Check back later!
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value='mint' className='space-y-6'>
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold">NFT Collection</h2>
                                    <p className="text-muted-foreground">Mint exclusive NFTs as you progress through the tiers.</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.values(NFT_TIERS).map((tier) => (
                                        <NFTCard
                                            key={tier.type}
                                            tier={tier}
                                            user={state.user}
                                            isOwned={false}
                                            onMint={() => handleNFTMint(tier.type)}
                                            isLoading={isLoading}
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value='leaderboard' className='space-y-6'>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Crown className="h-6 w-6 text-yellow-500" />
                                            Leaderboard
                                        </h2>
                                        <p className="text-muted-foreground">See how you rank against other users.</p>
                                    </div>
                                    <Button variant="outline" onClick={refreshLeaderboard}>
                                        Refresh
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {leaderboard.map((entry) => (
                                        <LeaderboardCard
                                            key={entry.fid}
                                            entry={entry}
                                            currentUserFid={state.user?.fid}
                                            showStats={true}
                                        />
                                    ))}
                                    
                                    {leaderboard.length === 0 && (
                                        <div className="lg:col-span-2 xl:col-span-3">
                                            <Card>
                                                <CardContent className="py-12 text-center">
                                                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">
                                                        No leaderboard data available yet.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value='info' className='space-y-6'>
                                {isAdmin ? (
                                    <AdminDashboard user={state.user!} />
                                ) : (
                                    <div className="max-w-4xl">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold">Platform Information</h2>
                                            <p className="text-muted-foreground">Learn about TWENTY6IX, view our roadmap, and get answers to common questions.</p>
                                        </div>

                                        {/* Sub-navigation for Information sections */}
                                        <Tabs value={infoTab} onValueChange={setInfoTab} className="w-full">
                                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                                <TabsTrigger value="about">About</TabsTrigger>
                                                <TabsTrigger value="faq">FAQ</TabsTrigger>
                                                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                                            </TabsList>

                                            {/* About Tab */}
                                            <TabsContent value="about" className="space-y-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>How to Earn XP</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                    <span className="text-sm">Daily claims</span>
                                                                    <Badge variant="secondary">10 XP</Badge>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                    <span className="text-sm">Donations</span>
                                                                    <Badge variant="secondary">50 XP/$1</Badge>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                    <span className="text-sm">Referrals</span>
                                                                    <Badge variant="secondary">20 XP each</Badge>
                                                                </div>
                                                                <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                    <span className="text-sm">Social tasks</span>
                                                                    <Badge variant="secondary">5 XP each</Badge>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>NFT Tiers</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                {Object.values(NFT_TIERS).map((tier) => (
                                                                    <div key={tier.type} className="p-3 border rounded-lg">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <span className="font-medium">{tier.name}</span>
                                                                            <Badge variant="secondary">${tier.mint_price_usd}</Badge>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {tier.xp_requirement > 0 && `${tier.xp_requirement.toLocaleString()} XP required`}
                                                                            {tier.spend_requirement > 0 && ` • $${tier.spend_requirement} spend OR 15 referrals`}
                                                                            {tier.requires_previous_tier && ` • Previous tier required`}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Platform Information</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Network:</span>
                                                                    <span className="font-medium">Base (Ethereum L2)</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Framework:</span>
                                                                    <span className="font-medium">Farcaster Mini App</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Authentication:</span>
                                                                    <span className="font-medium">Sign-In With Farcaster</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Database:</span>
                                                                    <span className="font-medium">Supabase (Real-time)</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>External Links</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start"
                                                                onClick={() => miniApp.openUrl('https://warpcast.com/twenty6ix')}
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Follow @twenty6ix on Farcaster
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start"
                                                                onClick={() => miniApp.openUrl('https://base.org')}
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Learn about Base Network
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start"
                                                                onClick={() => miniApp.openUrl('https://docs.farcaster.xyz')}
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Farcaster Documentation
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start"
                                                                onClick={() => miniApp.openUrl('https://supabase.com')}
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Powered by Supabase
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            {/* FAQ Tab */}
                                            <TabsContent value="faq" className="space-y-6">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        {
                                                            id: 'what-is',
                                                            question: 'What is TWENTY6IX?',
                                                            answer: 'A Farcaster Mini App for daily fun. Connect your wallet, complete simple social tasks (likes, retweets, comments), mint exclusive NFTs, claim rewards, refer friends and climb the leaderboard. Built for fun, engagement, and real onchain ownership.'
                                                        },
                                                        {
                                                            id: 'get-started',
                                                            question: 'How do I get started?',
                                                            answer: 'Open the app in Warpcast — your wallet connects automatically via Sign-In with Farcaster. No extra sign-ups or downloads needed.'
                                                        },
                                                        {
                                                            id: 'mint-nfts',
                                                            question: 'When can I mint NFTs?',
                                                            answer: 'NFT minting will unlock in later phases as we hit milestones for Early supporters and active users.'
                                                        },
                                                        {
                                                            id: 'donations',
                                                            question: 'What about donations?',
                                                            answer: 'Completely optional from day 1, onchain. Donating earns you bonus XP (points) toward the leaderboard and future perks.'
                                                        },
                                                        {
                                                            id: 'costs',
                                                            question: 'Are there costs involved?',
                                                            answer: 'Tiny Base network fees (usually under a penny) for onchain actions like minting. Tasks and daily claims are low-cost or free. NFT mints have their own prices.'
                                                        },
                                                        {
                                                            id: 'earnings',
                                                            question: 'What do I actually earn?',
                                                            answer: 'Points for the leaderboard, exclusive NFTs, and future token rewards (coming soon). Top players will get extra perks.'
                                                        },
                                                        {
                                                            id: 'support',
                                                            question: 'How can I give feedback or get support?',
                                                            answer: 'Reply to our casts, join our community channel across Telegram and X. We are building this together!'
                                                        }
                                                    ].map((faq) => (
                                                        <Card key={faq.id} className="overflow-hidden">
                                                            <CardHeader 
                                                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                                                    {expandedFAQ === faq.id ? (
                                                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                                    ) : (
                                                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            </CardHeader>
                                                            {expandedFAQ === faq.id && (
                                                                <CardContent className="pt-0">
                                                                    <p className="text-muted-foreground">
                                                                        {faq.answer}
                                                                    </p>
                                                                </CardContent>
                                                            )}
                                                        </Card>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            {/* Roadmap Tab */}
                                            <TabsContent value="roadmap" className="space-y-6">
                                                <div className="space-y-6">
                                                    {/* Phase 1 */}
                                                    <Card className="border-l-4 border-l-green-500">
                                                        <CardHeader>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                                <div>
                                                                    <CardTitle className="text-lg">Phase 1 – Launch & Growth</CardTitle>
                                                                    <p className="text-sm text-muted-foreground">Q1-Q2 2026</p>
                                                                </div>
                                                                <Badge variant="success">Current Phase</Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <h4 className="font-medium">Early Birds NFT Claim</h4>
                                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        Wallet connect via Sign-In with Farcaster
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        Unlimited daily claims system
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        Social tasks integration
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        Donations with XP boost
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                        Real-time leaderboard
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Phase 2 */}
                                                    <Card className="border-l-4 border-l-blue-500">
                                                        <CardHeader>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                                <div>
                                                                    <CardTitle className="text-lg">Phase 2 – Features & Boosts</CardTitle>
                                                                    <p className="text-sm text-muted-foreground">Q2-Q3 2026</p>
                                                                </div>
                                                                <Badge variant="secondary">Coming Soon</Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <h4 className="font-medium">Unlock Exclusive NFT Minting</h4>
                                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Silver NFT tier unlocked (1,000 XP + $10 spend OR 15 referrals)
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Gold NFT tier unlocked (3,000 XP + Silver + $30 spend OR 15 referrals)
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Boosted tasks with higher rewards
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Enhanced referral system
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Phase 3 */}
                                                    <Card className="border-l-4 border-l-purple-500">
                                                        <CardHeader>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                                <div>
                                                                    <CardTitle className="text-lg">Phase 3 – Token Generation Event (TGE) & Beyond</CardTitle>
                                                                    <p className="text-sm text-muted-foreground">Q3 2026</p>
                                                                </div>
                                                                <Badge variant="secondary">Future</Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="space-y-3">
                                                                <h4 className="font-medium">Fair Token Launch on Base</h4>
                                                                <ul className="space-y-2 text-sm text-muted-foreground">
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                        Platinum NFT tier (10,000 XP + Gold + $100 spend OR 15 referrals)
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                        FCFS Platinum minting (5,000 cap)
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                        Token rewards & utility system
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                        Partnerships and ecosystem growth
                                                                    </li>
                                                                    <li className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                                        Governance token launch
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout - Keep existing mobile design */}
                <div className="md:hidden pb-20">
                    <div className='container mx-auto space-y-6 px-4 py-6'>
                        <TabsContent value='home' className='space-y-6'>
                            <XPDisplay
                                currentXP={state.user?.xp_total || 0}
                                nextTierXP={NFT_TIERS.silver.xp_requirement}
                            />

                            <DailyClaimCard
                                lastClaimTime={lastClaimTime || undefined}
                                onClaim={handleDailyClaim}
                                isLoading={isLoading}
                            />

                            <DonationCard
                                onDonate={handleDonate}
                                isLoading={isLoading}
                            />

                            <ReferralCard
                                user={state.user}
                                onShare={handleShareReferral}
                                isLoading={isLoading}
                            />
                        </TabsContent>

                        {/* Mobile Tasks Tab */}
                        <TabsContent value='tasks' className='space-y-4'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Social Tasks</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Complete social tasks to earn XP. Tasks are verified manually.
                                    </p>
                                </CardHeader>
                            </Card>

                            <div className="space-y-4">
                                {tasks.map((task) => {
                                    const userTask = userTasks.find(ut => ut.task_id === task.id)
                                    return (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            userTask={userTask}
                                            onComplete={handleTaskComplete}
                                            isLoading={isLoading}
                                        />
                                    )
                                })}
                                
                                {tasks.length === 0 && (
                                    <Card>
                                        <CardContent className="py-8 text-center">
                                            <p className="text-muted-foreground">
                                                No active tasks available. Check back later!
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        {/* Mobile Mint Tab */}
                        <TabsContent value='mint' className='space-y-4'>
                            <Card>
                                <CardHeader>
                                    <CardTitle>NFT Collection</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Mint exclusive NFTs as you progress through the tiers. Each NFT provides XP bonuses and unlocks new features.
                                    </p>
                                </CardHeader>
                            </Card>

                            <div className="space-y-4">
                                {Object.values(NFT_TIERS).map((tier) => (
                                    <NFTCard
                                        key={tier.type}
                                        tier={tier}
                                        user={state.user}
                                        isOwned={false}
                                        onMint={() => handleNFTMint(tier.type)}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        {/* Mobile Leaderboard Tab */}
                        <TabsContent value='leaderboard' className='space-y-4'>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Crown className="h-5 w-5 text-yellow-500" />
                                            Leaderboard
                                        </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={refreshLeaderboard}
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        See how you rank against other users. Rankings update in real-time.
                                    </p>
                                </CardHeader>
                            </Card>

                            <div className="space-y-3">
                                {leaderboard.map((entry) => (
                                    <LeaderboardCard
                                        key={entry.fid}
                                        entry={entry}
                                        currentUserFid={state.user?.fid}
                                        showStats={true}
                                    />
                                ))}
                                
                                {leaderboard.length === 0 && (
                                    <Card>
                                        <CardContent className="py-8 text-center">
                                            <p className="text-muted-foreground">
                                                No leaderboard data available yet.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        {/* Mobile Info Tab */}
                        <TabsContent value='info' className='space-y-4'>
                            {isAdmin ? (
                                <AdminDashboard user={state.user!} />
                            ) : (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About TWENTY6IX</CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <p className='text-muted-foreground text-sm'>
                                                TWENTY6IX is a Farcaster-native social rewards platform built on Base.
                                                Earn XP through daily activities and unlock exclusive NFT tiers.
                                            </p>
                                            
                                            <div className='space-y-3'>
                                                <div>
                                                    <h4 className='font-medium mb-2'>How to earn XP:</h4>
                                                    <ul className='text-muted-foreground space-y-1 text-sm'>
                                                        <li>• Daily claims: 10 XP ($0.10)</li>
                                                        <li>• Donations: 50 XP per $1</li>
                                                        <li>• Referrals: 20 XP each (max 15)</li>
                                                        <li>• Social tasks: 5 XP each</li>
                                                        <li>• NFT mints: 100-3000 XP bonus</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className='font-medium mb-2'>NFT Tier Requirements:</h4>
                                                    <div className="space-y-2 text-sm">
                                                        {Object.values(NFT_TIERS).map((tier) => (
                                                            <div key={tier.type} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                <span className="font-medium">{tier.name}</span>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {tier.xp_requirement > 0 && `${tier.xp_requirement} XP`}
                                                                    {tier.spend_requirement > 0 && ` • $${tier.spend_requirement} OR 15 refs`}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className='font-medium mb-2'>Platform Info:</h4>
                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        <div>• Built on Base (Ethereum L2)</div>
                                                        <div>• Farcaster Mini App integration</div>
                                                        <div>• Real-time leaderboard updates</div>
                                                        <div>• Powered by Supabase</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {miniApp.isMiniApp && (
                                                <div className='border-t pt-4'>
                                                    <h4 className='mb-2 font-medium'>Mini App Features:</h4>
                                                    <ul className='text-muted-foreground space-y-1 text-sm'>
                                                        <li>• Native Farcaster integration</li>
                                                        <li>• One-click sharing</li>
                                                        <li>• Seamless authentication</li>
                                                        <li>• Mobile-optimized experience</li>
                                                    </ul>
                                                </div>
                                            )}

                                            <div className='border-t pt-4'>
                                                <h4 className='mb-2 font-medium'>Links:</h4>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => miniApp.openUrl('https://warpcast.com/twenty6ix')}
                                                    >
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Follow @twenty6ix on Farcaster
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => miniApp.openUrl('https://base.org')}
                                                    >
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Learn about Base Network
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className='border-t pt-4'>
                                                <h4 className='mb-2 font-medium'>Roadmap:</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-muted-foreground">Phase 1: Launch (Early Bird NFTs)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-muted-foreground">Phase 2: Growth (Silver & Gold)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                        <span className="text-muted-foreground">Phase 3: Scale (Platinum NFTs)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="text-muted-foreground">Phase 4: Token (TGE & Governance)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </TabsContent>
                    </div>
                </div>
            </Tabs>

            {/* Mobile Navigation - Only show on mobile */}
            <div className="md:hidden">
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
            </div>
        </div>
    )
}