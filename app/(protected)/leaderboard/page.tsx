'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { getAllProfiles } from '@/lib/profiles'
import { getStatsForProfile, ProfileStats } from '@/lib/gameSessions'
import { useAsyncData } from '@/hooks/useAsyncData'
import { FLOAT_TRANSITION } from '@/lib/motion'
import { Card } from '@/components/ui/Card'
import { BackButton } from '@/components/ui/BackButton'
import { StaggerItem } from '@/components/ui/StaggerItem'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { WobbleStar } from '@/components/ui/WobbleStar'
import { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface Row {
    profile: Profile
    stats: ProfileStats
}

const ROW_ACCENTS = [
    { avatarBg: 'bg-marina/10 text-marina' },
    { avatarBg: 'bg-petal-plush/15 text-petal-plush-deep' },
]

async function loadLeaderboardRows(): Promise<{ data: Row[]; error: string | null }> {
    const { data: profiles, error } = await getAllProfiles()
    if (error) return { data: [], error }

    const rows = await Promise.all(
        profiles.map(async (profile) => {
            const { data: stats } = await getStatsForProfile(profile.id)
            return { profile, stats }
        })
    )
    rows.sort((a, b) => b.stats.totalCorrect - a.stats.totalCorrect)
    return { data: rows, error: null }
}

export default function LeaderboardPage() {
    const { data: rows, error, isLoading, refetch } = useAsyncData(loadLeaderboardRows, [])

    const isTied = rows && rows.length > 1 && rows[0].stats.totalCorrect === rows[1].stats.totalCorrect
    const hasLeader = rows && rows.length > 0 && rows[0].stats.totalCorrect > 0 && !isTied

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <div>
                    <div className="mb-0.5 flex items-center gap-1.5">
                        <WobbleStar className="h-3 w-3 text-changeling" />
                        <span className="text-xs text-ink-muted">Who&apos;s winning</span>
                    </div>
                    <h1 className="font-display text-2xl text-ink">Leaderboard</h1>
                </div>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load the leaderboard." onRetry={refetch} />
            ) : isLoading || !rows ? (
                <p className="text-sm text-ink-muted">Loading...</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {rows.map(({ profile, stats }, index) => {
                        const accent = ROW_ACCENTS[index % ROW_ACCENTS.length]
                        const isLeader = index === 0 && hasLeader

                        return (
                            <StaggerItem key={profile.id} index={index}>
                                <Card sticker={isLeader ? 'petal-plush' : undefined}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div
                                                className={cn(
                                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-medium',
                                                    accent.avatarBg
                                                )}
                                            >
                                                {profile.name.charAt(0)}
                                            </div>
                                            {isLeader && (
                                                <motion.div
                                                    className="absolute -right-1.5 -top-2"
                                                    initial={{ rotate: 15 }}
                                                    animate={{ rotate: 15, y: [0, -3, 0] }}
                                                    transition={FLOAT_TRANSITION}
                                                    aria-hidden="true"
                                                >
                                                    <Crown className="h-5 w-5 text-changeling" fill="currentColor" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-lg font-medium text-ink">{profile.name}</p>
                                            <p className="text-xs text-ink-muted">
                                                {stats.gamesPlayed === 0 ? 'No games played yet' : `${stats.gamesPlayed} games played`}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-medium text-ink">{stats.totalCorrect}</span>
                                    </div>
                                </Card>
                            </StaggerItem>
                        )
                    })}
                </div>
            )}
        </div>
    )
}