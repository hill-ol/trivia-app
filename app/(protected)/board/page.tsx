'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { getPlayData } from '@/lib/questions'
import { recordAttempt } from '@/lib/questionAttempts'
import { recordSession } from '@/lib/gameSessions'
import { playCorrectChime } from '@/lib/sound'
import { useAsyncData } from '@/hooks/useAsyncData'
import { buildBoard } from '@/lib/board'
import { pointsChipColor } from '@/lib/points'
import { CHOICE_TINTS } from '@/lib/choiceTints'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { BackButton } from '@/components/ui/BackButton'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { WobbleStar } from '@/components/ui/WobbleStar'
import { Squiggle } from '@/components/ui/Squiggle'
import { StaggerItem } from '@/components/ui/StaggerItem'
import { Celebration } from '@/components/ui/Celebration'
import { Question } from '@/types'
import { cn } from '@/lib/utils'

const TILE_STYLES: Record<'blue' | 'lavender' | 'green' | 'rose', string> = {
    blue: 'border-marina bg-marina/5 text-marina-deep',
    lavender: 'border-petal-plush bg-petal-plush/5 text-petal-plush-deep',
    green: 'border-bowser-shell bg-bowser-shell/5 text-bowser-shell',
    rose: 'border-briar-rose bg-briar-rose/5 text-briar-rose',
}

const CATEGORY_HEADER_STYLES: Record<'blue' | 'lavender' | 'green' | 'rose', string> = {
    blue: 'bg-marina text-white',
    lavender: 'bg-petal-plush text-white',
    green: 'bg-bowser-shell text-white',
    rose: 'bg-briar-rose text-white',
}

