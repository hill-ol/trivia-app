'use client'

import { useEffect, useRef, useState } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { getQuestionsForProfile } from '@/lib/questions'
import { recordSession } from '@/lib/gameSessions'
import { usePlaySession } from '@/hooks/usePlaySession'
import { Card } from '@/components/ui/Card'
import { Question } from '@/types'

export default function PlayPage() {
    const { currentProfile } = useProfile()
    const [questions, setQuestions] = useState<Question[] | null>(null)

    useEffect(() => {
        if (!currentProfile) return
        getQuestionsForProfile(currentProfile.id).then(setQuestions)
    }, [currentProfile])

    if (!currentProfile || questions === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        )
    }

    return <PlaySession profileId={currentProfile.id} questions={questions} />
}

function PlaySession({ profileId, questions }: { profileId: string; questions: Question[] }) {
    const { state, currentQuestion, score, submitAnswer, nextQuestion } = usePlaySession(questions)
    const hasRecorded = useRef(false)

    useEffect(() => {
        if (state.status === 'finished' && !hasRecorded.current && questions.length > 0) {
            hasRecorded.current = true
            recordSession(profileId, score, questions.length).then(({ error }) => {
                if (error) console.error('Failed to record session:', error)
            })
        }
    }, [state.status, profileId, score, questions.length])

    if (questions.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-lg font-medium">No questions yet</p>
                <p className="text-sm text-gray-500">
                    Once questions are added for you, they&apos;ll show up here.
                </p>
            </div>
        )
    }

    if (state.status === 'finished') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm text-gray-500">You&apos;re done</p>
                <p className="text-3xl font-semibold">
                    {score} / {questions.length}
                </p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 px-6 py-10">
            <p className="text-sm text-gray-500">
                Question {state.questionIndex + 1} of {questions.length}
            </p>

            <Card className="text-lg font-medium">{currentQuestion?.questionText}</Card>

            <div className="flex flex-col gap-3">
                {currentQuestion?.choices.map((choice) => {
                    const isCorrectChoice = choice === currentQuestion.correctAnswer

                    if (state.status === 'answered') {
                        const isSelected = state.selectedAnswer === choice
                        return (
                            <Card
                                key={choice}
                                className={
                                    isCorrectChoice
                                        ? 'border-green-500 bg-green-50'
                                        : isSelected
                                            ? 'border-red-500 bg-red-50'
                                            : ''
                                }
                            >
                                {choice}
                            </Card>
                        )
                    }

                    return (
                        <Card
                            key={choice}
                            onClick={() => submitAnswer(choice)}
                            className="active:scale-[0.98] transition-transform"
                        >
                            {choice}
                        </Card>
                    )
                })}
            </div>

            {state.status === 'answered' && (
                <button
                    onClick={nextQuestion}
                    className="rounded-2xl bg-gray-900 p-4 text-lg font-medium text-white"
                >
                    Next
                </button>
            )}
        </div>
    )
}