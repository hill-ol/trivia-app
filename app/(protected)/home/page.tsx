'use client'

import { motion } from 'framer-motion'
import { BarChart3, Target, Play, Plus, Trophy, User, Grid3x3 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { useProfileStats } from '@/hooks/useProfileStats'
import { FLOAT_TRANSITION } from '@/lib/motion'
import { StatCard } from '@/components/ui/StatCard'
import { NavRow } from '@/components/ui/NavRow'
import { StaggerItem } from '@/components/ui/StaggerItem'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { WobbleStar } from '@/components/ui/WobbleStar'
import { Squiggle } from '@/components/ui/Squiggle'

export default function HomePage() {
    const { currentProfile } = useProfile()
    const { data: stats, error, isLoading, refetch } = useProfileStats(currentProfile?.id)

    if (!currentProfile) return null

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="relative m-1 mb-1">
                <motion.div
                    className="absolute -right-2 -top-2 h-[68px] w-[68px] rounded-2xl bg-petal-plush"
                    initial={{ rotate: 10 }}
                    animate={{ rotate: 10, y: [0, -4, 0] }}
                    transition={FLOAT_TRANSITION}
                    aria-hidden="true"
                />
                <div className="relative rounded-2xl border border-wild-hillside/40 bg-white p-4">
                    <div className="mb-1 flex items-center gap-1.5">
                        <WobbleStar />
                        <span className="text-xs text-ink-muted">Welcome back</span>
                    </div>
                    <h1 className="font-display text-3xl text-ink">{currentProfile.name}</h1>
                    <Squiggle className="mt-1 text-marina" />
                </div>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load your stats." onRetry={refetch} />
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <StaggerItem index={0}>
                        <StatCard
                            icon={<BarChart3 className="h-3.5 w-3.5" />}
                            label="Games played"
                            value={isLoading || !stats ? '--' : stats.gamesPlayed}
                            color="blue"
                            sticker="marina"
                        />
                    </StaggerItem>
                    <StaggerItem index={1}>
                        <StatCard
                            icon={<Target className="h-3.5 w-3.5" />}
                            label="Accuracy"
                            value={isLoading || !stats || stats.accuracy == null ? '--' : `${stats.accuracy}%`}
                            color="lavender"
                            sticker="petal-plush"
                        />
                    </StaggerItem>
                </div>
            )}

            <nav className="flex flex-col gap-2.5">
                <StaggerItem index={2}>
                    <NavRow href="/play" icon={<Play className="h-5 w-5" />} label="Play" color="blue" />
                </StaggerItem>
                <StaggerItem index={3}>
                    <NavRow href="/add-trivia" icon={<Plus className="h-5 w-5" />} label="Add trivia" color="lavender" />
                </StaggerItem>
                <StaggerItem index={4}>
                    <NavRow href="/leaderboard" icon={<Trophy className="h-5 w-5" />} label="Leaderboard" color="green" />
                </StaggerItem>
                <StaggerItem index={5}>
                    <NavRow href="/profile" icon={<User className="h-5 w-5" />} label="Profile" color="lavender" />
                </StaggerItem>
                <StaggerItem index={6}>
                    <NavRow href="/board" icon={<Grid3x3 className="h-5 w-5" />} label="Board" color="green" />
                </StaggerItem>
            </nav>
        </div>
    )
}