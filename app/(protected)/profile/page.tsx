'use client'

import { motion } from 'framer-motion'
import {BarChart3, Target, History } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { getStatsForProfile } from '@/lib/gameSessions'
import { useAsyncData } from '@/hooks/useAsyncData'
import { FLOAT_TRANSITION } from '@/lib/motion'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StaggerItem } from '@/components/ui/StaggerItem'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { WobbleStar } from '@/components/ui/WobbleStar'
import { Squiggle } from '@/components/ui/Squiggle'
import {NavRow} from "@/components/ui/NavRow";

export default function ProfilePage() {
    const { currentProfile } = useProfile()
    const { data: stats, error, isLoading, refetch } = useAsyncData(
        () => (currentProfile ? getStatsForProfile(currentProfile.id) : Promise.resolve({ data: null, error: null })),
        [currentProfile?.id]
    )

    if (!currentProfile) return null

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <BackButton />

            <div className="relative m-1 mb-1">
                <motion.div
                    className="absolute -right-2 -top-2 h-[68px] w-[68px] rounded-2xl bg-petal-plush"
                    initial={{ rotate: 10 }}
                    animate={{ rotate: 10, y: [0, -4, 0] }}
                    transition={FLOAT_TRANSITION}
                    aria-hidden="true"
                />
                <div className="relative flex items-center gap-4 rounded-2xl border border-wild-hillside/40 bg-white p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marina/10 text-xl font-medium text-marina">
                        {currentProfile.name.charAt(0)}
                    </div>
                    <div>
                        <div className="mb-0.5 flex items-center gap-1.5">
                            <WobbleStar className="h-3 w-3 text-changeling" />
                            <span className="text-xs text-ink-muted">Your profile</span>
                        </div>
                        <h1 className="font-display text-2xl text-ink">{currentProfile.name}</h1>
                        <Squiggle className="mt-1 text-wild-hillside" width={90} />
                    </div>
                </div>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load your stats." onRetry={refetch} />
            ) : (
                <>
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

                    <StaggerItem index={2}>
                        <Card>
                            <p className="text-xs text-ink-muted">Correct answers</p>
                            <p className="text-2xl font-medium text-ink">
                                {stats && stats.totalQuestions > 0 ? `${stats.totalCorrect} / ${stats.totalQuestions}` : '--'}
                            </p>
                        </Card>
                        <NavRow href="/history" icon={<History className="h-5 w-5" />} label="View history" color="lavender" />
                    </StaggerItem>
                </>
            )}
        </div>
    )
}