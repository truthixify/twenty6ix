'use client'

import React from 'react'
import { Twenty6ixCard, Twenty6ixCardContent } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixBadge } from '~/components/ui/Twenty6ixBadge'
import { LeaderboardEntry } from '~/types/twenty6ix'
import { Trophy, Medal, Award, Crown, Zap, DollarSign, Users } from 'lucide-react'
import { cn } from '~/lib/utils'

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
                return <Crown className="h-5 w-5 text-[#A100FF]" />
            case 2:
                return <Medal className="h-5 w-5 text-[#00A3AD]" />
            case 3:
                return <Award className="h-5 w-5 text-[#A100FF]" />
            default:
                return <Trophy className="h-4 w-4 text-[#B8C1D0]" />
        }
    }

    const getRankBadgeVariant = (rank: number) => {
        if (rank <= 3) return 'default'
        if (rank <= 10) return 'secondary'
        return 'secondary'
    }

    return (
        <Twenty6ixCard 
            variant={entry.rank <= 3 ? "featured" : "default"}
            className={cn(
                'transition-all duration-200',
                isCurrentUser && 'ring-2 ring-[#00A3AD] shadow-[0_0_20px_rgba(0,163,173,0.3)]'
            )}
        >
            <Twenty6ixCardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <Twenty6ixBadge variant={getRankBadgeVariant(entry.rank)}>
                            #{entry.rank}
                        </Twenty6ixBadge>
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
                                    <p className="font-medium truncate text-white">
                                        {entry.username || `User ${entry.fid}`}
                                    </p>
                                    {isCurrentUser && (
                                        <Twenty6ixBadge variant="success" className="text-xs">
                                            You
                                        </Twenty6ixBadge>
                                    )}
                                </div>
                                <p className="text-xs text-[#B8C1D0]">
                                    FID: {entry.fid}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* XP Score */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-white">
                            <Zap className="h-4 w-4 text-[#A100FF]" />
                            {entry.xp_total.toLocaleString()}
                        </div>
                        <p className="text-xs text-[#B8C1D0]">XP</p>
                    </div>
                </div>

                {/* Additional Stats */}
                {showStats && (
                    <div className="mt-3 pt-3 border-t border-[#2A3441]">
                        <div className="flex justify-between text-xs text-[#B8C1D0]">
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
            </Twenty6ixCardContent>
        </Twenty6ixCard>
    )
}