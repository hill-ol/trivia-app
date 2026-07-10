'use client'

import { mockProfiles } from '@/lib/mockData'
import { getStatsForProfile } from '@/lib/gameSessions'
import { Card } from '@/components/ui/Card'

export default function LeaderboardPage() {
    const rows = mockProfiles
        .map((profile) => ({
            profile,
            stats: getStatsForProfile(profile.id),
        }))
        .sort((a, b) => b.stats.totalCorrect - a.stats.totalCorrect)

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold">Leaderboard</h1>
                <p className="text-sm text-gray-500">Based on games played on this device</p>
            </div>

            <div className="flex flex-col gap-3">
                {rows.map(({ profile, stats }, index) => (
                    <Card key={profile.id} className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-medium">
                            {profile.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-medium">{profile.name}</p>
                            <p className="text-sm text-gray-500">
                                {stats.gamesPlayed === 0
                                    ? 'No games recorded here yet'
                                    : `${stats.gamesPlayed} games played`}
                            </p>
                        </div>
                        <span className="text-xl font-semibold">{stats.totalCorrect}</span>
                    </Card>
                ))}
            </div>
        </div>
    )
}