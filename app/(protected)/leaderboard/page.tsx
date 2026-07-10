'use client'

import { useEffect, useState } from 'react'
import { getAllProfiles } from '@/lib/profiles'
import { getStatsForProfile, ProfileStats } from '@/lib/gameSessions'
import { Card } from '@/components/ui/Card'
import { Profile } from '@/types'

interface Row {
    profile: Profile
    stats: ProfileStats
}

export default function LeaderboardPage() {
    const [rows, setRows] = useState<Row[] | null>(null)

    useEffect(() => {
        async function load() {
            const profiles = await getAllProfiles()
            const withStats = await Promise.all(
                profiles.map(async (profile) => ({
                    profile,
                    stats: await getStatsForProfile(profile.id),
                }))
            )
            withStats.sort((a, b) => b.stats.totalCorrect - a.stats.totalCorrect)
            setRows(withStats)
        }
        load()
    }, [])

    if (rows === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <h1 className="text-2xl font-semibold">Leaderboard</h1>

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
                                {stats.gamesPlayed === 0 ? 'No games played yet' : `${stats.gamesPlayed} games played`}
                            </p>
                        </div>
                        <span className="text-xl font-semibold">{stats.totalCorrect}</span>
                    </Card>
                ))}
            </div>
        </div>
    )
}