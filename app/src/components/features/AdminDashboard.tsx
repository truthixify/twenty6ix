'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card'
import { Button } from '~/components/ui/Button'
import { Badge } from '~/components/ui/Badge'
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
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                        <p className="text-muted-foreground">
                            You don't have permission to access the admin dashboard.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading admin dashboard...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Admin Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Admin Dashboard
                        </CardTitle>
                        <Badge variant="default">Owner Access</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage platform settings, monitor system-wide metrics, and configure tasks.
                    </p>
                </CardHeader>
            </Card>

            {/* System-wide Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                <p className="text-xs text-muted-foreground">Total Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">${stats.totalSpend.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Total Spend</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.activeTasks}/{stats.totalTasks}</p>
                                <p className="text-xs text-muted-foreground">Active Tasks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Create New Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Task Title</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        placeholder="e.g., Follow @twenty6ix on Farcaster"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">XP Reward</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTask.xp_reward}
                                        onChange={(e) => setNewTask(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 5 }))}
                                        className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                    rows={2}
                                    placeholder="Brief description of what users need to do"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Intent URL</label>
                                <input
                                    type="url"
                                    value={newTask.intent_url}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, intent_url: e.target.value }))}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                    placeholder="https://warpcast.com/twenty6ix"
                                />
                            </div>
                            <Button 
                                onClick={createTask}
                                disabled={!newTask.title || !newTask.intent_url}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Task
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Existing Tasks */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Existing Tasks</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Update task URLs, descriptions, and manage their active status.
                            </p>
                        </CardHeader>
                        <CardContent>
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
                                    <p className="text-center text-muted-foreground py-8">
                                        No tasks created yet. Create your first task above.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pricing & Fees Tab */}
                <TabsContent value="pricing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adjust Mint Prices and Fixed Fees</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Configure platform pricing and XP rewards. Changes affect new transactions.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Daily Claims */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Daily Claims</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Fee (USD)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.dailyClaimFee}
                                            onChange={(e) => setSettings(prev => ({ ...prev, dailyClaimFee: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">XP Reward</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.dailyClaimXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, dailyClaimXP: parseInt(e.target.value) || 10 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* NFT Mint Prices */}
                            <div className="space-y-3">
                                <h4 className="font-medium">NFT Mint Prices</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Early Bird</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.earlyBirdPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, earlyBirdPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Silver</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.silverPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, silverPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Gold</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.goldPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, goldPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Platinum</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settings.platinumPrice}
                                            onChange={(e) => setSettings(prev => ({ ...prev, platinumPrice: parseFloat(e.target.value) || 0 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* XP Rates */}
                            <div className="space-y-3">
                                <h4 className="font-medium">XP Reward Rates</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Donation (XP per $1)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.donationXPRate}
                                            onChange={(e) => setSettings(prev => ({ ...prev, donationXPRate: parseInt(e.target.value) || 50 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Referral XP</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.referralXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, referralXP: parseInt(e.target.value) || 20 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Social Task XP</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settings.socialTaskXP}
                                            onChange={(e) => setSettings(prev => ({ ...prev, socialTaskXP: parseInt(e.target.value) || 5 }))}
                                            className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                Save Pricing Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Monitoring Tab */}
                <TabsContent value="monitoring" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System-wide Monitoring</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Monitor platform metrics and user activity in real-time.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-medium">User Metrics</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Registered Users:</span>
                                            <span className="font-medium">{stats.totalUsers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Average XP per User:</span>
                                            <span className="font-medium">
                                                {stats.totalUsers > 0 ? Math.round(stats.totalXP / stats.totalUsers) : 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Average Spend per User:</span>
                                            <span className="font-medium">
                                                ${stats.totalUsers > 0 ? (stats.totalSpend / stats.totalUsers).toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium">Platform Activity</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total XP Distributed:</span>
                                            <span className="font-medium">{stats.totalXP.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Platform Revenue:</span>
                                            <span className="font-medium">${stats.totalSpend.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Active Social Tasks:</span>
                                            <span className="font-medium">{stats.activeTasks}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rate Limiting Info */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-3">Rate Limiting Status</h4>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Supabase Edge Functions implement rate limiting to prevent spam on task confirmations.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Task Confirmation:</span>
                                            <div className="font-medium text-green-600">Active</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Daily Claims:</span>
                                            <div className="font-medium text-green-600">24h Cooldown</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Referral Processing:</span>
                                            <div className="font-medium text-green-600">Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
            <div className="p-4 border rounded-lg bg-muted/20">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                            className="px-3 py-2 border border-input rounded-md text-sm"
                            placeholder="Task title"
                        />
                        <input
                            type="number"
                            min="1"
                            value={editData.xp_reward}
                            onChange={(e) => setEditData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 5 }))}
                            className="px-3 py-2 border border-input rounded-md text-sm"
                            placeholder="XP reward"
                        />
                    </div>
                    <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        rows={2}
                        placeholder="Description"
                    />
                    <input
                        type="url"
                        value={editData.intent_url}
                        onChange={(e) => setEditData(prev => ({ ...prev, intent_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        placeholder="Intent URL"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={task.is_active ? 'success' : 'secondary'}>
                        {task.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">+{task.xp_reward} XP</Badge>
                </div>
                {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                    </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                    URL: {task.intent_url}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(task.id)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleStatus(task.id, task.is_active)}
                >
                    {task.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(task.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}