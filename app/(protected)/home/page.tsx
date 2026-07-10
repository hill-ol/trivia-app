'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProfile } from '@/contexts/ProfileContext'
import { getStatsForProfile, ProfileStats } from '@/lib/gameSessions'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
    const { currentProfile } = useProfile()
    const [stats, setStats] = useState<ProfileStats | null>(null)

    useEffect(() => {
        if (!currentProfile) return
        getStatsForProfile(currentProfile.id).then(setStats)
    }, [currentProfile])

    if (!currentProfile) return null

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <div>
                <p className="text-sm text-gray-500">Welcome back</p>
                <h1 className="text-2xl font-semibold">{currentProfile.name}</h1>
            </div>

            <div className="flex gap-4">
                <Card className="flex-1">
                    <p className="text-sm text-gray-500">Games played</p>
                    <p className="text-2xl font-semibold">{stats ? stats.gamesPlayed : '--'}</p>
                </Card>
                <Card className="flex-1">
                    <p className="text-sm text-gray-500">Accuracy</p>
                    <p className="text-2xl font-semibold">
                        {stats?.accuracy == null ? '--' : `${stats.accuracy}%`}
                    </p>
                </Card>
            </div>

            <nav className="flex flex-col gap-3">
                <Link href="/play">
                    <Card className="text-lg font-medium">Play</Card>
                </Link>
                <Link href="/add-trivia">
                    <Card className="text-lg font-medium">Add trivia</Card>
                </Link>
                <Link href="/leaderboard">
                    <Card className="text-lg font-medium">Leaderboard</Card>
                </Link>
                <Link href="/profile">
                    <Card className="text-lg font-medium">Profile</Card>
                </Link>
            </nav>
        </div>
    )
}