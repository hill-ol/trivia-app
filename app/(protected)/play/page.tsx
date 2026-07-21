'use client'

import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { recordAttempt } from '@/lib/questionAttempts'
import { recordSession } from '@/lib/gameSessions'
import { playCorrectChime } from '@/lib/sound'
import { usePlayData } from '@/hooks/usePlayData'
import { usePlaySession } from '@/hooks/usePlaySession'
import { filterQuestions, getEmptyStateMessage, PlayMode } from '@/lib/playFilters'
import { pointsChipColor } from '@/lib/points'
import { CHOICE_TINTS } from '@/lib/choiceTints'
import { Card } from '@/components/ui/Card'
import { Chip, ChipButton } from '@/components/ui/Chip'
import { BackButton } from '@/components/ui/BackButton'
import { CountUp } from '@/components/ui/CountUp'
import { Celebration } from '@/components/ui/Celebration'
import { Tooltip } from '@/components/ui/Tooltip'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Question } from '@/types'
import { cn } from '@/lib/utils'

export default function PlayPage() {
    const { currentProfile } = useProfile()
    const { data: playData, error, isLoading, refetch } = usePlayData(currentProfile?.id)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
    const [mode, setMode] = useState<PlayMode>('new')
    const [showEmptyTooltip, setShowEmptyTooltip] = useState(false)
    const [activeQuestions, setActiveQuestions] = useState<Question[] | null>(null)

    if (activeQuestions) {
        return <PlaySession profileId={currentProfile!.id} questions={activeQuestions} onExit={() => setActiveQuestions(null)} />
    }

    if (!currentProfile || isLoading || !playData) {
        return (
            <div className="flex min-h-screen flex-col gap-6 px-4 py-6">
                <BackButton />
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-ink-muted">Loading...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
                <BackButton />
                <ErrorNotice message="Couldn't load your questions." onRetry={refetch} />
            </div>
        )
    }

    const { questions: allQuestions, answeredIds } = playData

    if (allQuestions.length === 0) {
        return (
            <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
                <div className="flex items-center gap-3">
                    <BackButton />
                    <h1 className="font-display text-2xl text-ink">Play</h1>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    <p className="text-lg font-medium text-ink">No questions yet</p>
                    <p className="text-sm text-ink-muted">Once questions are added for you, they&apos;ll show up here.</p>
                </div>
            </div>
        )
    }

    const categories = Array.from(new Map(allQuestions.map((q) => [q.category.id, q.category])).values())
    const matchingQuestions = filterQuestions(allQuestions, answeredIds, selectedCategoryId, mode)

    const handleStart = () => {
        if (matchingQuestions.length === 0) {
            setShowEmptyTooltip(true)
            setTimeout(() => setShowEmptyTooltip(false), 2000)
            return
        }
        setActiveQuestions(matchingQuestions)
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
            <div className="flex items-center gap-3">
                <BackButton />
                <h1 className="font-display text-2xl text-ink">Play</h1>
            </div>

            <Card className="flex flex-col gap-3">
                <label className="text-xs text-ink-muted">Category</label>
                <div className="flex flex-wrap gap-2">
                    <ChipButton color="blue" selected={selectedCategoryId === null} onClick={() => setSelectedCategoryId(null)}>
                        All categories ({filterQuestions(allQuestions, answeredIds, null, mode).length})
                    </ChipButton>
                    {categories.map((cat) => (
                        <ChipButton
                            key={cat.id}
                            color={cat.color}
                            selected={selectedCategoryId === cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                        >
                            {cat.name} ({filterQuestions(allQuestions, answeredIds, cat.id, mode).length})
                        </ChipButton>
                    ))}
                </div>
            </Card>

            <Card className="flex flex-col gap-3">
                <label className="text-xs text-ink-muted">What to play</label>
                <div className="flex gap-2">
                    <ChipButton color="blue" selected={mode === 'new'} onClick={() => setMode('new')}>
                        New questions
                    </ChipButton>
                    <ChipButton color="lavender" selected={mode === 'repeat'} onClick={() => setMode('repeat')}>
                        Play again
                    </ChipButton>
                </div>
            </Card>

            <div className="relative mt-2">
                <button
                    onClick={handleStart}
                    className={cn(
                        'w-full cursor-pointer rounded-2xl p-4 text-lg font-medium transition-all active:scale-[0.98]',
                        matchingQuestions.length > 0 ? 'bg-marina text-white' : 'bg-wild-hillside/40 text-ink-muted'
                    )}
                >
                    {matchingQuestions.length > 0 ? `Start playing (${matchingQuestions.length})` : 'Start playing'}
                </button>
                <Tooltip
                    show={showEmptyTooltip}
                    message={getEmptyStateMessage(allQuestions, selectedCategoryId, mode)}
                    className="bottom-full left-1/2 mb-2 -translate-x-1/2"
                />
            </div>
        </div>
    )
}

function PlaySession({ profileId, questions, onExit }: { profileId: string; questions: Question[]; onExit: () => void }) {
    const handleAnswer = (question: Question, isCorrect: boolean) => {
        if (isCorrect) playCorrectChime()
        recordAttempt(profileId, question.id, isCorrect).then(({ error }) => {
            if (error) console.error('Failed to record attempt:', error)
        })
    }

    const { state, currentQuestion, score, submitAnswer, nextQuestion } = usePlaySession(questions, handleAnswer)
    const hasRecordedSession = useRef(false)

    useEffect(() => {
        if (state.status === 'finished' && !hasRecordedSession.current && questions.length > 0) {
            hasRecordedSession.current = true
            recordSession(profileId, score, questions.length).then(({ error }) => {
                if (error) console.error('Failed to record session:', error)
            })
        }
    }, [state.status, profileId, score, questions.length])

    if (state.status === 'finished') {
        const isGreatScore = questions.length > 0 && score / questions.length >= 0.8

        return (
            <div className="flex min-h-screen flex-col gap-6 px-4 py-6">
                <BackButton />
                <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    {isGreatScore && <Celebration />}
                    <p className="text-sm text-ink-muted">You&apos;re done</p>
                    <p className="font-display text-4xl text-ink">
                        <CountUp value={score} /> / {questions.length}
                    </p>
                    <button
                        onClick={onExit}
                        className="mt-4 cursor-pointer rounded-2xl bg-marina px-6 py-3 text-sm font-medium text-white active:scale-[0.98]"
                    >
                        Play something else
                    </button>
                </div>
            </div>
        )
    }

    const currentIndex = state.questionIndex

    return (
        <div className="flex min-h-screen flex-col gap-5 px-4 py-6">
            <BackButton />

            <div className="flex justify-center gap-1.5">
                {questions.map((_, i) => (
                    <Star
                        key={i}
                        className={i <= currentIndex ? 'h-4 w-4 text-changeling' : 'h-4 w-4 text-wild-hillside'}
                        fill={i <= currentIndex ? 'currentColor' : 'none'}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <div className="flex gap-2">
                {currentQuestion && (
                    <>
                        <Chip color={currentQuestion.category.color}>{currentQuestion.category.name}</Chip>
                        <Chip color={pointsChipColor(currentQuestion.points)}>{currentQuestion.points} pts</Chip>
                    </>
                )}
            </div>

            <Card className="text-lg font-medium text-ink">{currentQuestion?.questionText}</Card>

            <div className="flex flex-col gap-3">
                {currentQuestion?.choices.map((choice, i) => {
                    const isCorrectChoice = choice === currentQuestion.correctAnswer

                    if (state.status === 'answered') {
                        const isSelected = state.selectedAnswer === choice
                        const tint = CHOICE_TINTS[i % CHOICE_TINTS.length]
                        return (
                            <Card
                                key={choice}
                                className={cn(
                                    'transition-colors duration-200',
                                    isCorrectChoice && 'border-bowser-shell bg-bowser-shell/10 animate-pop',
                                    !isCorrectChoice && isSelected && 'border-briar-rose bg-briar-rose/10 animate-pop',
                                    !isCorrectChoice && !isSelected && `${tint} opacity-50`
                                )}
                            >
                                {choice}
                            </Card>
                        )
                    }

                    return (
                        <Card
                            key={choice}
                            onClick={() => submitAnswer(choice)}
                            className={cn(CHOICE_TINTS[i % CHOICE_TINTS.length], 'cursor-pointer active:scale-[0.98] transition-transform')}
                        >
                            {choice}
                        </Card>
                    )
                })}
            </div>

            {state.status === 'answered' && (
                <button
                    onClick={nextQuestion}
                    className="cursor-pointer rounded-2xl bg-marina p-4 text-lg font-medium text-white active:scale-[0.98] transition-transform"
                >
                    Next
                </button>
            )}
        </div>
    )
}