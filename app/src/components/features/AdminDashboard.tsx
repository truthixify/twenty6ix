'use client'

import React, { useState, useEffect } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/TabsComponent'
import { Task, Profile } from '~/types/twenty6ix'
import { 
    Settings, 
    Users, 
    DollarSign, 
    Zap, 
    Plus, 
    Edit, 
    Trash2,
    BarChart3,
    Shield,
    Save,
    X
} from 'lucide-react'
import { supabase, TABLES } from '~/lib/supabase'
import { FEES, XP_REWARDS } from '~/lib/web3'

interface AdminDashboardProps {
    user: Profile
}

interface AdminStats {
    totalUsers: number
    totalXP: number
    totalSpend: number
    totalTasks: number
    activeTasks: number
}

interface EditableTask extends Task {
    isEditing?: boolean
}

interface PlatformSettings {
    dailyClaimFee: number
    dailyClaimXP: number
    donationXPRate: number
    referralXP: number
    socialTaskXP: number
    earlyBirdPrice: number
    silverPrice: number
    goldPrice: number
    platinumPrice: number
}

export function AdminDashboard({ user }: AdminDashboardProps) {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalXP: 0,
        totalSpend: 0,
        totalTasks: 0,
        activeTasks: 0
    })
    const [tasks, setTasks] = useState<EditableTask[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('tasks')
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        xp_reward: 5,
        intent_url: ''
    })
    const [settings, setSettings] = useState<PlatformSettings>({
        dailyClaimFee: FEES.DAILY_CLAIM,
        dailyClaimXP: XP_REWARDS.DAILY_CLAIM,
        donationXPRate: XP_REWARDS.DONATION_PER_USD,
        referralXP: XP_REWARDS.REFERRAL,
        socialTaskXP: XP_REWARDS.SOCIAL_TASK,
        earlyBirdPrice: FEES.EARLY_BIRD_MINT,
        silverPrice: FEES.SILVER_MINT,
        goldPrice: FEES.GOLD_MINT,
        platinumPrice: FEES.PLATINUM_MINT
    })

    // Check if user is admin (owner FID)
    const isAdmin = user.fid.toString() === process.env.NEXT_PUBLIC_OWNER_FID

    useEffect(() => {
        if (isAdmin) {
            loadAdminData()
        }
    }, [isAdmin])

    const loadAdminData = async () => {
        try {
            setIsLoading(true)

            // Load platform statistics
            const [usersResult, tasksResult] = await Promise.all([
                supabase.from(TABLES.PROFILES).select('xp_total, total_spend_usd'),
                supabase.from(TABLES.TASKS).select('*')
            ])

            if (usersResult.data) {
                const totalUsers = usersResult.data.length
                const totalXP = usersResult.data.reduce((sum, user) => sum + user.xp_total, 0)
                const totalSpend = usersResult.data.reduce((sum, user) => sum + user.total_spend_usd, 0)
                
                setStats(prev => ({
                    ...prev,
                    totalUsers,
                    totalXP,
                    totalSpend
                }))
            }

            if (tasksResult.data) {
                setTasks(tasksResult.data.map(task => ({ ...task, isEditing: false })))
                setStats(prev => ({
                    ...prev,
                    totalTasks: tasksResult.data.length,
                    activeTasks: tasksResult.data.filter(task => task.is_active).length
                }))
            }
        } catch (error) {
            console.error('Error loading admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const createTask = async () => {
        try {
            const { data, error } = await supabase
                .from(TABLES.TASKS)
                .insert({
                    ...newTask,
                    is_active: true
                })
                .select()
                .single()

            if (error) throw error

            setTasks(prev => [...prev, { ...data, isEditing: false }])
            setNewTask({
                title: '',
                description: '',
                xp_reward: 5,
                intent_url: ''
            })
            
            setStats(prev => ({
                ...prev,
                totalTasks: prev.totalTasks + 1,
                activeTasks: prev.activeTasks + 1
            }))
        } catch (error) {
            console.error('Error creating task:', error)
        }
    }

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            const { error } = await supabase
                .from(TABLES.TASKS)
                .update(updates)
                .eq('id', taskId)

            if (error) throw error

            setTasks(prev => prev.map(task => 
                task.id === taskId 
                    ? { ...task, ...updates, isEditing: false }
                    : task
            ))
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const toggleTaskStatus = async (taskId: string, isActive: boolean) => {
        await updateTask(taskId, { is_active: !isActive })
        
        setStats(prev => ({
            ...prev,
            activeTasks: prev.activeTasks + (isActive ? -1 : 1)
        }))
    }

    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from(TABLES.TASKS)
                .delete()
                .eq('id', taskId)

            if (error) throw error

            const deletedTask = tasks.find(task => task.id === taskId)
            setTasks(prev => prev.filter(task => task.id !== taskId))
            
            setStats(prev => ({
                ...prev,
                totalTasks: prev.totalTasks - 1,
                activeTasks: deletedTask?.is_active ? prev.activeTasks - 1 : prev.activeTasks
            }))
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }

    const startEditing = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId 
                ? { ...task, isEditing: true }
                : { ...task, isEditing: false }
        ))
    }

    const cancelEditing = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId 
                ? { ...task, isEditing: false }
                : task
        ))
    }

    const saveTaskEdit = (taskId: string, updatedTask: Partial<Task>) => {
        updateTask(taskId, updatedTask)
    }

    if (!isAdmin) {
        return (
            <Twenty6ixCard>
                <Twenty6ixCardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Shield className="h-12 w-12 text-[#B8C1D0] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-white">Access Denied</h3>
                        <p className="text-[#B8C1D0]">
                            You don't have permission to access the admin dashboard.
                        </p>
                    </div>
                </Twenty6ixCardContent>
            </Twenty6ixCard>
        )
    }

    if (isLoading) {
        return (
            <Twenty6ixCard>
                <Twenty6ixCardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00A3AD] mx-auto mb-4"></div>
                        <p className="text-[#B8C1D0]">Loading admin dashboard...</p>
                    </div>
                </Twenty6ixCardContent>
            </Twenty6ixCard>
        )
    }

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <Twenty6ixCard>
                <Twenty6ixCardHeader>
                    <div className="flex items-center justify-between">
                        <Twenty6ixCardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Admin Dashboard
                        </Twenty6ixCardTitle>
                        <Twenty6ixBadge variant="default">Owner Access</Twenty6ixBadge>
                    </div>
                    <p className="text-sm text-[#B8C1D0]">
                        Manage platform settings, monitor system-wide metrics, and configure tasks.
                    </p>
                </Twenty6ixCardHeader>
            </Twenty6ixCard>

            {/* System-wide Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Twenty6ixCard>
                    <Twenty6ixCardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#00A3AD]" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                                <p className="text-xs text-[#B8C1D0]">Total Users</p>
                            </div>
                        </div>
                    </Twenty6ixCardContent>
                </Twenty6ixCard>

                <Twenty6ixCard>
                    <Twenty6ixCardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-[#A100FF]" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
                                <p className="text-xs text-[#B8C1D0]">Total XP</p>
                            </div>
                        </div>
                    </Twenty6ixCardContent>
                </Twenty6ixCard>

                <Twenty6ixCard>
                    <Twenty6ixCardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-[#00A3AD]" />
                            <div>
                                <p className="text-2xl font-bold text-white">${stats.totalSpend.toFixed(2)}</p>
                                <p className="text-xs text-[#B8C1D0]">Total Spend</p>
                            </div>
                        </div>
                    </Twenty6ixCardContent>
                </Twenty6ixCard>

                <Twenty6ixCard>
                    <Twenty6ixCardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-[#A100FF]" />
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.activeTasks}/{stats.totalTasks}</p>
                                <p className="text-xs text-[#B8C1D0]">Active Tasks</p>
                            </div>
                        </div>
                    </Twenty6ixCardContent>
                </Twenty6ixCard>
            </div>

            {/* Admin Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tasks">Task Management</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing & Fees</TabsTrigger>
                    <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
                </TabsList>

                {/* Task Management Tab */}
                <TabsContent value="tasks" className="space-y-4">
                    {/* Create New Task */}
                    <Twenty6ixCard>
                        <Twenty6ixCardHeader>
                            <Twenty6ixCardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Create New Task
                            </Twenty6ixCardTitle>
                        </Twenty6ixCardHeader>
                        <Twenty6ixCardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-white">Task Title</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        placeholder="e.g., Follow @twenty6ix on Farcaster"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white">XP Reward</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTask.xp_reward}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 5 }))}
                                        className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                    rows={2}
                                    placeholder="Brief description of what users need to do"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Intent URL</label>
                                <input
                                    type="url"
                                    value={newTask.intent_url}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, intent_url: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                    placeholder="https://warpcast.com/twenty6ix"
                                />
                            </div>
                            <Twenty6ixButton 
                                variant="claim"
                                onClick={createTask}
                                disabled={!newTask.title || !newTask.intent_url}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4" />
                                Create Task
                            </Twenty6ixButton>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>

                    {/* Existing Tasks */}
                    <Twenty6ixCard>
                        <Twenty6ixCardHeader>
                            <Twenty6ixCardTitle>Manage Existing Tasks</Twenty6ixCardTitle>
                            <p className="text-sm text-[#B8C1D0]">
                                Update task URLs, descriptions, and manage their active status.
                            </p>
                        </Twenty6ixCardHeader>
                        <Twenty6ixCardContent>
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <TaskEditCard
                                        key={task.id}
                                        task={task}
                                        onEdit={startEditing}
                                        onSave={saveTaskEdit}
                                        onCancel={cancelEditing}
                                        onToggleStatus={toggleTaskStatus}
                                        onDelete={deleteTask}
                                    />
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-center text-[#B8C1D0] py-8">
                                        No tasks created yet. Create your first task above.
                                    </p>
                                )}
                            </div>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                </TabsContent>

                {/* Pricing & Fees Tab */}
                <TabsContent value="pricing" className="space-y-4">
                    <Twenty6ixCard>
                        <Twenty6ixCardHeader>
                            <Twenty6ixCardTitle>Adjust Mint Prices and Fixed Fees</Twenty6ixCardTitle>
                            <p className="text-sm text-[#B8C1D0]">
                                Configure platform pricing and XP rewards. Changes affect new transactions.
                            </p>
                        </Twenty6ixCardHeader>
                        <Twenty6ixCardContent className="space-y-6">
                            {/* Daily Claims */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-white">Daily Claims</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Fee (USD)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.dailyClaimFee}
                                            onChange={(e) => setSettings(prev => ({ ...prev, dailyClaimFee: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">XP Reward</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.dailyClaimXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, dailyClaimXP: parseInt(e.target.value) || 10 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* NFT Mint Prices */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-white">NFT Mint Prices</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Early Bird</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.earlyBirdPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, earlyBirdPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Silver</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.silverPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, silverPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Gold</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.goldPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, goldPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Platinum</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.platinumPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, platinumPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* XP Rates */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-white">XP Reward Rates</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Donation (XP per $1)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.donationXPRate}
                                            onChange={(e) => setSettings(prev => ({ ...prev, donationXPRate: parseInt(e.target.value) || 50 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Referral XP</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.referralXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, referralXP: parseInt(e.target.value) || 20 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-[#B8C1D0]">Social Task XP</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.socialTaskXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, socialTaskXP: parseInt(e.target.value) || 5 }))}
                                            className="w-full mt-1 px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Twenty6ixButton variant="claim" className="w-full">
                                <Save className="h-4 w-4" />
                                Save Pricing Changes
                            </Twenty6ixButton>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                </TabsContent>

                {/* System Monitoring Tab */}
                <TabsContent value="monitoring" className="space-y-4">
                    <Twenty6ixCard>
                        <Twenty6ixCardHeader>
                            <Twenty6ixCardTitle>System-wide Monitoring</Twenty6ixCardTitle>
                            <p className="text-sm text-[#B8C1D0]">
                                Monitor platform metrics and user activity in real-time.
                            </p>
                        </Twenty6ixCardHeader>
                        <Twenty6ixCardContent className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-white">User Metrics</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Total Registered Users:</span>
                                            <span className="font-medium text-white">{stats.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Average XP per User:</span>
                                            <span className="font-medium text-white">
                                                {stats.totalUsers > 0 ? Math.round(stats.totalXP / stats.totalUsers) : 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Average Spend per User:</span>
                                            <span className="font-medium text-white">
                                                ${stats.totalUsers > 0 ? (stats.totalSpend / stats.totalUsers).toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-white">Platform Activity</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Total XP Distributed:</span>
                                            <span className="font-medium text-white">{stats.totalXP.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Total Platform Revenue:</span>
                                            <span className="font-medium text-white">${stats.totalSpend.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#B8C1D0]">Active Social Tasks:</span>
                                            <span className="font-medium text-white">{stats.activeTasks}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rate Limiting Info */}
                            {/* Rate Limiting Info */}
                            <div className="border-t border-[#2A3441] pt-4">
                                <h4 className="font-medium mb-3 text-white">Rate Limiting Status</h4>
                                <div className="bg-[#1A1F2E]/50 p-4 rounded-lg border border-[#2A3441]">
                                    <p className="text-sm text-[#B8C1D0] mb-2">
                                        Supabase Edge Functions implement rate limiting to prevent spam on task confirmations.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-[#B8C1D0]">Task Confirmation:</span>
                                            <div className="font-medium text-[#00A3AD]">Active</div>
                                        </div>
                                        <div>
                                            <span className="text-[#B8C1D0]">Daily Claims:</span>
                                            <div className="font-medium text-[#00A3AD]">24h Cooldown</div>
                                        </div>
                                        <div>
                                            <span className="text-[#B8C1D0]">Referral Processing:</span>
                                            <div className="font-medium text-[#00A3AD]">Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Twenty6ixCardContent>
                    </Twenty6ixCard>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Task Edit Component
interface TaskEditCardProps {
    task: EditableTask
    onEdit: (taskId: string) => void
    onSave: (taskId: string, updates: Partial<Task>) => void
    onCancel: (taskId: string) => void
    onToggleStatus: (taskId: string, isActive: boolean) => void
    onDelete: (taskId: string) => void
}

function TaskEditCard({ task, onEdit, onSave, onCancel, onToggleStatus, onDelete }: TaskEditCardProps) {
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description,
        xp_reward: task.xp_reward,
        intent_url: task.intent_url
    })

    const handleSave = () => {
        onSave(task.id, editData)
    }

    const handleCancel = () => {
        setEditData({
            title: task.title,
            description: task.description,
            xp_reward: task.xp_reward,
            intent_url: task.intent_url
        })
        onCancel(task.id)
    }

    if (task.isEditing) {
        return (
            <div className="p-4 border border-[#2A3441] rounded-lg bg-[#1A1F2E]/50">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                            className="px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                            placeholder="Task title"
                        />
                        <input
                            type="number"
                            min="1"
                            value={editData.xp_reward}
                            onChange={(e) => setEditData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 5 }))}
                            className="px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                            placeholder="XP reward"
                        />
                    </div>
                    <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                        rows={2}
                        placeholder="Description"
                    />
                    <input
                        type="url"
                        value={editData.intent_url}
                        onChange={(e) => setEditData(prev => ({ ...prev, intent_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#2A3441] rounded-md text-sm bg-[#1A1F2E] text-white"
                        placeholder="Intent URL"
                    />
                    <div className="flex gap-2">
                        <Twenty6ixButton variant="primary" size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                            Save
                        </Twenty6ixButton>
                        <Twenty6ixButton variant="secondary" size="sm" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                            Cancel
                        </Twenty6ixButton>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-3 border border-[#2A3441] rounded-lg bg-[#1A1F2E]/30">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate text-white">{task.title}</h4>
                        <Twenty6ixBadge variant={task.is_active ? 'success' : 'secondary'}>
                            {task.is_active ? 'Active' : 'Inactive'}
                        </Twenty6ixBadge>
                        <Twenty6ixBadge variant="secondary">+{task.xp_reward} XP</Twenty6ixBadge>
                    </div>
                    {task.description && (
                        <p className="text-sm text-[#B8C1D0] mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                    <p className="text-xs text-[#6E7688] mt-1 truncate">
                        URL: {task.intent_url}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                    <Twenty6ixButton variant="secondary" size="sm" onClick={() => onEdit(task.id)}>
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Edit</span>
                    </Twenty6ixButton>
                    <Twenty6ixButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onToggleStatus(task.id, task.is_active)}
                        className="text-xs"
                    >
                        {task.is_active ? 'Deactivate' : 'Activate'}
                    </Twenty6ixButton>
                    <Twenty6ixButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onDelete(task.id)}
                        className="!border-red-500 !text-red-400 hover:!bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Delete</span>
                    </Twenty6ixButton>
                </div>
            </div>
        </div>
    )
}