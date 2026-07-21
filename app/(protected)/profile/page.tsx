'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Target, History, Download, Loader2 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { useProfileStats } from '@/hooks/useProfileStats'
import { exportAllData } from '@/lib/export'
import { useIsMounted } from '@/hooks/useIsMounted'
import { FLOAT_TRANSITION } from '@/lib/motion'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { StatCard } from '@/components/ui/StatCard'
import { StaggerItem } from '@/components/ui/StaggerItem'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { WobbleStar } from '@/components/ui/WobbleStar'
import { Squiggle } from '@/components/ui/Squiggle'
import { FlowerDoodle } from '@/components/ui/FlowerDoodle'
import { NavRow } from '@/components/ui/NavRow'

type TitleColor = 'blue' | 'lavender' | 'green' | 'rose'

function getPlayfulTitle(stats: { gamesPlayed: number; accuracy: number | null } | null): {
    label: string
    color: TitleColor
} {
    if (!stats || stats.gamesPlayed === 0 || stats.accuracy === null) {
        return { label: 'Trivia Newbie', color: 'blue' }
    }
    if (stats.accuracy >= 90) return { label: 'Certified Genius', color: 'green' }
    if (stats.accuracy >= 75) return { label: 'Sharp Shooter', color: 'blue' }
    if (stats.accuracy >= 50) return { label: 'Getting There', color: 'lavender' }
    return { label: 'Wildcard Guesser', color: 'rose' }
}

export default function ProfilePage() {
    const isMounted = useIsMounted()
    const { currentProfile } = useProfile()
    const { data: stats, error, isLoading, refetch } = useProfileStats(currentProfile?.id)
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)

    const handleExport = async () => {
        if (isExporting) return
        setIsExporting(true)
        setExportError(null)
        const { error } = await exportAllData()
        if (!isMounted()) return
        setIsExporting(false)
        if (error) setExportError(error)
    }

    if (!currentProfile) return null

    const title = getPlayfulTitle(isLoading ? null : stats)

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
                <FlowerDoodle className="absolute -bottom-3 -left-3 h-12 w-12 -rotate-[8deg] text-changeling/80" />
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
                        <div className="mt-1 flex items-center gap-2">
                            <Squiggle className="text-wild-hillside" width={70} />
                            <Chip color={title.color} className="px-2 py-0.5 text-[10px]">
                                {title.label}
                            </Chip>
                        </div>
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
                        <Card sticker="bowser-shell">
                            <p className="text-xs text-ink-muted">Correct answers</p>
                            <p className="text-2xl font-medium text-ink">
                                {stats && stats.totalQuestions > 0 ? `${stats.totalCorrect} / ${stats.totalQuestions}` : '--'}
                            </p>
                        </Card>
                    </StaggerItem>

                    <StaggerItem index={3}>
                        <NavRow href="/history" icon={<History className="h-5 w-5" />} label="View history" color="lavender" />
                    </StaggerItem>
                </>
            )}

            <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-wild-hillside/40 bg-white p-4 text-sm font-medium text-ink-muted transition-transform active:scale-[0.98] disabled:cursor-not-allowed"
            >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isExporting ? 'Exporting...' : 'Back up your data'}
            </button>
            {exportError && <p className="text-center text-xs text-briar-rose">{exportError}</p>}
        </div>
    )
}