'use client'

import React, { useState } from 'react'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { Task, UserTask } from '~/types/twenty6ix'
import { ExternalLink, Check, Clock, Zap } from 'lucide-react'
import { cn } from '~/lib/utils'

interface TaskCardProps {
    task: Task
    userTask?: UserTask
    onComplete: (taskId: string) => void
    isLoading?: boolean
}

export function TaskCard({ task, userTask, onComplete, isLoading = false }: TaskCardProps) {
    const [isCompleting, setIsCompleting] = useState(false)

    const isCompleted = userTask?.verified || false
    const isAttempted = !!userTask && !userTask.verified

    const handleComplete = async () => {
        if (isCompleted || isCompleting) return

        setIsCompleting(true)
        try {
            // Open the intent URL first
            if (task.intent_url) {
                window.open(task.intent_url, '_blank')
            }
            
            // Mark as attempted
            await onComplete(task.id)
        } catch (error) {
            console.error('Error completing task:', error)
        } finally {
            setIsCompleting(false)
        }
    }

    return (
        <Twenty6ixCard className={cn(
            'transition-all duration-200',
            isCompleted && 'ring-2 ring-[#00A3AD] bg-[#00A3AD]/10',
            isAttempted && 'ring-2 ring-[#A100FF] bg-[#A100FF]/10'
        )}>
            <Twenty6ixCardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <Twenty6ixCardTitle className="text-base leading-tight">
                            {task.title}
                        </Twenty6ixCardTitle>
                        {task.description && (
                            <p className="text-sm text-[#B8C1D0] mt-1">
                                {task.description}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Twenty6ixBadge 
                            variant={isCompleted ? 'success' : isAttempted ? 'warning' : 'primary'}
                            className="gap-1 whitespace-nowrap"
                        >
                            <Zap className="h-3 w-3" />
                            +{task.xp_reward} XP
                        </Twenty6ixBadge>
                        {isCompleted && (
                            <Twenty6ixBadge variant="success" className="gap-1">
                                <Check className="h-3 w-3" />
                                Verified
                            </Twenty6ixBadge>
                        )}
                        {isAttempted && (
                            <Twenty6ixBadge variant="warning" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                            </Twenty6ixBadge>
                        )}
                    </div>
                </div>
            </Twenty6ixCardHeader>

            <Twenty6ixCardContent>
                <div className="flex gap-2">
                    {isCompleted ? (
                        <Twenty6ixButton variant="secondary" className="flex-1" disabled>
                            <Check className="h-4 w-4" />
                            Completed
                        </Twenty6ixButton>
                    ) : isAttempted ? (
                        <Twenty6ixButton variant="secondary" className="flex-1" disabled>
                            <Clock className="h-4 w-4" />
                            Awaiting Verification
                        </Twenty6ixButton>
                    ) : (
                        <Twenty6ixButton 
                            variant="primary"
                            className="flex-1" 
                            onClick={handleComplete}
                            disabled={isCompleting || isLoading}
                        >
                            {isCompleting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="h-4 w-4" />
                                    Complete Task
                                </>
                            )}
                        </Twenty6ixButton>
                    )}
                </div>

                {isAttempted && (
                    <p className="text-xs text-[#B8C1D0] mt-2">
                        Task completion is being verified. This may take a few minutes.
                    </p>
                )}
            </Twenty6ixCardContent>
        </Twenty6ixCard>
    )
}