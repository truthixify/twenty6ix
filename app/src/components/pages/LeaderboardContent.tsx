'use client'

import React from 'react'
import { useApp } from '~/contexts/AppContext'
import { LeaderboardCard } from '~/components/features/LeaderboardCard'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Crown, Trophy } from 'lucide-react'

export function LeaderboardContent() {
    const { state, leaderboard, refreshLeaderboard } = useApp()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Crown className="h-6 w-6 text-[#00A3AD]" />
                        Leaderboard
                    </h1>
                    <p className="text-[#B8C1D0]">See how you rank against other users. Rankings update in real-time.</p>
                </div>
                <Twenty6ixButton variant="secondary" onClick={refreshLeaderboard}>
                    Refresh
                </Twenty6ixButton>
            </div>

            {/* Leaderboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {leaderboard.map((entry) => (
                    <LeaderboardCard
                        key={entry.fid}
                        entry={entry}
                        currentUserFid={state.user?.fid}
                        showStats={true}
                    />
                ))}
                
                {leaderboard.length === 0 && (
                    <div className="md:col-span-2 xl:col-span-3">
                        <Twenty6ixCard>
                            <Twenty6ixCardContent className="py-12 text-center">
                                <Trophy className="h-12 w-12 text-[#6E7688] mx-auto mb-4" />
                                <p className="text-[#B8C1D0]">
                                    No leaderboard data available yet.
                                </p>
                            </Twenty6ixCardContent>
                        </Twenty6ixCard>
                    </div>
                )}
            </div>
        </div>
    )
}