export default function BoardPage() {
    const { currentProfile } = useProfile()
    const { data: playData, error, isLoading, refetch } = useAsyncData(
        () =>
            currentProfile
                ? getPlayData(currentProfile.id)
                : Promise.resolve({ data: { questions: [], answeredIds: new Set<string>() }, error: null }),
        [currentProfile?.id]
    )
    const [localAnsweredIds, setLocalAnsweredIds] = useState<Set<string> | null>(null)
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
    const [showBoardCelebration, setShowBoardCelebration] = useState(false)

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
                <ErrorNotice message="Couldn't load the board." onRetry={refetch} />
            </div>
        )
    }

    const answeredIds = localAnsweredIds ?? playData.answeredIds
    const board = buildBoard(playData.questions)
    const boardQuestionIds = board
        .flatMap((column) => column.cells.map((cell) => cell.question?.id))
        .filter((id): id is string => !!id)

    return (
        <div style={{ perspective: 1000 }}>
            <AnimatePresence mode="wait">
                {activeQuestion ? (
                    <motion.div
                        key="tile"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <BoardTile
                            profileId={currentProfile.id}
                            question={activeQuestion}
                            onDone={(questionId) => {
                                const updated = new Set([...answeredIds, questionId])
                                setLocalAnsweredIds(updated)
                                setActiveQuestion(null)
                                if (boardQuestionIds.length > 0 && boardQuestionIds.every((id) => updated.has(id))) {
                                    setShowBoardCelebration(true)
                                }
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
                            <div className="flex items-center gap-3">
                                <BackButton />
                                <div>
                                    <div className="mb-0.5 flex items-center gap-1.5">
                                        <WobbleStar className="h-3 w-3 text-changeling" />
                                        <span className="text-xs text-ink-muted">Pick a tile</span>
                                    </div>
                                    <h1 className="font-display text-2xl text-ink">Board</h1>
                                    <Squiggle className="mt-1 text-wild-hillside" width={70} />
                                </div>
                            </div>

                            {board.length === 0 ? (
                                <p className="text-sm text-ink-muted">No questions yet, ask your partner to add some.</p>
                            ) : (
                                <div className="relative">
                                    <div className="overflow-x-auto pb-2">
                                        <div className="mx-auto flex w-fit gap-1.5 rounded-2xl border border-wild-hillside/50 bg-wild-hillside/10 p-2">
                                            {board.map((column, columnIndex) => (
                                                <StaggerItem key={column.category.id} index={columnIndex}>
                                                    <div className="flex w-[104px] flex-col gap-2.5">
                                                        <div
                                                            className={cn(
                                                                'flex h-12 items-center justify-center rounded-lg px-1 text-center text-xs font-semibold leading-tight',
                                                                CATEGORY_HEADER_STYLES[column.category.color]
                                                            )}
                                                        >
                                                            {column.category.name}
                                                        </div>
                                                        {column.cells.map((cell) => {
                                                            const isAnswered = cell.question !== null && answeredIds.has(cell.question.id)
                                                            const isEmpty = cell.question === null

                                                            return (
                                                                <button
                                                                    key={cell.points}
                                                                    disabled={isEmpty || isAnswered}
                                                                    onClick={() => cell.question && setActiveQuestion(cell.question)}
                                                                    className={cn(
                                                                        'relative flex h-14 cursor-pointer items-center justify-center rounded-lg border text-lg font-semibold transition-transform active:scale-[0.96] disabled:cursor-default',
                                                                        isEmpty && 'border-wild-hillside/20 bg-wild-hillside/5 text-wild-hillside/40',
                                                                        isAnswered && 'border-bowser-shell/20 bg-bowser-shell/5 text-bowser-shell/40',
                                                                        !isEmpty && !isAnswered && TILE_STYLES[pointsChipColor(cell.points)]
                                                                    )}
                                                                >
                                                                    {isEmpty ? '—' : cell.points}
                                                                    {isAnswered && (
                                                                        <motion.div
                                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                                            animate={{ scale: 1, opacity: 1 }}
                                                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                                            className="absolute -right-1.5 -top-2"
                                                                        >
                                                                            <Check className="h-4 w-4 rounded-full bg-bowser-shell p-0.5 text-white" />
                                                                        </motion.div>
                                                                    )}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </StaggerItem>
                                            ))}
                                        </div>
                                    </div>
                                    {showBoardCelebration && <Celebration />}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function BoardTile({
                       profileId,
                       question,
                       onDone,
                   }: {
    profileId: string
    question: Question
    onDone: (questionId: string) => void
}) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

    const handleSelect = (choice: string) => {
        if (selectedAnswer !== null) return
        setSelectedAnswer(choice)
        const isCorrect = choice === question.correctAnswer
        if (isCorrect) playCorrectChime()
        recordAttempt(profileId, question.id, isCorrect).then(({ error }) => {
            if (error) console.error('Failed to record attempt:', error)
        })
        recordSession(profileId, isCorrect ? 1 : 0, 1).then(({ error }) => {
            if (error) console.error('Failed to record session:', error)
        })
    }

    return (
        <div className="flex min-h-screen flex-col gap-5 px-4 py-6">
            <button
                onClick={() => onDone(question.id)}
                aria-label="Back to board"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-wild-hillside/40 bg-white"
            >
                <ChevronLeft className="h-4 w-4 text-ink" />
            </button>

            <div className="flex gap-2">
                <Chip color={question.category.color}>{question.category.name}</Chip>
                <Chip color={pointsChipColor(question.points)}>{question.points} pts</Chip>
            </div>

            <Card className="text-lg font-medium text-ink">{question.questionText}</Card>

            <div className="flex flex-col gap-3">
                {question.choices.map((choice, i) => {
                    const isCorrectChoice = choice === question.correctAnswer
                    const isSelected = selectedAnswer === choice

                    if (selectedAnswer !== null) {
                        return (
                            <Card
                                key={choice}
                                className={cn(
                                    'transition-colors duration-200',
                                    isCorrectChoice && 'border-bowser-shell bg-bowser-shell/10 animate-pop',
                                    !isCorrectChoice && isSelected && 'border-briar-rose bg-briar-rose/10 animate-pop'
                                )}
                            >
                                {choice}
                            </Card>
                        )
                    }

                    return (
                        <Card
                            key={choice}
                            onClick={() => handleSelect(choice)}
                            className={cn(CHOICE_TINTS[i % CHOICE_TINTS.length], 'cursor-pointer active:scale-[0.98] transition-transform')}
                        >
                            {choice}
                        </Card>
                    )
                })}
            </div>

            {selectedAnswer !== null && (
                <button
                    onClick={() => onDone(question.id)}
                    className="cursor-pointer rounded-2xl bg-marina p-4 text-lg font-medium text-white active:scale-[0.98] transition-transform"
                >
                    Back to board
                </button>
            )}
        </div>
    )
}