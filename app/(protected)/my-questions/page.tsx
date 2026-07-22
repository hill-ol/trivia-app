'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { deleteQuestion } from '@/lib/questions'
import { useMyQuestions } from '@/hooks/useMyQuestions'
import { useIsMounted } from '@/hooks/useIsMounted'
import { pointsChipColor } from '@/lib/points'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'

export default function MyQuestionsPage() {
    const isMounted = useIsMounted()
    const { currentProfile } = useProfile()
    const { data: questions, error, isLoading, refetch } = useMyQuestions(currentProfile?.id)

    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null)

    const handleDelete = async (id: string) => {
        if (deletingId) return

        setDeletingId(id)
        const { error } = await deleteQuestion(id)
        if (!isMounted()) return
        setDeletingId(null)

        if (error) {
            setDeleteError({ id, message: error })
            return
        }
        setConfirmingId(null)
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">Your questions</h1>
            </div>

            {error ? (
                <ErrorNotice message="Couldn't load your questions." onRetry={refetch} />
            ) : (
                <>
                    {isLoading && <p className="text-sm text-ink-muted">Loading...</p>}
                    {!isLoading && questions?.length === 0 && (
                        <p className="text-sm text-ink-muted">You haven&apos;t added any questions yet.</p>
                    )}

                    <div className="flex flex-col gap-3">
                        <AnimatePresence initial={false} mode="popLayout">
                            {questions?.map((question) => (
                                <motion.div
                                    key={question.id}
                                    layout
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 24 }}
                                    transition={{ layout: { duration: 0.25, ease: 'easeOut' }, opacity: { duration: 0.2 }, x: { duration: 0.2 } }}
                                >
                                    <Card className="flex flex-col gap-3">
                                        <p className="font-medium text-ink">{question.questionText}</p>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex gap-2">
                                                <Chip color={question.category.color}>{question.category.name}</Chip>
                                                <Chip color={pointsChipColor(question.points)}>{question.points} pts</Chip>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/questions/${question.id}/edit`}
                                                    aria-label="Edit question"
                                                    className="cursor-pointer text-ink-muted hover:text-marina"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <AnimatePresence mode="wait" initial={false}>
                                                {confirmingId === question.id ? (
                                                    <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }} className="flex items-center gap-2 text-xs">
                                                        <span className="text-briar-rose">Delete?</span>
                                                        <button
                                                            onClick={() => handleDelete(question.id)}
                                                            disabled={deletingId === question.id}
                                                            className="flex cursor-pointer items-center gap-1 font-medium text-briar-rose underline disabled:cursor-not-allowed"
                                                        >
                                                            {deletingId === question.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingId(null)}
                                                            disabled={deletingId === question.id}
                                                            className="cursor-pointer text-ink-muted disabled:cursor-not-allowed"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.button
                                                        key="trigger"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                                        onClick={() => setConfirmingId(question.id)}
                                                        aria-label="Delete question"
                                                        className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        {deleteError?.id === question.id && <p className="text-xs text-briar-rose">{deleteError.message}</p>}
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    )
}