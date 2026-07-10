'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { getStatsForProfile, ProfileStats } from '@/lib/gameSessions'
import { Card } from '@/components/ui/Card'

export default function ProfilePage() {
    const { currentProfile, clearProfile } = useProfile()
    const router = useRouter()
    const [stats, setStats] = useState<ProfileStats | null>(null)

    useEffect(() => {
        if (!currentProfile) return
        getStatsForProfile(currentProfile.id).then(setStats)
    }, [currentProfile])

    if (!currentProfile) return null

    const handleSwitch = async () => {
        await clearProfile()
        router.push('/')
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-medium">
                    {currentProfile.name.charAt(0)}
                </div>
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

            <Card>
                <p className="text-sm text-gray-500">Correct answers</p>
                <p className="text-2xl font-semibold">
                    {stats ? `${stats.totalCorrect} / ${stats.totalQuestions}` : '--'}
                </p>
            </Card>

            <button
                onClick={handleSwitch}
                className="mt-auto rounded-2xl border border-gray-200 p-4 text-lg font-medium text-gray-500"
            >
                Switch profile
            </button>
        </div>
    )
}