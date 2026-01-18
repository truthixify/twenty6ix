'use client'

import React from 'react'
import { useApp } from '~/contexts/AppContext'
import { LeaderboardCard } from '~/components/features/LeaderboardCard'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card'
import { Button } from '~/components/ui/Button'
import { Crown, Trophy } from 'lucide-react'
import { AppLayout } from '~/components/layout/AppLayout'

export function LeaderboardContent() {
    const { state, leaderboard, refreshLeaderboard } = useApp()

    return (
        <AppLayout currentPage="leaderboard">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-500" />
                            Leaderboard
                        </h1>
                        <p className="text-muted-foreground">See how you rank against other users.</p>
                    </div>
                    <Button variant="outline" onClick={refreshLeaderboard}>
                        Refresh
                    </Button>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
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
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-4">
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
                </div>
            </div>
        </AppLayout>
    )
}