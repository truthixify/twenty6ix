'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Task, UserTask } from '@/types'
import { ExternalLink, Check, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        <Card className={cn(
            'transition-all duration-200',
            isCompleted && 'ring-2 ring-green-500 bg-green-50/50',
            isAttempted && 'ring-2 ring-yellow-500 bg-yellow-50/50'
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <CardTitle className="text-base leading-tight">
                            {task.title}
                        </CardTitle>
                        {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge 
                            variant={isCompleted ? 'success' : isAttempted ? 'warning' : 'default'}
                            className="gap-1 whitespace-nowrap"
                        >
                            <Zap className="h-3 w-3" />
                            +{task.xp_reward} XP
                        </Badge>
                        {isCompleted && (
                            <Badge variant="success" className="gap-1">
                                <Check className="h-3 w-3" />
                                Verified
                            </Badge>
                        )}
                        {isAttempted && (
                            <Badge variant="warning" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex gap-2">
                    {isCompleted ? (
                        <Button variant="outline" className="flex-1" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            Completed
                        </Button>
                    ) : isAttempted ? (
                        <Button variant="outline" className="flex-1" disabled>
                            <Clock className="mr-2 h-4 w-4" />
                            Awaiting Verification
                        </Button>
                    ) : (
                        <Button 
                            className="flex-1" 
                            onClick={handleComplete}
                            disabled={isCompleting || isLoading}
                        >
                            {isCompleting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Complete Task
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {isAttempted && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Task completion is being verified. This may take a few minutes.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}