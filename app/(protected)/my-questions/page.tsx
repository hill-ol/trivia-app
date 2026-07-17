'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { getQuestionsByAuthor, deleteQuestion } from '@/lib/questions'
import { useAsyncData } from '@/hooks/useAsyncData'
import { pointsChipColor } from '@/lib/points'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Question } from '@/types'

export default function MyQuestionsPage() {
    const { currentProfile } = useProfile()
    const { data: questions, error, isLoading, refetch } = useAsyncData(
        () => (currentProfile ? getQuestionsByAuthor(currentProfile.id) : Promise.resolve({ data: [], error: null })),
        [currentProfile?.id]
    )
    const [localQuestions, setLocalQuestions] = useState<Question[] | null>(null)
    const displayQuestions = localQuestions ?? questions

    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null)

    const handleDelete = async (id: string) => {
        const { error } = await deleteQuestion(id)
        if (error) {
            setDeleteError({ id, message: error })
            return
        }
        setLocalQuestions((prev) => (prev ?? questions ?? []).filter((q) => q.id !== id))
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
                    {!isLoading && displayQuestions?.length === 0 && (
                        <p className="text-sm text-ink-muted">You haven&apos;t added any questions yet.</p>
                    )}

                    <div className="flex flex-col gap-3">
                        <AnimatePresence initial={false} mode="popLayout">
                            {displayQuestions?.map((question) => (
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
                                                <Chip color={pointsChipColor(question.points)}>{question.points}</Chip>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/questions/${question.id}/edit`}
                                                    aria-label="Edit question"
                                                    className="cursor-pointer text-ink-muted hover:text-marina"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                {confirmingId === question.id ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-briar-rose">Delete?</span>
                                                        <button
                                                            onClick={() => handleDelete(question.id)}
                                                            className="cursor-pointer font-medium text-briar-rose underline"
                                                        >
                                                            Yes
                                                        </button>
                                                        <button onClick={() => setConfirmingId(null)} className="cursor-pointer text-ink-muted">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmingId(question.id)}
                                                        aria-label="Delete question"
                                                        className="cursor-pointer text-ink-muted transition-colors hover:text-briar-rose"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
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