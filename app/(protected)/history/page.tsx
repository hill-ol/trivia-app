'use client'

import { Check, X } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { getAttemptHistory } from '@/lib/questionAttempts'
import { useAsyncData } from '@/hooks/useAsyncData'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { cn } from '@/lib/utils'

function formatRelativeTime(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(isoString).toLocaleDateString()
}

export default function HistoryPage() {
    const { currentProfile } = useProfile()
    const { data: history, error, isLoading, refetch } = useAsyncData(
        () => (currentProfile ? getAttemptHistory(currentProfile.id) : Promise.resolve({ data: [], error: null })),
        [currentProfile?.id]
    )

    if (!currentProfile) return null

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">History</h1>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load your history." onRetry={refetch} />
            ) : isLoading ? (
                <p className="text-sm text-ink-muted">Loading...</p>
            ) : history && history.length === 0 ? (
                <p className="text-sm text-ink-muted">
                    No games played yet, your history will show up here once you start playing.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {history?.map((item) => (
                        <Card key={item.id} className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                    item.isCorrect ? 'bg-bowser-shell/10 text-bowser-shell' : 'bg-briar-rose/10 text-briar-rose'
                                )}
                            >
                                {item.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-ink">{item.questionText}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Chip color={item.category.color} className="px-2 py-0.5 text-[10px]">
                                        {item.category.name}
                                    </Chip>
                                    <span className="text-xs text-ink-muted">{formatRelativeTime(item.answeredAt)}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}