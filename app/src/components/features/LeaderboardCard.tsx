'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LeaderboardEntry } from '@/types'
import { Trophy, Medal, Award, Crown, Zap, DollarSign, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardCardProps {
    entry: LeaderboardEntry
    currentUserFid?: number
    showStats?: boolean
}

export function LeaderboardCard({ 
    entry, 
    currentUserFid, 
    showStats = true 
}: LeaderboardCardProps) {
    const isCurrentUser = entry.fid === currentUserFid

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />
            default:
                return <Trophy className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getRankBadgeVariant = (rank: number) => {
        if (rank <= 3) return 'default'
        if (rank <= 10) return 'secondary'
        return 'secondary'
    }

    return (
        <Card className={cn(
            'transition-all duration-200 hover:shadow-md',
            isCurrentUser && 'ring-2 ring-blue-500 bg-blue-50/50',
            entry.rank <= 3 && 'bg-gradient-to-r from-yellow-50 to-orange-50'
        )}>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <Badge variant={getRankBadgeVariant(entry.rank)}>
                            #{entry.rank}
                        </Badge>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {entry.avatar_url && (
                                <img
                                    src={entry.avatar_url}
                                    alt={entry.username || `User ${entry.fid}`}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium truncate">
                                        {entry.username || `User ${entry.fid}`}
                                    </p>
                                    {isCurrentUser && (
                                        <Badge variant="success" className="text-xs">
                                            You
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    FID: {entry.fid}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* XP Score */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            {entry.xp_total.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                </div>

                {/* Additional Stats */}
                {showStats && (
                    <div className="mt-3 pt-3 border-t border-muted/50">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${entry.total_spend_usd}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{entry.referral_count} refs</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}