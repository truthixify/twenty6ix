'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '~/contexts/AppContext'
import { TaskCard } from '~/components/features/TaskCard'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { CheckSquare } from 'lucide-react'
import { Task, UserTask } from '~/types/twenty6ix'

export function SocialTasksContent() {
    const { state } = useApp()
    const [tasks, setTasks] = useState<Task[]>([])
    const [userTasks, setUserTasks] = useState<UserTask[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Demo mode setup
    useEffect(() => {
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
    }, [])

    const handleTaskComplete = async (taskId: string) => {
        if (!state.user) return

        try {
            setIsLoading(true)
            // TODO: Implement task completion logic
        } catch (error) {
            // Task completion failed
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Social Tasks</h1>
                    <p className="text-[#B8C1D0]">Complete social tasks to earn XP. Tasks are verified manually.</p>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
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
                                <Twenty6ixCard>
                                    <Twenty6ixCardContent className="py-12 text-center">
                                        <CheckSquare className="h-12 w-12 text-[#6E7688] mx-auto mb-4" />
                                        <p className="text-[#B8C1D0]">
                                            No active tasks available. Check back later!
                                        </p>
                                    </Twenty6ixCardContent>
                                </Twenty6ixCard>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
                    <Twenty6ixCard>
                        <Twenty6ixCardHeader>
                            <Twenty6ixCardTitle>Social Tasks</Twenty6ixCardTitle>
                            <p className="text-sm text-[#B8C1D0]">
                                Complete social tasks to earn XP. Tasks are verified manually.
                            </p>
                        </Twenty6ixCardHeader>
                    </Twenty6ixCard>

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
                            <Twenty6ixCard>
                                <Twenty6ixCardContent className="py-8 text-center">
                                    <p className="text-[#B8C1D0]">
                                        No active tasks available. Check back later!
                                    </p>
                                </Twenty6ixCardContent>
                            </Twenty6ixCard>
                        )}
                    </div>
                </div>
            </div>
    )
}